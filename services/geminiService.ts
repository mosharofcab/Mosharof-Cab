
import { GoogleGenAI } from "@google/genai";
import { AIResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeQRContent = async (content: string): Promise<AIResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this content for a QR code: "${content}". 
      Is it a safe link or text? Give a short 1-sentence suggestion or summary in Bengali. 
      Return JSON format: { "suggestion": "string", "isSafe": boolean }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{"suggestion": "Error analyzing content", "isSafe": true}');
    return result as AIResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    return { suggestion: "অ্যানালাইসিস করা সম্ভব হয়নি।", isSafe: true };
  }
};
