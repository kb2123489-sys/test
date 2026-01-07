/**
 * NetPulse Cloudflare Worker - 多语言版本 (修复版)
 * 修复：trending 话题按语言分别缓存
 */

// 缓存结构 - 按语言分别缓存
let trendingCacheZh = null;
let trendingCacheEn = null;
const CACHE_TTL = 3600 * 1000; // 1 hour

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// ============================================
// 多语言 Prompt 模板
// ============================================
const PROMPTS = {
  zh: {
    role: "你是一位资深的科技记者和历史学家。",
    task: (query) => `任务：基于提供的【参考资料】，研究并分析用户的查询："${query}"。`,
    format: `【输出要求】：
严格遵循以下格式。不要使用 Markdown 标题符号 (#)。所有内容使用简体中文。

[TITLE] 
(简短标题)

[SUMMARY] 
(摘要，最多3句话)

[IMPACT] 
(3-4个主要影响，列表形式)

[HISTORY] 
(与历史事件对比)`,
    noResult: "未生成分析结果。",
    trendingPrompt: (context) => `基于以下新闻标题：
${context}

列出4个简短、有吸引力的话题标题，使用简体中文。仅输出4个标题，每行一个，不要编号。`
  },
  en: {
    role: "You are a veteran tech journalist and historian.",
    task: (query) => `Task: Based on the provided [Reference Material], research and analyze the user's query: "${query}".`,
    format: `[Output Requirements]:
Strictly follow the format below. Do not use Markdown headings (#). All content must be in English.

[TITLE] 
(A concise title)

[SUMMARY] 
(A summary of max 3 sentences)

[IMPACT] 
(3-4 key impacts in a list format)

[HISTORY] 
(Comparison with historical events)`,
    noResult: "No analysis result generated.",
    trendingPrompt: (context) => `Based on these news titles:
${context}

List 4 short, catchy topic titles in English. Output ONLY the 4 titles separated by newlines. No numbering.`
  }
};

// 默认热门话题（按语言）
const DEFAULT_TOPICS = {
  zh: ["最新科技趋势", "AI模型更新", "网络安全", "全球互联网"],
  en: ["Latest Tech Trends", "AI Model Updates", "Cybersecurity", "Global Internet"]
};

// ============================================
// 主入口
// ============================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 1. 处理 CORS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 2. API 路由: POST /api/analyze
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      return handleAnalyze(request, env);
    }
    
    // 3. API 路由: GET /api/trending
    if (url.pathname === "/api/trending" && request.method === "GET") {
      return handleTrending(request, env);
    }
    
    // 4. 静态资源（默认）
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404 && url.pathname.endsWith("favicon.ico")) {
        return new Response(null, { status: 404 });
      }
      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  }
};

// ============================================
// 分析接口处理函数
// ============================================
async function handleAnalyze(request, env) {
  try {
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    const tavilyKey = env.VITE_TAVILY_API_KEY || env.TAVILY_API_KEY;
    
    if (!geminiKey || !tavilyKey) {
      const missing = [];
      if (!geminiKey) missing.push("GEMINI_API_KEY");
      if (!tavilyKey) missing.push("TAVILY_API_KEY");
      return new Response(JSON.stringify({
        error: `Server-side configuration error: Missing keys (${missing.join(", ")})`
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    // 解析请求体，获取 query, mode, lang
    const reqBody = await request.json();
    const query = reqBody.query;
    const mode = reqBody.mode || "deep";
    const lang = reqBody.lang === 'en' ? 'en' : 'zh';
    
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // 模型选择
    const modelId = mode === "fast" ? "gemini-2.5-flash" : "gemini-3-pro-preview";
    
    // --- Step 1: 调用 Tavily 搜索 API ---
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: "basic",
        include_answer: false,
        max_results: mode === "fast" ? 4 : 6
      })
    });
    
    if (!tavilyResponse.ok) {
      const errText = await tavilyResponse.text();
      console.error("Tavily Error:", errText);
      throw new Error("Search service unavailable.");
    }
    
    const tavilyData = await tavilyResponse.json();
    const searchResults = tavilyData.results || [];
    
    // 构建上下文字符串
    const contextString = searchResults.map(
      (r, index) => `Source ${index + 1}:
Title: ${r.title}
URL: ${r.url}
Content: ${r.content}`
    ).join("\n\n");
    
    // --- Step 2: 根据语言选择 Prompt 模板 ---
    const promptTemplate = PROMPTS[lang];
    const prompt = `
${promptTemplate.role}
${promptTemplate.task(query)}

【参考资料】(Reference Material):
${contextString}

${promptTemplate.format}
`;
    
    // --- Step 3: 调用 Gemini API ---
    const proxyBaseUrl = "https://api.zxvmax.com";
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
    
    const geminiData = await geminiResponse.json();
    const text = geminiData.choices?.[0]?.message?.content || promptTemplate.noResult;
    
    // 构建来源列表
    const sources = searchResults.map((r) => ({
      uri: r.url,
      title: r.title
    }));
    
    return new Response(JSON.stringify({ rawText: text, sources }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Worker Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// ============================================
// 热门话题接口处理函数 (修复：按语言分别缓存)
// ============================================
async function handleTrending(request, env) {
  try {
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'zh';
    const now = Date.now();
    
    // 根据语言选择对应的缓存
    const cache = lang === 'zh' ? trendingCacheZh : trendingCacheEn;
    
    // 检查缓存是否有效
    if (cache && now - cache.timestamp < CACHE_TTL) {
      console.log(`[Trending] Returning cached topics for lang=${lang}`);
      return new Response(JSON.stringify({ topics: cache.topics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log(`[Trending] Fetching fresh topics for lang=${lang}`);
    
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    const tavilyKey = env.VITE_TAVILY_API_KEY || env.TAVILY_API_KEY;
    
    if (!geminiKey || !tavilyKey) {
      console.error("[Trending] Missing API keys");
      return new Response(JSON.stringify({ topics: DEFAULT_TOPICS[lang] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // 获取科技新闻
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: "important tech news today",
        topic: "news",
        days: 1,
        max_results: 5
      })
    });
    
    if (!tavilyResponse.ok) {
      console.error("[Trending] Tavily request failed");
      return new Response(JSON.stringify({ topics: DEFAULT_TOPICS[lang] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const tavilyData = await tavilyResponse.json();
    const results = tavilyData.results || [];
    const context = results.map((r) => r.title).join("\n");
    
    // 根据语言生成话题
    const proxyBaseUrl = "https://api.zxvmax.com";
    const promptTemplate = PROMPTS[lang];
    
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
          content: promptTemplate.trendingPrompt(context)
        }],
        stream: false
      })
    });
    
    if (!geminiResponse.ok) {
      console.error("[Trending] Gemini request failed");
      return new Response(JSON.stringify({ topics: DEFAULT_TOPICS[lang] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const geminiData = await geminiResponse.json();
    const content = geminiData.choices?.[0]?.message?.content || "";
    const topics = content.split("\n").map((t) => t.trim()).filter((t) => t.length > 0).slice(0, 4);
    
    if (topics.length > 0) {
      // 根据语言更新对应的缓存
      const newCache = { topics, timestamp: now };
      if (lang === 'zh') {
        trendingCacheZh = newCache;
      } else {
        trendingCacheEn = newCache;
      }
      console.log(`[Trending] Cached ${topics.length} topics for lang=${lang}`);
    } else {
      return new Response(JSON.stringify({ topics: DEFAULT_TOPICS[lang] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Trending Error:", error);
    const url = new URL(request.url);
    const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'zh';
    return new Response(JSON.stringify({ topics: DEFAULT_TOPICS[lang] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
