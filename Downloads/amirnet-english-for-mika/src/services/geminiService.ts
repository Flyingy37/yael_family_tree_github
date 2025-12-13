import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Difficulty } from "../types";

// Initialize Gemini Client
// Note: API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_MODEL = 'gemini-2.5-flash';

/**
 * Generates a set of quiz questions based on topic and difficulty.
 */
export const generateQuizQuestions = async (topic: string, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  const prompt = `Generate 5 multiple-choice questions about "${topic}" for an English learner at the ${difficulty} level. 
  Focus on grammar, vocabulary, or idiom usage appropriate for this level.`;

  try {
    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");
    return JSON.parse(jsonText) as QuizQuestion[];

  } catch (error) {
    console.error("Error generating quiz:", error);
    // Fallback or rethrow
    throw error;
  }
};

/**
 * Creates a chat session with specific system instructions.
 */
export const createChatSession = (systemInstruction: string) => {
  return ai.chats.create({
    model: BASE_MODEL,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7, // Balance between creativity and correctness
    },
  });
};

/**
 * Generates a "Word of the Day" for Mika.
 */
export const generateDailyWord = async (): Promise<{ word: string, definition: string, example: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: BASE_MODEL,
      contents: "Teach me one useful English word for an intermediate learner. Return JSON with 'word', 'definition', and 'example'.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING }
          },
          required: ["word", "definition", "example"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Failed to get daily word");
    return JSON.parse(text);
  } catch (e) {
    return {
      word: "Serendipity",
      definition: "The occurrence and development of events by chance in a happy or beneficial way.",
      example: "It was pure serendipity that we met at the coffee shop right before the rain started."
    };
  }
};
