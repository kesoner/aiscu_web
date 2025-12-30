// geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { DocumentChunk, AgentStep } from "../types/rag";

// ===================================================
// INIT: Singleton AI Client
// ===================================================

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: VITE_API_KEY is missing!");
      throw new Error("API Key missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const checkApiKey = (): boolean => !!import.meta.env.VITE_API_KEY;

// ===================================================
// MODELS
// ===================================================

const EMBEDDING_MODEL = "text-multilingual-embedding-002";
const GENERATION_MODEL = "gemini-2.5-flash";

// ===================================================
// EMBEDDING SERVICE
// ===================================================

export const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const results = await Promise.all(
      texts.map(async (text) => {
        const res = await getAI().models.embedContent({
          model: EMBEDDING_MODEL,
          contents: [{ parts: [{ text }] }],
        });
        return res.embeddings?.[0]?.values ?? [];
      })
    );
    return results;
  } catch (error) {
    console.error("❌ Error generating embeddings:", error);
    throw new Error("Embedding generation failed");
  }
};

// ===================================================
// File -> InlineData Part
// ===================================================

const fileToPart = (
  file: File
): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;

    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve({
        inlineData: { data: base64, mimeType: file.type },
      });
    };

    reader.readAsDataURL(file);
  });
};

// ===================================================
// MULTIMODAL FILE PROCESSOR
// ===================================================

export const processImportedFile = async (
  file: File
): Promise<{ title: string; category: string; content: string }> => {
  const filePart = await fileToPart(file);

  const systemPrompt = `
    你是一個資料庫歸檔專員 (Archivist)。
    任務：解析檔案內容並輸出 JSON。

    {
      "title": "精確標題",
      "category": "DOCUMENT | EVIDENCE | AUDIO_LOG | IMG_DATA | MEETING_NOTE",
      "content": "OCR、摘要或逐字稿（繁體中文）"
    }

    嚴禁 Markdown，必須為純 JSON。
  `;

  try {
    const result = await getAI().models.generateContent({
      model: GENERATION_MODEL,
      config: { responseMimeType: "application/json" },
      contents: [
        { role: "user", parts: [filePart] },
        { role: "user", parts: [{ text: systemPrompt }] },
      ],
    });

    return JSON.parse(result.text?.trim() || "{}");
  } catch (error) {
    console.error("❌ File processing failed:", error);
    throw new Error("無法解析檔案內容");
  }
};

// ===================================================
// URL PROCESSOR (Jina Reader)
// ===================================================

export const processWebUrl = async (
  url: string
): Promise<{ title: string; category: string; content: string }> => {
  try {
    const scrapeRes = await fetch(`https://r.jina.ai/${url}`);
    if (!scrapeRes.ok) throw new Error("Failed to fetch URL");

    const markdown = await scrapeRes.text();

    const prompt = `
      你是一個網路情資收集員，請摘要以下內容：

      ${markdown.substring(0, 30000)}

      顯示格式：純 JSON。

      {
        "title": "網頁標題",
        "category": "WEB_ARCHIVE",
        "content": "繁中摘要"
      }
    `;

    const result = await getAI().models.generateContent({
      model: GENERATION_MODEL,
      config: { responseMimeType: "application/json" },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return JSON.parse(result.text?.trim() || "{}");
  } catch (error) {
    console.error("❌ Web scraping failed:", error);
    throw new Error("無法讀取網頁內容");
  }
};

// ===================================================
// FINAL ANSWER GENERATOR
// ===================================================

export const generateFinalAnswer = async (
  query: string,
  contextText: string
): Promise<string> => {
  const systemInstruction = `
你是 AISCU（東吳大學人工智慧應用社）的官方 AI 小助手。

=== 回答原則 ===
1. 若 Context 有明確資訊 → 絕對優先引用。
2. 禁止捏造不存在的時間、社費、規則。
3. 若 Context 內容不足但問題屬於官方資訊：
   → 回答後補一句：「詳細資訊請洽詢社團幹部喔～」
4. 語氣溫柔、親切、自然，可稍微可愛（😊✨）

=== Context ===
${contextText || "(查無資料)"}

=== Query ===
${query}
`;

  const res = await getAI().models.generateContent({
    model: GENERATION_MODEL,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
    contents: [{ role: "user", parts: [{ text: query }] }],
  });

  return res.text || "SYSTEM_ERR: 無法產生回應。";
};

// ===================================================
// RAG MAIN PIPELINE
// ===================================================

export async function* runAgenticRag(
  query: string,
  retriever: (q: string) => Promise<DocumentChunk[]>
): AsyncGenerator<AgentStep> {
  yield {
    type: "log",
    message: `INIT: 執行向量檢索... query="${query}"`,
  };

  const chunks = await retriever(query);

  const context =
    chunks.length > 0 ? chunks.map((c) => c.text).join("\n---\n") : "";

  yield {
    type: "log",
    message:
      chunks.length > 0
        ? `RAG: 找到 ${chunks.length} 筆內容，交給模型生成回答`
        : `RAG: 查無相關資料，將以「無 context」模式回覆`,
  };

  yield { type: "log", message: "GENERATING: 正在生成最終回覆..." };

  const answer = await generateFinalAnswer(query, context);

  yield {
    type: "answer",
    message: answer,
    source: chunks.length > 0 ? "RAG_DATA" : "NO_DATA",
  };
}
