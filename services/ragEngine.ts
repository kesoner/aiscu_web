import { DocumentChunk } from "../src/types/rag";

/**
 * simpleChunker
 * Splits text into chunks of approximately `chunkSize` characters, with `overlap`.
 * This is a simplified version of a recursive character text splitter.
 */
export const simpleChunker = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  const chunks: string[] = [];
  if (!text) return chunks;

  let start = 0;
  const textLength = text.length;

  while (start < textLength) {
    const end = Math.min(start + chunkSize, textLength);
    let chunk = text.slice(start, end);

    // Simple heuristic: try not to split words in half if we are not at the end
    // Only slice if we found a space and it's not at position -1
    if (end < textLength) {
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace > 0) {
        chunk = chunk.slice(0, lastSpace);
      }
    }

    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk);
    }

    // Move start forward, respecting overlap.
    const step = Math.max(1, chunk.length - overlap);
    start += step;
  }

  return chunks;
};

/**
 * cosineSimilarity
 * Calculates the cosine similarity between two vectors.
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * retrieveRelevantChunks
 * Finds the top K most similar chunks to the query vector.
 */
export const retrieveRelevantChunks = (
  queryVector: number[],
  store: DocumentChunk[],
  topK: number = 3
): DocumentChunk[] => {
  if (!queryVector || queryVector.length === 0) return [];

  const scored = store.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryVector, chunk.embedding)
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top K
  return scored.slice(0, topK).map(item => item.chunk);
};