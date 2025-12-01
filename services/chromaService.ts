import { getEmbeddings } from "./geminiService";
import { DocumentChunk } from "../src/types/rag";

// We no longer import ChromaClient directly here.
// Instead, we fetch() to our own backend which talks to Chroma.

export const initChroma = async () => {
    // No-op on client side now, or maybe a health check to backend?
    console.log("Chroma Service (Client) Initialized. Using Backend API.");
};

export const ingestChunksToChroma = async (chunks: string[], metadatas: Record<string, any>[], docIdPrefix: string) => {
    const ids: string[] = [];
    const embeddings: number[][] = [];
    const finalMetadatas: any[] = [];
    const documents: string[] = [];

    // Generate embeddings in batch (Client Side)
    const embeddingsResult = await getEmbeddings(chunks);

    for (let i = 0; i < chunks.length; i++) {
        const id = `${docIdPrefix}_${i}_${crypto.randomUUID()}`; // Unique ID
        const text = chunks[i];
        const emb = embeddingsResult[i];
        const meta = metadatas[i] || {};

        ids.push(id);
        embeddings.push(emb);
        finalMetadatas.push({ ...meta, chunkIndex: i, source: docIdPrefix });
        documents.push(text);
    }

    // Send to Backend
    const response = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ids,
            embeddings,
            metadatas: finalMetadatas,
            documents
        })
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`Ingest failed: ${response.status} ${response.statusText}`, text);
        throw new Error(`Ingest failed: ${response.status} ${response.statusText} - ${text}`);
    }

    console.log(`Ingested ${chunks.length} chunks to Chroma via Backend.`);
};

export const retrieveFromChroma = async (
    query: string,
    topK: number = 3
): Promise<DocumentChunk[]> => {

    // Generate query embedding (Client Side)
    const qEmbedding = (await getEmbeddings([query]))[0];

    // Send to Backend
    const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            queryEmbeddings: [qEmbedding],
            nResults: topK
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Query failed");
    }

    const data = await response.json();
    const results = data.results;
    const chunks: DocumentChunk[] = [];

    if (results.ids.length > 0 && results.ids[0].length > 0) {
        for (let i = 0; i < results.ids[0].length; i++) {
            chunks.push({
                id: results.ids[0][i],
                text: results.documents[0][i] || "",
                embedding: [], // We don't need the embedding back for generation
                metadata: results.metadatas[0][i] as any ?? {}
            });
        }
    }

    return chunks;
};
