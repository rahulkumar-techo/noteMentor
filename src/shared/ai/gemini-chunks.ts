/**
 * ⚡ Gemini Streaming Question Generator (Toon Mode)
 * - Ultra-light prompt (token-optimized)
 * - Fast streaming for low-latency TTFB
 * - Saves results to MongoDB asynchronously
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/env.config";
import questionModel from "../../models/question.model";

const genAI = new GoogleGenerativeAI(config.geminiKey);

// 🧠 Toon Prompt (Minimalistic JSON schema)
function toonPrompt({
  topic,
  difficulty,
  questionType,
  quantity,
  language,
}: any): string {
  const isMCQ = questionType === "mcq";
  return `
Make ${quantity || 5} ${difficulty} ${questionType} questions on "${topic}" in ${language || "English"}.
Return JSON only:
[${isMCQ
    ? `{"q":"...","opts":["A","B","C","D"],"ans":"A"}`
    : `{"q":"...","ans":"..."}`}]`;
}

/**
 * 🧩 Stream Generate Questions (Token Efficient)
 */
export async function streamGenerateQuestions(
  userId: string,
  data: any,
  onStream: (text: string) => void
) {
  const prompt = toonPrompt(data);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const stream = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let raw = "";
    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text) {
        raw += text;
        onStream(text);
      }
    }

    const clean = raw.replace(/```json|```/g, "").trim();
    let parsed: any[];
    try {
      parsed = JSON.parse(clean);
    } catch {
      throw new Error("Bad JSON format from Gemini Lite");
    }

    // 🎯 Background DB save (async)
    process.nextTick(async () => {
      try {
        const docs = parsed.map((q: any, i: number) => ({
          creatorId: userId,
          question: q.q || `Question ${i + 1}`,
          options: q.opts?.map((t: string) => ({ text: t })) || [],
          correctAnswer: q.ans || "",
          topic: data.topic,
          difficulty: data.difficulty,
          type: data.questionType,
        }));
        await questionModel.insertMany(docs);
        console.log(`✅ ${docs.length} saved for user ${userId}`);
      } catch (e: any) {
        console.error("❌ Save fail:", e.message);
      }
    });

    return {
      success: true,
      message: "Streaming done, saving async",
      questions: parsed,
    };
  } catch (e: any) {
    console.error("❌ Gemini Tooned Stream Error:", e.message);
    return { success: false, error: e.message };
  }
}
