import { ChromaClient } from "chromadb";

(async () => {
    const client = new ChromaClient({ path: "http://localhost:8000" });

    const col = await client.getOrCreateCollection({
        name: "test_collection",
    });

    await col.add({
        ids: ["1"],
        documents: ["Hello, AISCU!"],
        embeddings: [[0.1, 0.2, 0.3, 0.4]],
    });

    const result = await col.query({
        nResults: 1,
        queryEmbeddings: [[0.1, 0.2, 0.3, 0.4]],
    });

    console.log(result);
})();
