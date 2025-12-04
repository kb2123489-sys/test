
import { AnalysisResult, AnalysisMode } from "../types";

/**
 * Parses the structured text response into a usable object.
 */
const parseResponse = (text: string): { title: string; summary: string; impacts: string[]; historicalContext: string } => {
  const sections = {
    title: '',
    summary: '',
    impacts: [] as string[],
    historicalContext: '',
  };

  const titleMatch = text.match(/\[TITLE\]\s*(.*?)\s*(?=\[SUMMARY\]|$)/s);
  const summaryMatch = text.match(/\[SUMMARY\]\s*(.*?)\s*(?=\[IMPACT\]|$)/s);
  const impactMatch = text.match(/\[IMPACT\]\s*(.*?)\s*(?=\[HISTORY\]|$)/s);
  const historyMatch = text.match(/\[HISTORY\]\s*(.*?)\s*(?=$)/s);

  if (titleMatch) sections.title = titleMatch[1].trim();
  if (summaryMatch) sections.summary = summaryMatch[1].trim();
  
  if (impactMatch) {
    const rawImpacts = impactMatch[1].split('\n').map(line => line.trim()).filter(line => line.length > 0);
    sections.impacts = rawImpacts.map(line => line.replace(/^[-*•]\s*/, ''));
  }

  if (historyMatch) sections.historicalContext = historyMatch[1].trim();

  return sections;
};

export const analyzeEvent = async (query: string, mode: AnalysisMode): Promise<AnalysisResult> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, mode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsedData = parseResponse(data.rawText);

    return {
      rawText: data.rawText,
      parsed: parsedData,
      sources: data.sources || [],
    };

  } catch (error: any) {
    console.error("Error analyzing event:", error);
    throw error;
  }
};

export const getTrendingTopics = async (): Promise<string[]> => {
  try {
    const response = await fetch("/api/trending");
    if (!response.ok) return [];
    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.warn("Failed to fetch trending topics:", error);
    return [];
  }
};
