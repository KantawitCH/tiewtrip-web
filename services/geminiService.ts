import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedItinerary } from "../types";

// Helper to get the AI instance. 
// Note: In a production app, handle API key security properly.
const getAIClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
    console.warn("API Key is missing. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTripItinerary = async (destination: string, days?: number): Promise<GeneratedItinerary | null> => {
  const ai = getAIClient();
  
  const prompt = days
    ? `Plan a ${days}-day trip to ${destination}. Provide a catchy title and a daily itinerary.`
    : `Plan an ideal trip itinerary for ${destination}. Decide the optimal duration (typically 3 to 7 days) to see the main highlights. Provide a catchy title and a daily itinerary.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            tripDescription: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayLabel: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeneratedItinerary;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
