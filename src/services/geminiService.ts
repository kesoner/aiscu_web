import { AgentStep, DocumentChunk } from "../types/rag";
import { apiJson } from "./apiClient";

type BackendHealth = {
  status: "ready" | "degraded";
  services: {
    gemini: { configured: boolean };
    vectorStore: { configured: boolean };
  };
};

type RagAnswer = {
  answer: string;
  source: "RAG_DATA" | "NO_DATA";
  chunks: DocumentChunk[];
};

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const health = await apiJson<BackendHealth>("/api/health");
    return (
      health.status === "ready" &&
      health.services.gemini.configured &&
      health.services.vectorStore.configured
    );
  } catch {
    return false;
  }
}

function fileToPart(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve({ data: result.split(",")[1], mimeType: file.type });
    };
    reader.readAsDataURL(file);
  });
}

export async function processImportedFile(
  file: File
): Promise<{ title: string; category: string; content: string }> {
  const filePart = await fileToPart(file);
  return apiJson("/api/rag/import/file", {
    method: "POST",
    body: JSON.stringify(filePart),
  });
}

export async function processWebUrl(
  url: string
): Promise<{ title: string; category: string; content: string }> {
  const scrapeResponse = await fetch(`https://r.jina.ai/${url}`);
  if (!scrapeResponse.ok) throw new Error("無法讀取網頁內容。");

  return apiJson("/api/rag/summarize", {
    method: "POST",
    body: JSON.stringify({ markdown: await scrapeResponse.text() }),
  });
}

export async function* runAgenticRag(
  query: string,
  _retriever?: (query: string) => Promise<DocumentChunk[]>
): AsyncGenerator<AgentStep> {
  yield { type: "log", message: `INIT: 將問題送至本機 RAG 後端... query="${query}"` };

  const response = await apiJson<RagAnswer>("/api/rag/answer", {
    method: "POST",
    body: JSON.stringify({ query, nResults: 3 }),
  });

  yield {
    type: "log",
    message: response.chunks.length
      ? `RAG: 找到 ${response.chunks.length} 筆內容，已由後端模型生成回答。`
      : "RAG: 查無相關資料，已以無 context 模式回答。",
  };
  yield { type: "answer", message: response.answer, source: response.source };
}
