
import { GoogleGenAI } from "@google/genai";
import { BharatCampaign } from "../types";
import { BHARAT_BRANDS } from "../constants";

// Helper to select 5 random brands
const getRandomBrands = (count: number): string[] => {
    // Simple shuffle
    const shuffled = [...BHARAT_BRANDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const scanMarket = async (
    existingUrls: string[],
    onStatusUpdate?: (status: string) => void
): Promise<BharatCampaign[]> => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const selectedBrands = getRandomBrands(5);
    const brandListString = selectedBrands.join(", ");

    const promptText = `
    Conduct a STRICT factual market intelligence scan for these Indian brands: ${brandListString}.
    
    SEARCH & VERIFICATION RULES:
    1. SEARCH: Look for real marketing/news from the last 30 days (Feb 19, 2026 - Jan 19, 2026).
    2. ZERO GUESSING: If no news is found for a brand, return "No recent news found" in the campaignName field and "-" for other fields. 
    3. LINK INTEGRITY: You MUST return the EXACT URL provided in the search metadata citation. DO NOT speculate or 'predict' URLs.
    4. TEST CASE (MANDATORY): Verify the "Flipkart sponsorship of Namibia Cricket" - this is a real recent event. If you cannot find it, your search tool is failing.
    
    SEARCH PARAMETERS:
    - Target: "Bharat" (Tier 2/3 cities) marketing, sponsorships, or platform expansions.
    - Focus: Creative campaigns, not just profit reports.

    OUTPUT FORMAT (Raw JSON Array ONLY):
    [
      {
        "brand": "String",
        "campaignName": "Exact Slogan or 'No recent news found'",
        "angle": "Categorical Angle or '-'",
        "strategicWhy": "Factual rationale or '-'",
        "zoopActionability": "Logic for Zoop or '-'",
        "culturalPotential": "Trend analysis or '-'",
        "sourceUrl": "EXACT_CITATION_URL"
      }
    ]
  `;

    const runScan = async (modelName: string, apiVer: string): Promise<any[]> => {
        const ai = new GoogleGenAI({ apiKey, apiVersion: apiVer as any });
        const response = await (ai.models as any).generateContent({
            model: modelName,
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            tools: [{ google_search_retrieval: {} }],
            generationConfig: {
                temperature: 0.0,
            }
        });

        const responseText = response.text || (response as any).text?.() || "";
        if (!responseText) throw new Error("EMPTY_RESPONSE");

        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        if (!Array.isArray(parsed)) throw new Error("AI did not return an array");
        return parsed;
    };

    let attempts = 0;
    while (attempts < 3) {
        try {
            // Attempt 1: Gemini 3 Flash Preview (v1beta)
            return (await runScan("gemini-3-flash-preview", "v1beta")).map(c => ({
                id: crypto.randomUUID(),
                brand: c.brand || "Unknown Brand",
                campaignName: c.campaignName || "Unknown Campaign",
                angle: c.angle || "N/A",
                strategicWhy: c.strategicWhy || "N/A",
                zoopActionability: c.zoopActionability || "N/A",
                culturalPotential: c.culturalPotential || "N/A",
                sourceUrl: c.sourceUrl || "#",
                dateFound: new Date().toISOString()
            }));
        } catch (error: any) {
            const is503 = error.message?.includes('503') || error.status === 503;

            if (is503 && attempts === 0) {
                console.warn("Gemini 3 overloaded. Falling back to Gemini 2.5...");
                onStatusUpdate?.("Gemini 3 busy... falling back to 2.5 for stability");
                attempts++;
                try {
                    // Attempt 2: Gemini 2.5 Flash (v1)
                    return (await runScan("gemini-2.5-flash", "v1")).map(c => ({
                        id: crypto.randomUUID(),
                        brand: c.brand || "Unknown Brand",
                        campaignName: c.campaignName || "Unknown Campaign",
                        angle: c.angle || "N/A",
                        strategicWhy: c.strategicWhy || "N/A",
                        zoopActionability: c.zoopActionability || "N/A",
                        culturalPotential: c.culturalPotential || "N/A",
                        sourceUrl: c.sourceUrl || "#",
                        dateFound: new Date().toISOString()
                    }));
                } catch (fallbackError: any) {
                    const isFallback503 = fallbackError.message?.includes('503') || fallbackError.status === 503;
                    if (isFallback503) {
                        attempts++;
                        onStatusUpdate?.("Both models overloaded. Backing off for 5 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        continue; // Try final attempt in the loop
                    }
                    throw fallbackError;
                }
            } else if (is503 && attempts < 2) {
                attempts++;
                onStatusUpdate?.("Exponential backoff... final retry initiated");
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            throw error;
        }
    }

    throw new Error("Maximum retries reached. Bharat Ecosystem remains unreachable.");
};
