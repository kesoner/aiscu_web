// geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { DocumentChunk, AgentStep } from "../src/types/rag";

// ----------------------------------------------------
// INIT
// ----------------------------------------------------

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

export const checkApiKey = (): boolean => {
  return !!import.meta.env.VITE_API_KEY;
};

const EMBEDDING_MODEL = "text-embedding-004";
const GENERATION_MODEL = "gemini-2.5-flash";

// ----------------------------------------------------
//  EMBEDDING
// ----------------------------------------------------
export const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const results = await Promise.all(
      texts.map(async (text) => {
        const res = await getAI().models.embedContent({
          model: EMBEDDING_MODEL,
          contents: { parts: [{ text }] },
        });
        return res.embeddings?.[0]?.values || [];
      })
    );
    return results;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
};

// ----------------------------------------------------
//  INGESTION & MULTIMODAL PROCESSING
// ----------------------------------------------------

const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 處理上傳的檔案 (PDF, Image, Audio, Video)
 * 使用 Gemini 的多模態能力提取資訊
 */
export const processImportedFile = async (file: File): Promise<{ title: string; category: string; content: string }> => {
  const filePart = await fileToPart(file);

  const systemPrompt = `
  你是一個資料庫歸檔專員 (Archivist)。
  任務：分析上傳的檔案內容，並提取結構化資訊以存入資料庫。
  
  輸出格式 (JSON):
  {
    "title": "簡短精確的標題",
    "category": "分類代碼 (如: DOCUMENT, EVIDENCE, AUDIO_LOG, IMG_DATA, MEETING_NOTE)",
    "content": "詳細的內容摘要、OCR文字或聽寫逐字稿。請用繁體中文。"
  }
  
  注意：直接回傳 JSON 物件，不要使用 Markdown 格式。
  `;

  try {
    const result = await getAI().models.generateContent({
      model: GENERATION_MODEL,
      config: { responseMimeType: "application/json" },
      contents: [{ role: 'user', parts: [filePart, { text: systemPrompt }] }]
    });

    const text = result.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("File processing failed", e);
    throw new Error("無法解析檔案內容");
  }
};

/**
 * 處理網頁連結
 * 透過 r.jina.ai 獲取內容後摘要
 */
export const processWebUrl = async (url: string): Promise<{ title: string; category: string; content: string }> => {
  try {
    // Fetch markdown from Jina Reader
    const scrapeRes = await fetch(`https://r.jina.ai/${url}`);
    if (!scrapeRes.ok) throw new Error("Failed to fetch URL");
    const markdown = await scrapeRes.text();

    const prompt = `
        你是一個網路情資收集員。
        任務：分析以下網頁內容，提取關鍵資訊。

        網頁內容:
        ${markdown.substring(0, 30000)} 
        
        輸出格式 (JSON):
        {
            "title": "網頁標題",
            "category": "WEB_ARCHIVE",
            "content": "網頁重點摘要 (繁體中文)"
        }
        直接回傳 JSON。
        `;

    const result = await getAI().models.generateContent({
      model: GENERATION_MODEL,
      config: { responseMimeType: "application/json" },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = result.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Web scraping failed", e);
    throw new Error("無法讀取網頁內容");
  }
};

// ----------------------------------------------------
//  FINAL ANSWER GENERATOR (Updated)
// ----------------------------------------------------

export const generateFinalAnswer = async (
  query: string,
  contextText: string
): Promise<string> => {

  const systemInstruction = `
你是 AISCU（東吳大學人工智慧應用社）的官方 AI 小助手，
擁有「一般聊天能力」與「資料庫查詢輔助能力」。

你的輸入包含：
1. 使用者問題（Query）
2. 資料庫檢索結果（Context），可能是空的。

=== 回答規則 ===

1. 如果 Context 中有明確資訊（例如社費金額、社課時間、地點、規則）：
   ✔ 請優先使用其中的事實作答。
   ✔ 不要編造不存在的細節。

2. 如果 Context 幾乎沒資訊 / 完全不相關：
   ✔ 請正常聊天、自然回應。
   ✔ 如果問題明顯是在問社團官方資訊（例：社費多少？活動在哪裡？）
     請在回答最後加一句：
     「詳細資訊請洽詢社團幹部喔～」

3. 語氣風格：
   ✔ 使用繁體中文
   ✔ 溫柔、親切、自然，可稍微可愛（😊✨）
   ✔ 像一位友善的 AISCU 小助手

4. 絕對禁止：
   ✘ 編造不存在的金額、時間、地點、規則
   ✘ 歪樓過頭、不相關回答

=== INPUT ===
【資料庫檢索結果】:
${contextText || "(查無資料)"}

【使用者問題】:
${query}

請依照以上規則生成最終回答。
`;

  const response = await getAI().models.generateContent({
    model: GENERATION_MODEL,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
    contents: [{ role: "user", parts: [{ text: query }] }],
  });

  return response.text || "SYSTEM_ERR: 無法產生回應。";
};




/**
 * RAG 主流程
 * 永遠：
 * 1. 先檢索
 * 2. 再交給模型生成
 */
export async function* runAgenticRag(
  query: string,
  retriever: (q: string) => Promise<DocumentChunk[]>
): AsyncGenerator<AgentStep> {

  // ----------------------------------------------------
  // STEP 1: Always retrieve
  // ----------------------------------------------------
  yield {
    type: "log",
    message: `INIT: 執行向量檢索... Query="${query}"`
  };

  const relevantChunks = await retriever(query);

  // ----------------------------------------------------
  // STEP 2: Build context for LLM
  // ----------------------------------------------------
  let finalContext = "";

  if (relevantChunks.length > 0) {
    finalContext = relevantChunks.map((c) => c.text).join("\n---\n");

    yield {
      type: "log",
      message: `RAG: 找到 ${relevantChunks.length} 筆內容，交由模型生成回答`
    };
  } else {
    yield {
      type: "log",
      message: `RAG: 查無相關資料，將以「無 context」模式生成回答`
    };
  }

  // ----------------------------------------------------
  // STEP 3: Ask LLM to produce final answer
  // ----------------------------------------------------
  yield { type: "log", message: "GENERATING: 正在生成最終回覆..." };

  const answer = await generateFinalAnswer(query, finalContext);

  yield {
    type: "answer",
    message: answer,
    source: relevantChunks.length > 0 ? "RAG_DATA" : "NO_DATA"
  };
}
