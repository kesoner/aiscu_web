import { DocumentChunk } from "../types/rag";
import { apiJson } from "./apiClient";

type ChromaQueryResult = {
  ids: string[][];
  documents: string[][];
  metadatas: Record<string, unknown>[][];
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

  return ids.map((id, index) => ({
    id,
    text: documents[index] || "",
    embedding: [],
    metadata: metadatas[index] || {},
  }));
}
