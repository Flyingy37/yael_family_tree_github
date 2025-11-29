import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = process.env.API_KEY || ''; 

let client: GoogleGenAI | null = null;

if (apiKey) {
  client = new GoogleGenAI({ apiKey });
}

export const sendMessageToGemini = async (message: string, history: {role: 'user' | 'model', text: string}[]): Promise<{ text: string, groundingLinks?: { title: string; uri: string }[] }> => {
  if (!client) {
    return { text: "Error: API Key not configured." };
  }

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }],
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    const response = result.response;
    const text = response.text || "מצטער, לא הצלחתי לייצר תשובה.";
    
    // Extract Grounding Data
    const groundingLinks: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                groundingLinks.push({ 
                    title: chunk.web.title || "Web Source", 
                    uri: chunk.web.uri 
                });
            } else if (chunk.maps) {
                // Handle Maps grounding chunks
                const source = chunk.maps.source;
                if (source && source.uri) {
                    groundingLinks.push({
                        title: source.title || "Google Maps",
                        uri: source.uri
                    });
                } else if (chunk.maps.uri) {
                     groundingLinks.push({
                        title: chunk.maps.title || "Google Maps",
                        uri: chunk.maps.uri
                    });
                }
            }
        });
    }

    return { text, groundingLinks };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "אופס, משהו השתבש בתקשורת עם Gemini." };
  }
};