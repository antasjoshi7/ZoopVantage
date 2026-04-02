
import { GoogleGenAI } from "@google/genai";
import { AdDetail, AIInsight, MasterInsight, Campaign } from "../types";
import { getAdVideoUrl, getAdScript } from "./creativeService";

// Helper to fetch video and convert to base64
const fetchVideoAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper for parsing
const parseField = (text: string, header: string): string => {
  // Regex to match Header: Value
  // Matches:
  // 1. Optional ** or ##
  // 2. Header Name (case insensitive)
  // 3. Optional ** or ##
  // 4. Colon :
  // 5. Capture the value until the next newline that looks like a header or End of String
  const regex = new RegExp(`(?:\\*\\*|##|\\*|^)\\s*${header}\\s*(?:\\*\\*|##|\\*|:)?\\s*:?\\s*([\\s\\S]*?)(?=\\n(?:\\*\\*|##|\\*|^)\\s*[A-Z][a-zA-Z ]+\\s*(?:\\*\\*|##|\\*|:)?\\s*:|$)`, 'im');

  const match = text.match(regex);
  if (!match) return "N/A";

  let value = match[1].trim();

  // Clean up common "Bucket X" or markdown artifacts in the value
  value = value.replace(/Bucket \d+:/i, '').trim();
  value = value.replace(/\*\*/g, '').trim();

  return value;
};

export const getAdInsight = async (ad: AdDetail & { campaignName: string }): Promise<AIInsight> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("AUTHENTICATION_ERROR: Missing or invalid API Key");
  }

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta'
  });

  const videoUrl = getAdVideoUrl(ad.adName);
  const script = getAdScript(ad.adName);

  let inlineData: any = null;
  if (videoUrl) {
    try {
      const base64Video = await fetchVideoAsBase64(videoUrl);
      inlineData = {
        inlineData: {
          data: base64Video,
          mimeType: "video/mp4"
        }
      };
    } catch (e) {
      console.warn("Could not load video for AI analysis, falling back to script only", e);
    }
  }
  const promptText = `Analyze this specific Meta Ad for Zoop India using the STANDARDIZED FRAMEWORK below.
  
  TARGET PERSONA (ICP): 
  - Female fashion resellers/boutique owners (Tier 2+ cities in India, 35-55 yrs).
  - Motivations: Financial independence, community status, supporting their family.

  ANALYSIS GUARDRAIL (STRICT):
  - You must ONLY use information explicitly present in the provided video file and the "SCRIPT/TRANSCRIPT REFERENCE" below.
  - **CRITICAL: ALL OUTPUT MUST BE IN ENGLISH.** If the video audio is in Hindi, Gujarati, Bengali, or any other language, you MUST translate the analysis and the internal monologue into ENGLISH.
  - Do NOT provide insights in the native language. 

  AD DATA:
  - Ad Name: ${ad.adName}
  - Hook Rate: ${(ad.hookRate * 100).toFixed(1)}%
  - Spend: ₹${ad.spend}
  - Timestamp: ${new Date().toISOString()}

  SCRIPT/TRANSCRIPT REFERENCE:
  """
  ${script}
  """

  STANDARDIZED BUCKETS (STRICT SELECTION):
  For each bucket, you must select EXACTLY ONE option. No other text.
  
  *NOTE: This ad may be a regional translation of a core video. Focus on the dominant visual style and script structure. Do not let language nuances shift the 'Production Vibe' or 'Hook Type' if the core creative execution is the same.*

  Bucket 1: Hook Type
  - Money-Led (Mentioning profit/income)
  - Loud Exclaim (High energy/shouting/clapping)
  - Bizarre Statement (Challenging common sense)
  - Inquisitiveness (Asking a direct question to the viewer)
  - Pattern Interruption (Unexpected visual/weird angle)
  - Other (Only if absolutely necessary)

  Bucket 2: Production Vibe
  - Raw/UGC (Looks like a friend's post, handheld/selfie)
  - Heavily Edited (Lots of text overlays, fast cuts, B-roll)
  - Foundational (Direct-to-camera, basic setting/studio-like)

  Bucket 3: Video Length Category
  - Short Snappy (<15s)
  - The Explainer (15s - 45s)
  - The Narrative (>45s)

  Bucket 4: Primary Emotional Angle
  - Relief (Ending a struggle)
  - Fear/FOMO (Missing an opportunity)
  - Aspirational (Leveling up life/status)
  - Trust/Peer (Relatability and honesty)

  CRITICAL OUTPUT FORMAT:
  The output MUST be plain text with these exact headers.
  Do NOT include "Bucket 1", "Bucket 2" etc in the output lines. Just the Header and the Value.
  Do NOT use markdown bolding (**).

  Title: [Short snappy title in ENGLISH]
  Type: [success/warning/info]
  Content: [Internal monologue of the ICP in ENGLISH - Concise and grounded in REAL content. Translate if needed.]
  Hook Type: [Select ONE from Bucket 1]
  Production Vibe: [Select ONE from Bucket 2]
  Video Length Category: [Select ONE from Bucket 3]
  Primary Emotional Angle: [Select ONE from Bucket 4]
  Strategic Why: [Brief sentence in ENGLISH on why this works/fails]
  Background Analysis: [Brief technical context in ENGLISH]
  Recommendation: [One actionable instruction in ENGLISH]`;

  const modelId = "gemini-3-flash-preview";

  const callApi = async () => {
    const parts: any[] = [{ text: promptText }];
    if (inlineData) {
      parts.push(inlineData);
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts: parts }],
    });

    const responseText = response.text || (response as any).text?.() || "";

    if (!responseText) throw new Error("EMPTY_RESPONSE");

    const typeValue = parseField(responseText, "Type").toLowerCase();
    let finalType: 'success' | 'warning' | 'info' = 'info';
    if (typeValue.includes('success')) finalType = 'success';
    else if (typeValue.includes('warning')) finalType = 'warning';

    return {
      title: parseField(responseText, "Title"),
      type: finalType,
      content: parseField(responseText, "Content"),
      hookVibe: parseField(responseText, "Hook Type"), // Map to Bucket 1
      productionStyle: parseField(responseText, "Production Vibe"), // Map to Bucket 2
      videoLengthCategory: parseField(responseText, "Video Length Category"), // Map to Bucket 3
      emotionalAngle: parseField(responseText, "Primary Emotional Angle"), // Map to Bucket 4
      strategicWhy: parseField(responseText, "Strategic Why"),
      backgroundAnalysis: parseField(responseText, "Background Analysis"),
      recommendation: parseField(responseText, "Recommendation"),
      date: new Date().toLocaleString()
    };
  };

  try {
    return await callApi();
  } catch (error: any) {
    if (error.message?.includes('429')) {
      console.warn("Rate limit reached. Waiting 30 seconds before retrying...");
      await new Promise(resolve => setTimeout(resolve, 31000)); // Wait 31s to be safe
      return await callApi();
    }
    throw error;
  }
};

export const getMasterInsight = async (ads: (AdDetail & { campaignName: string })[], insights: Record<string, AIInsight>): Promise<MasterInsight> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  const capturedInsightsText = Object.entries(insights)
    .map(([name, insight]) => `AD: ${name}\nTitle: ${insight.title}\nAnalysis: ${insight.content}\nRec: ${insight.recommendation}`)
    .join('\n\n');

  const promptText = `Analyze the collective performance of ${ads.length} Meta Ads for Zoop India.
    Timestamp: ${new Date().toISOString()}
    
    TARGET PERSONA: Female fashion resellers (35-55 yrs, Tier 2+ cities in India).
    
    COLLECTIVE INTELLIGENCE:
    ${capturedInsightsText}

    TASK: Summarize the future direction of our creative strategy based on these STANDARDIZED DATA POINTS.
    Focus on:
    1. Winning Hook Types (e.g. Is "Money-Led" outperforming "Loud Exclaim"?).
    2. Production Vibe trends (e.g. Shift from "Raw/UGC" to "Heavily Edited"?).
    3. Video Length effectiveness (Where is the sweet spot?).
    4. Dominant Emotional Angles (e.g. Does "Fear/FOMO" work better than "Aspirational"?).
    5. A/B Experiment ideas based on these variables.

    FORMAT:
    Summary: [High level overview]
    Future Hook Direction: [Analysis of winning Hook Types]
    Content Type Strategy: [Analysis of Production Vibe & Length]
    Editing Evolution: [Specific editing recommendations]
    Experiments: [Bullet points testing specific variables]
    New Personas: [Suggested expansion]`;

  const callApi = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    const text = response.text || (response as any).text?.() || "";

    return {
      summary: parseField(text, "Summary"),
      futureHookDirection: parseField(text, "Future Hook Direction"),
      contentTypeStrategy: parseField(text, "Content Type Strategy"),
      editingEvolution: parseField(text, "Editing Evolution"),
      experiments: parseField(text, "Experiments"),
      newPersonas: parseField(text, "New Personas"),
      date: new Date().toLocaleString()
    };
  };

  try {
    return await callApi();
  } catch (e: any) {
    if (e.message?.includes('429')) {
      console.warn("Rate limit reached (Master Insight). Waiting 30 seconds before retrying...");
      await new Promise(resolve => setTimeout(resolve, 31000));
      return await callApi();
    }
    console.error("Master insight generation failed", e);
    throw e;
  }
};
