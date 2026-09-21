import { DocumentChunk } from "../types/rag";
import { apiJson } from "./apiClient";

type ChromaQueryResult = {
  ids: string[][];
  documents: string[][];
  metadatas: Partial<DocumentChunk["metadata"]>[][];
};

export async function initChroma() {
  // The collection is initialized lazily by the local backend.
  console.log("RAG service uses the local backend API.");
}

export async function ingestChunksToChroma(
  chunks: string[],
  metadatas: Record<string, unknown>[],
  docIdPrefix: string
) {
  const response = await apiJson<{ insertedChunks: number }>("/api/rag/ingest", {
    method: "POST",
    body: JSON.stringify({ chunks, metadatas, docIdPrefix }),
  });
  console.log(`Ingested ${response.insertedChunks} chunks through the local backend.`);
}

export async function replaceKnowledgeBaseIndex(
  chunks: string[],
  metadatas: Record<string, unknown>[],
  docIdPrefix: string
) {
  const response = await apiJson<{ indexedChunks: number }>("/api/rag/replace", {
    method: "POST",
    body: JSON.stringify({ chunks, metadatas, docIdPrefix }),
  });
  console.log(`Rebuilt ${response.indexedChunks} knowledge-base chunks through the local backend.`);
}

export async function retrieveFromChroma(
  query: string,
  topK = 3
): Promise<DocumentChunk[]> {
  const data = await apiJson<{ results: ChromaQueryResult }>("/api/rag/query", {
    method: "POST",
    body: JSON.stringify({ query, nResults: topK }),
  });
  const results = data.results;
  const ids = results.ids?.[0] || [];
  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];

  return ids.map((id, index) => {
    const metadata = metadatas[index] || {};
    return {
      id,
      text: documents[index] || "",
      embedding: [],
      metadata: {
        title: metadata.title || "未命名資料",
        category: metadata.category || "未分類",
      },
    };
  });
}
