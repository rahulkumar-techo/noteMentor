/**
 * AI Question Generator (Gemini 2.5 Flash)
 * ----------------------------------------
 * Generates questions dynamically using Google Gemini API.
 * ✅ Fully compatible with @google/genai v0.24.1
 */

import { GoogleGenAI } from "@google/genai";
import { config } from "../../config/env.config";

// ✅ Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: config.geminiKey,
});

// ✅ Define input type
interface IQuestionInput {
  topic: string;
  difficulty: string;
  questionType: string;
  quantity: number;
  quality: string;
  language: string;
}


export function buildPrompt({
  topic,
  difficulty,
  questionType,
  quantity,
  quality,
  language,
}: IQuestionInput): string {
  // Base template for all question types
  let questionFormat = `
[
  {
    "id": "q1",
    "type": "${questionType}",
    "question": "...",
    "explanation": "..."
  }
]
`;

  // Add MCQ-specific fields dynamically
  if (questionType === "mcq") {
    questionFormat = `
[
  {
    "id": "q1",
    "type": "mcq",
    "question": "...",
    "options": ["...","...","...","..."],
    "correctAnswer": "...",
    "explanation": "..."
  }
]
`;
  }

  // Final AI instruction
  return `
Generate ${quantity || 10} ${difficulty}-level ${questionType.toUpperCase()} questions 
on the topic "${topic}" in ${language || "English"}.
Question quality: ${quality || "normal"}.

Each question must strictly follow this JSON format:
${questionFormat}

Return only pure JSON array — no markdown, code blocks, or extra text.
`;
}

/**
 * 🚀 Generate Questions using Gemini 2.5 Flash
 */
export async function generateQuestions({
  topic,
  difficulty,
  questionType,
  quantity,
  quality,
  language,
}: IQuestionInput) {
  try {
    const prompt = buildPrompt({
      topic,
      difficulty,
      questionType,
      quantity,
      quality,
      language,
    });

    // ✅ Generate content from Gemini API
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // ✅ Safely extract generated text
    const text =
      result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) throw new Error("Empty response from Gemini API");

    // ✅ Clean & parse JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    console.log("✅ Questions generated successfully!");
    return parsed;
  } catch (error: any) {
    console.error("❌ Error generating questions:", error.message);
    return [
      {
        id: "error",
        question:
          "AI failed to generate questions. Please check your API key, model name, or prompt.",
      },
    ];
  }
}
