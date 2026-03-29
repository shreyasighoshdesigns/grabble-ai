import { GoogleGenAI, Type } from "@google/genai";
import { Screenshot } from "../types";
import firebaseConfig from "../../firebase-applet-config.json";

let ai: GoogleGenAI | null = null;

function getAi() {
  if (!ai) {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Explicitly reject empty strings or the specific Firebase key to isolate the bug
    if (!apiKey || apiKey.trim() === "" || apiKey === firebaseConfig.apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is missing from .env or is identical to the blocked Firebase key! Please paste a fresh, valid Gemini Key from a new project in Google AI Studio.");
    }
    
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeScreenshot(
  base64Image: string, 
  mimeType: string, 
  fallbackName?: string,
  dimensions?: { width: number, height: number },
  extractedColors?: string[]
): Promise<Partial<Screenshot>> {
  const aiInstance = getAi();
  
  if (!aiInstance) {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash", // Use safer, faster model
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this UI screenshot for a design inspiration tool. 
Return a JSON object precisely matching the schema:
- title: A short descriptive title of the specific screen.
- screenType: A specific UI screen name (e.g., Login, Onboarding, Settings, Checkout, Dashboard).
- category: Determine if the UI is meant for "Web" or "Mobile".
- tags: An array of 3-5 tags describing the industry or page type by studying the layout (e.g., Fintech, Ecommerce, Edtech, Lifestyle).
- components: An array of 3-5 specific UI elements recognized (e.g., Data Table, Bottom Sheet, Toggle Switch, Hero Section).
- colorPalette: An array of 3-5 dominant hex color codes.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short descriptive title" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 relevant industry/category tags" },
            screenType: { type: Type.STRING, description: "MUST be one of: Homepage, Dashboard, PDP, Checkout, Login, Onboarding, Settings, Profile, Search, Feed, Article, Pricing, Modal, Catalog, Success, Form, Chat, Empty State" },
            category: { type: Type.STRING, description: "Either 'Web' or 'Mobile'" },
            components: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 key UI components" },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 dominant hex color codes" },
          },
          required: ["title", "tags", "screenType", "category", "components", "colorPalette"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const parsed = JSON.parse(jsonStr.replace(/```json/g, "").replace(/```/g, ""));
    // Validate output
    if (parsed.screenType && parsed.tags) {
      if (!parsed.colorPalette || parsed.colorPalette.length === 0) {
        parsed.colorPalette = extractedColors || ["#ffffff"];
      }
      
      const cat = (parsed.category || "").toString().toLowerCase();
      if (cat.includes("web") || cat.includes("desktop")) {
        parsed.category = "Web";
      } else if (cat.includes("mobile") || cat.includes("app")) {
        parsed.category = "Mobile";
      } else {
        // Look at tags and screentype as a fallback
        const combined = `${parsed.screenType} ${parsed.tags.join(" ")}`.toLowerCase();
        if (combined.includes("web") || combined.includes("desktop")) {
          parsed.category = "Web";
        } else {
          parsed.category = "Mobile"; // Default fallback
        }
      }
      
      return parsed;
    }
    throw new Error("Gemini returned incomplete AI analysis.");
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    throw new Error(e.message || "Failed to communicate with Gemini API.");
  }
}

export async function findSimilarScreenshots(base64Image: string, mimeType: string, screenshots: Screenshot[]): Promise<string[]> {
  const aiInstance = getAi();
  
  if (!aiInstance) {
    return screenshots.slice(0, 3).map(s => s.id);
  }

  const screenshotsContext = screenshots.map(s => ({
    id: s.id,
    title: s.title,
    tags: s.tags,
    customTags: s.customTags || [],
    screenType: s.screenType,
    components: s.components
  }));

  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: `Analyze this reference image. Then, look at the following list of screenshots and their metadata: ${JSON.stringify(screenshotsContext)}. Return ONLY a JSON array of screenshot IDs from the list that are visually or structurally most similar to the reference image, ordered by relevance. If none match well, return an empty array.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  const jsonStr = response.text?.trim() || "[]";
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse Gemini similarity response:", e);
    return [];
  }
}

export async function categorizeScreenshot(base64Image: string, mimeType: string): Promise<'Web' | 'Mobile'> {
  const aiInstance = getAi();
  if (!aiInstance) return 'Mobile';

  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: `Look at this UI screenshot. Is it designed for a "Web" browser or a "Mobile" app screen? Return a JSON object with a single "category" property set to either "Web" or "Mobile".` },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { category: { type: Type.STRING } },
          required: ["category"]
        }
      }
    });

    const jsonStr = response.text?.replace(/```json/g, "").replace(/```/g, "").trim() || "{}";
    const parsed = JSON.parse(jsonStr);
    
    const cat = (parsed.category || "").toString().toLowerCase();
    if (cat.includes("web") || cat.includes("desktop")) return "Web";
    return "Mobile";
  } catch (e) {
    console.error("Gemini category detection failed:", e);
    return "Mobile";
  }
}

export async function searchScreenshots(query: string, screenshots: Screenshot[]): Promise<string[]> {
  const aiInstance = getAi();
  
  if (!aiInstance) {
    const q = query.toLowerCase();
    return screenshots
      .filter(s => s.title.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)))
      .map(s => s.id);
  }

  const screenshotsContext = screenshots.map(s => ({
    id: s.id,
    title: s.title,
    tags: s.tags,
    customTags: s.customTags || [],
    screenType: s.screenType,
    components: s.components
  }));

  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Given the user query "${query}", find the best matching screenshots from this list: ${JSON.stringify(screenshotsContext)}. Return ONLY a JSON array of screenshot IDs ordered by relevance. If none match well, return an empty array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  const jsonStr = response.text?.trim() || "[]";
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse Gemini search response:", e);
    return [];
  }
}
