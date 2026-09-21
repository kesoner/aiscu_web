import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ChromaClient, CloudClient } from "chromadb";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const isProduction = process.env.NODE_ENV === "production";
const config = {
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 3001),
    frontendDistDir: path.resolve(__dirname, process.env.FRONTEND_DIST_DIR || "../dist"),
    dataDir: path.resolve(__dirname, process.env.DATA_DIR || "./applications"),
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,https://aiscu.xuyuzu.online")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    vectorStore: process.env.VECTOR_STORE || "local",
    chromaUrl: process.env.CHROMA_URL || "http://127.0.0.1:8000",
    chromaApiKey: process.env.CHROMA_API_KEY,
    chromaTenant: process.env.CHROMA_TENANT,
    chromaDatabase: process.env.CHROMA_DATABASE || "default_database",
    chromaCollection: process.env.CHROMA_COLLECTION || "aiscu_rag_collection",
    geminiApiKey: process.env.GEMINI_API_KEY,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "text-multilingual-embedding-002",
    generationModel: process.env.GEMINI_GENERATION_MODEL || "gemini-2.5-flash",
    applicationEncryptionKey: process.env.APPLICATION_ENCRYPTION_KEY,
};

if (!config.applicationEncryptionKey && isProduction) {
    throw new Error("APPLICATION_ENCRYPTION_KEY must be set in production.");
}
if (!config.applicationEncryptionKey) {
    console.warn("APPLICATION_ENCRYPTION_KEY is not set; using a development-only key.");
}

const encryptionKey = crypto.scryptSync(
    config.applicationEncryptionKey || "aiscu-local-development-key",
    "aiscu-application-encryption-v1",
    32
);

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(origin)) return callback(null, true);
            return callback(new Error("Origin is not allowed by CORS."));
        },
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

fs.mkdirSync(config.dataDir, { recursive: true });

let chromaCollection = null;
let aiClient = null;

function getAiClient() {
    if (!config.geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured on this computer.");
    }
    aiClient ??= new GoogleGenAI({ apiKey: config.geminiApiKey });
    return aiClient;
}

function createChromaClient() {
    if (config.vectorStore === "local") {
        return new ChromaClient({ path: config.chromaUrl });
    }
    if (config.vectorStore === "cloud") {
        if (!config.chromaApiKey || !config.chromaTenant) {
            throw new Error("CHROMA_API_KEY and CHROMA_TENANT are required when VECTOR_STORE=cloud.");
        }
        return new CloudClient({
            apiKey: config.chromaApiKey,
            tenant: config.chromaTenant,
            database: config.chromaDatabase,
        });
    }
    throw new Error("VECTOR_STORE must be either local or cloud.");
}

async function getChromaCollection() {
    if (!chromaCollection) {
        chromaCollection = await createChromaClient().getOrCreateCollection({
            name: config.chromaCollection,
        });
    }
    return chromaCollection;
}

function encryptApplication(data) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

function requireNonEmptyString(value, name) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required.`);
    return value.trim();
}

async function embedTexts(texts) {
    if (!Array.isArray(texts) || texts.length === 0) throw new Error("texts must contain at least one item.");
    if (texts.length > 50) throw new Error("A maximum of 50 texts can be embedded per request.");

    const ai = getAiClient();
    return Promise.all(
        texts.map(async (text) => {
            const response = await ai.models.embedContent({
                model: config.embeddingModel,
                contents: [{ parts: [{ text: requireNonEmptyString(text, "text") }] }],
            });
            const embedding = response.embeddings?.[0]?.values;
            if (!embedding?.length) throw new Error("Gemini did not return an embedding.");
            return embedding;
        })
    );
}

async function retrieveDocuments(query, nResults = 3) {
    const [embedding] = await embedTexts([query]);
    const collection = await getChromaCollection();
    return collection.query({
        queryEmbeddings: [embedding],
        nResults: Math.min(Math.max(Number(nResults) || 3, 1), 10),
    });
}

function normaliseDocuments(results) {
    const documents = results.documents?.[0] || [];
    const metadatas = results.metadatas?.[0] || [];
    const ids = results.ids?.[0] || [];
    return documents.map((text, index) => ({
        id: ids[index],
        text: text || "",
        metadata: metadatas[index] || {},
    }));
}

function ragSystemInstruction(contextText) {
    return `你是 AISCU（東吳大學人工智慧應用社）的官方 AI 小助手。

回答規則：
1. 只根據以下知識庫內容回答，不要捏造資訊。
2. 若內容不足，請明確回答「現有知識庫中查無此資料」，並建議洽詢社團幹部。
3. 請以自然、親切的繁體中文回答。

知識庫內容：
${contextText || "(查無資料)"}`;
}

async function generateJsonFromFile(data, mimeType) {
    const response = await getAiClient().models.generateContent({
        model: config.generationModel,
        config: { responseMimeType: "application/json" },
        contents: [
            { role: "user", parts: [{ inlineData: { data, mimeType } }] },
            {
                role: "user",
                parts: [{ text: "你是一個資料庫歸檔專員。解析檔案內容並輸出純 JSON：{\"title\":\"精確標題\",\"category\":\"DOCUMENT | EVIDENCE | AUDIO_LOG | IMG_DATA | MEETING_NOTE\",\"content\":\"OCR、摘要或逐字稿（繁體中文）\"}" }],
            },
        ],
    });
    return JSON.parse(response.text?.trim() || "{}");
}

app.get("/api/health", async (_req, res) => {
    let vectorStoreReachable = false;
    let vectorStoreError = null;

    try {
        await createChromaClient().heartbeat();
        vectorStoreReachable = true;
    } catch (error) {
        vectorStoreError = error instanceof Error ? error.message : "Vector store is unavailable.";
    }

    const ready = Boolean(config.geminiApiKey) && vectorStoreReachable;
    res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "degraded",
        host: config.host,
        services: {
            gemini: { configured: Boolean(config.geminiApiKey) },
            vectorStore: {
                provider: config.vectorStore,
                configured: config.vectorStore === "local" || Boolean(config.chromaApiKey && config.chromaTenant),
                reachable: vectorStoreReachable,
                ...(vectorStoreError ? { error: vectorStoreError } : {}),
            },
        },
    });
});

app.post("/api/apply", async (req, res, next) => {
    try {
        const fullName = requireNonEmptyString(req.body.fullName, "fullName");
        const studentId = requireNonEmptyString(req.body.studentId, "studentId");
        const email = requireNonEmptyString(req.body.email, "email");
        const application = {
            timestamp: new Date().toISOString(),
            fullName,
            studentId,
            email,
            department: typeof req.body.department === "string" ? req.body.department : "",
            motivation: typeof req.body.motivation === "string" ? req.body.motivation : "",
        };
        const safeStudentId = studentId.replace(/[^a-z0-9]/gi, "_");
        const filename = `app_${Date.now()}_${safeStudentId}.json`;
        await fs.promises.writeFile(
            path.join(config.dataDir, filename),
            JSON.stringify({ id: filename, encryptedData: encryptApplication(application) }, null, 2),
            { mode: 0o600 }
        );
        res.json({ success: true, message: "Application submitted successfully" });
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/ingest", async (req, res, next) => {
    try {
        const { chunks, metadatas = [], docIdPrefix = "document" } = req.body;
        if (!Array.isArray(chunks) || chunks.length === 0) throw new Error("chunks must contain at least one item.");
        if (chunks.length > 50) throw new Error("A maximum of 50 chunks can be ingested per request.");

        const documents = chunks.map((chunk) => requireNonEmptyString(chunk, "chunk"));
        const embeddings = await embedTexts(documents);
        const ids = documents.map((_, index) => `${docIdPrefix}_${index}_${crypto.randomUUID()}`);
        const finalMetadatas = documents.map((_, index) => ({
            ...(metadatas[index] || {}),
            chunkIndex: index,
            source: docIdPrefix,
        }));
        const collection = await getChromaCollection();
        await collection.add({ ids, embeddings, metadatas: finalMetadatas, documents });
        res.json({ success: true, insertedChunks: documents.length });
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/query", async (req, res, next) => {
    try {
        const query = requireNonEmptyString(req.body.query, "query");
        const results = await retrieveDocuments(query, req.body.nResults);
        res.json({ success: true, results });
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/answer", async (req, res, next) => {
    try {
        const query = requireNonEmptyString(req.body.query, "query");
        const results = await retrieveDocuments(query, req.body.nResults);
        const chunks = normaliseDocuments(results);
        const context = chunks.map((chunk) => chunk.text).join("\n---\n");
        const response = await getAiClient().models.generateContent({
            model: config.generationModel,
            config: { systemInstruction: ragSystemInstruction(context), temperature: 0.3 },
            contents: [{ role: "user", parts: [{ text: query }] }],
        });
        res.json({
            success: true,
            answer: response.text || "無法產生回應。",
            source: chunks.length ? "RAG_DATA" : "NO_DATA",
            chunks,
        });
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/import/file", async (req, res, next) => {
    try {
        const data = requireNonEmptyString(req.body.data, "data");
        const mimeType = requireNonEmptyString(req.body.mimeType, "mimeType");
        if (Buffer.byteLength(data, "base64") > 15 * 1024 * 1024) throw new Error("The uploaded file is too large to process.");
        res.json(await generateJsonFromFile(data, mimeType));
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/summarize", async (req, res, next) => {
    try {
        const markdown = requireNonEmptyString(req.body.markdown, "markdown").slice(0, 30000);
        const response = await getAiClient().models.generateContent({
            model: config.generationModel,
            config: { responseMimeType: "application/json" },
            contents: [{
                role: "user",
                parts: [{ text: `你是一個網路情資收集員。請將以下內容摘要為純 JSON：\n{"title":"網頁標題","category":"WEB_ARCHIVE","content":"繁中摘要"}\n\n內容：\n${markdown}` }],
            }],
        });
        res.json(JSON.parse(response.text?.trim() || "{}"));
    } catch (error) {
        next(error);
    }
});

if (fs.existsSync(config.frontendDistDir)) {
    app.use(express.static(config.frontendDistDir));
    app.use((req, res, next) => {
        if (req.method === "GET" && req.accepts("html")) {
            return res.sendFile(path.join(config.frontendDistDir, "index.html"));
        }
        return next();
    });
}

app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("API error:", message);
    res.status(400).json({ success: false, message });
});

app.listen(config.port, config.host, () => {
    console.log(`AISCU local server listening at http://${config.host}:${config.port}`);
});
