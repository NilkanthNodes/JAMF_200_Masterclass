
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types.ts";

const MODEL_NAME = 'gemini-3-flash-preview';

export async function askAssistant(query: string, currentContext?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `You are a Jamf Certified Expert Assistant. 
    User Query: "${query}" 
    Current Study Context: "${currentContext || 'Jamf 200 Exam Preparation'}"
    Provide a professional, technical, and helpful answer. Use Markdown formatting. If the answer involves paths or commands, use code blocks.`,
  });
  return response.text || "I'm sorry, I couldn't process that query.";
}

export async function generateQuiz(moduleTitle: string, content: string): Promise<QuizQuestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Based on this Jamf 200 module content: "${content}", generate 3 high-quality multiple choice practice questions for the Jamf 200 exam. 
    Return the response in valid JSON.`,
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
            correctAnswer: { type: Type.INTEGER, description: "0-indexed index of the correct option" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
}

export async function generateScenario(moduleTitle: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a practical "Troubleshooting Scenario" or "Case Study" for a Jamf admin related to ${moduleTitle}. 
    Describe a problem, ask 2-3 guiding questions, and then provide a "Resolution" section hidden behind a logical gap. 
    Format with nice Markdown headings.`,
  });
  return response.text || "Could not generate scenario.";
}
