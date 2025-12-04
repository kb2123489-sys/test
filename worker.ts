
interface Env {
  VITE_GEMINI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  VITE_TAVILY_API_KEY?: string;
  TAVILY_API_KEY?: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

// Simple in-memory cache for trending topics (Global scope persists across some requests in Workers)
let trendingCache: { topics: string[]; timestamp: number } | null = null;
const CACHE_TTL = 3600 * 1000; // 1 Hour

// Standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. API Route: POST /api/analyze
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      return handleAnalyze(request, env);
    }

    // 3. API Route: GET /api/trending
    if (url.pathname === "/api/trending" && request.method === "GET") {
      return handleTrending(request, env);
    }

    // 4. Serve Static Assets (Default)
    // Wrap in try-catch to prevent 500 errors if asset is missing or favicon fails
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && url.pathname.endsWith('favicon.ico')) {
        return new Response(null, { status: 404 }); // Silent 404 for favicon
      }
      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};

async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  try {
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    const tavilyKey = env.VITE_TAVILY_API_KEY || env.TAVILY_API_KEY;
    
    if (!geminiKey || !tavilyKey) {
      const missing = [];
      if (!geminiKey) missing.push("VITE_GEMINI_API_KEY");
      if (!tavilyKey) missing.push("VITE_TAVILY_API_KEY");
      return new Response(JSON.stringify({ 
        error: `Server-side configuration error: Missing keys (${missing.join(", ")})` 
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const reqBody: any = await request.json();
    const query = reqBody.query;
    const mode = reqBody.mode || 'deep'; // 'fast' or 'deep'

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Model Selection
    // Fast mode: gemini-2.5-flash
    // Deep mode: gemini-3-pro-preview
    const modelId = mode === 'fast' ? 'gemini-2.5-flash' : 'gemini-3-pro-preview';

    // --- Step 1: Search Tavily ---
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: query,
        search_depth: "basic",
        include_answer: false,
        max_results: mode === 'fast' ? 4 : 6, // Less context for fast mode
      }),
    });

    if (!tavilyResponse.ok) throw new Error("Search service unavailable.");

    const tavilyData: any = await tavilyResponse.json();
    const searchResults = tavilyData.results || [];

    // --- Step 2: Construct Prompt ---
    const contextString = searchResults.map((r: TavilySearchResult, index: number) => 
      `Source ${index + 1}:\nTitle: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`
    ).join("\n\n");

    const prompt = `
    你是一位资深的科技记者和历史学家。
    任务：基于提供的【参考资料】，研究并分析用户的查询："${query}"。
    
    【参考资料】：
    ${contextString}
    
    【输出要求】：
    严格遵循以下格式。不要使用 Markdown 标题符号 (#)。所有内容使用简体中文。
    
    [TITLE] 
    (简短标题)
    
    [SUMMARY] 
    (摘要，最多3句话)
    
    [IMPACT] 
    (3-4个主要影响，列表形式)
    
    [HISTORY] 
    (与历史事件对比)
    `;

    // --- Step 3: Call Gemini Proxy (OpenAI Format) ---
    const proxyBaseUrl = "https://0rzz.ggff.net";
    const geminiUrl = `${proxyBaseUrl}/v1/chat/completions`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${geminiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        stream: false
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(`Gemini Proxy Error (${modelId}): ${errText}`);
      throw new Error(`AI Analysis unavailable (${modelId}).`);
    }

    const geminiData: any = await geminiResponse.json();
    const text = geminiData.choices?.[0]?.message?.content || "未生成分析结果。";

    const sources = searchResults.map((r: TavilySearchResult) => ({
      uri: r.url,
      title: r.title
    }));

    return new Response(JSON.stringify({ rawText: text, sources: sources }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Worker Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

async function handleTrending(request: Request, env: Env): Promise<Response> {
  try {
    // 1. Check Cache
    const now = Date.now();
    if (trendingCache && (now - trendingCache.timestamp < CACHE_TTL)) {
      return new Response(JSON.stringify({ topics: trendingCache.topics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    const tavilyKey = env.VITE_TAVILY_API_KEY || env.TAVILY_API_KEY;

    if (!geminiKey || !tavilyKey) throw new Error("Missing keys for trending.");

    // 2. Fetch Tech News from Tavily
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: "important tech news today",
        topic: "news",
        days: 1,
        max_results: 5
      }),
    });
    const tavilyData: any = await tavilyResponse.json();
    const results = tavilyData.results || [];
    const context = results.map((r: any) => r.title).join("\n");

    // 3. Summarize with Gemini (Always use Fast model for this)
    const proxyBaseUrl = "https://0rzz.ggff.net";
    const geminiResponse = await fetch(`${proxyBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${geminiKey}`
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash", 
        messages: [{ 
          role: "user", 
          content: `Based on these news titles:\n${context}\n\nList 4 short, catchy topic titles in Simplified Chinese. Output ONLY the 4 titles separated by newlines. No numbering.` 
        }],
        stream: false
      })
    });
    
    const geminiData: any = await geminiResponse.json();
    const content = geminiData.choices?.[0]?.message?.content || "";
    const topics = content.split('\n').map((t: string) => t.trim()).filter((t: string) => t.length > 0).slice(0, 4);

    if (topics.length > 0) {
      trendingCache = { topics, timestamp: now };
    } else {
      // Fallback
      return new Response(JSON.stringify({ topics: ["最新科技趋势", "AI模型更新", "网络安全", "全球互联网"] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Trending Error:", error);
    // Return empty list so frontend falls back to hardcoded presets
    return new Response(JSON.stringify({ topics: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
