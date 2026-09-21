import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import { lookup } from "dns/promises";
import fs from "fs";
import { isIP } from "net";
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
    knowledgeBaseFile: path.resolve(__dirname, process.env.KNOWLEDGE_BASE_FILE || "../.local/data/knowledge-base.json"),
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
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2",
    generationModel: process.env.GEMINI_GENERATION_MODEL || "gemini-3.1-flash-lite",
    aiRequestTimeoutMs: Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 15000),
    urlImportTimeoutMs: Number(process.env.URL_IMPORT_TIMEOUT_MS || 20000),
    applicationEncryptionKey: process.env.APPLICATION_ENCRYPTION_KEY,
    logFile: path.resolve(__dirname, process.env.LOG_FILE || "../.local/logs/backend.log"),
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
        methods: ["GET", "POST", "PUT"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(path.dirname(config.logFile), { recursive: true });
fs.mkdirSync(path.dirname(config.knowledgeBaseFile), { recursive: true });

function log(level, message) {
    const entry = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
    console[level === "error" ? "error" : "log"](entry);
    fs.appendFileSync(config.logFile, `${entry}\n`, "utf8");
}

function aiHttpOptions() {
    return {
        httpOptions: {
            timeout: config.aiRequestTimeoutMs,
            // The SDK defaults to five retries. Retry policy is controlled by
            // withAiRetry instead so requests do not keep the UI loading.
            retryOptions: { attempts: 1 },
        },
    };
}

app.use((req, res, next) => {
    if (!req.path.startsWith("/api/")) return next();
    const startedAt = Date.now();
    res.on("finish", () => {
        log("info", `${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });
    return next();
});

let chromaCollection = null;
let aiClient = null;

function getAiClient() {
    if (!config.geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured on this computer.");
    }
    aiClient ??= new GoogleGenAI({ apiKey: config.geminiApiKey });
    return aiClient;
}

function isTransientAiError(error) {
    const message = error instanceof Error ? error.message : String(error);
    return /\b429\b|\b503\b|\b504\b|UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|deadline expired|high demand|timeout|abort/i.test(message);
}

async function withAiRetry(operation) {
    const maxAttempts = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!isTransientAiError(error) || attempt === maxAttempts) throw error;
            const delayMs = 1000;
            log("warn", `Gemini temporary error; retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts}).`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
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

const DEFAULT_KNOWLEDGE_BASE = [
    {
        id: 1,
        category: "PROTOCOL_FEE",
        title: "2025 春季社費公告",
        content: "本學期社費為新台幣 500 元，包含教材費與期末聚餐補助。繳費期限至 3/15 止。",
        updatedAt: "2025-02-20",
    },
    {
        id: 2,
        category: "LOC_DATA",
        title: "社課教室位置",
        content: "每週二、四的社課地點位於「活動中心 305 教室」。若遇國定假日則暫停一次。",
        updatedAt: "2025-01-10",
    },
    {
        id: 3,
        category: "REGULATION",
        title: "缺席與請假規定",
        content: "一學期無故缺席超過 3 次將取消幹部參選資格。請假請提前 24 小時於 Discord 頻道告知。",
        updatedAt: "2024-12-05",
    },
    {
        id: 4,
        category: "ACCESS_CTRL",
        title: "非本系參加資格",
        content: "本社團歡迎全校各系同學參加，非本系生無需額外審核，直接填寫報名表即可。",
        updatedAt: "2025-02-01",
    },
];

function today() {
    return new Date().toISOString().slice(0, 10);
}

function normaliseKnowledgeBase(entries) {
    if (!Array.isArray(entries)) throw new Error("entries must be an array.");
    if (entries.length > 50) throw new Error("The knowledge base can contain at most 50 entries.");

    const seenIds = new Set();
    return entries.map((entry, index) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            throw new Error(`entries[${index}] must be an object.`);
        }

        const id = Number(entry.id);
        if (!Number.isSafeInteger(id) || id <= 0 || seenIds.has(id)) {
            throw new Error(`entries[${index}].id must be a unique positive integer.`);
        }
        seenIds.add(id);

        const category = requireNonEmptyString(entry.category, `entries[${index}].category`).slice(0, 80);
        const title = requireNonEmptyString(entry.title, `entries[${index}].title`).slice(0, 200);
        const content = requireNonEmptyString(entry.content, `entries[${index}].content`).slice(0, 30000);
        const updatedAt = typeof entry.updatedAt === "string" && entry.updatedAt.trim()
            ? entry.updatedAt.slice(0, 40)
            : today();

        return { id, category, title, content, updatedAt };
    });
}

async function readKnowledgeBase() {
    try {
        const raw = await fs.promises.readFile(config.knowledgeBaseFile, "utf8");
        return { entries: normaliseKnowledgeBase(JSON.parse(raw)), persisted: true };
    } catch (error) {
        if (error && error.code === "ENOENT") {
            return { entries: DEFAULT_KNOWLEDGE_BASE.map((entry) => ({ ...entry })), persisted: false };
        }
        throw error;
    }
}

async function writeKnowledgeBase(entries) {
    await fs.promises.writeFile(
        config.knowledgeBaseFile,
        `${JSON.stringify(entries, null, 2)}\n`,
        { encoding: "utf8", mode: 0o600 }
    );
}

async function embedTexts(texts) {
    if (!Array.isArray(texts) || texts.length === 0) throw new Error("texts must contain at least one item.");
    if (texts.length > 50) throw new Error("A maximum of 50 texts can be embedded per request.");

    const ai = getAiClient();
    return Promise.all(
        texts.map(async (text) => {
            const response = await withAiRetry(() => ai.models.embedContent({
                model: config.embeddingModel,
                contents: [{ parts: [{ text: requireNonEmptyString(text, "text") }] }],
                config: aiHttpOptions(),
            }));
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

async function replaceRagSource(chunks, metadatas = [], docIdPrefix = "club_kb") {
    if (!Array.isArray(chunks)) throw new Error("chunks must be an array.");
    if (chunks.length > 50) throw new Error("A maximum of 50 chunks can be indexed at once.");

    const source = requireNonEmptyString(docIdPrefix, "docIdPrefix").slice(0, 80);
    const documents = chunks.map((chunk) => requireNonEmptyString(chunk, "chunk"));
    const embeddings = documents.length ? await embedTexts(documents) : [];
    const finalMetadatas = documents.map((_, index) => ({
        ...(metadatas[index] || {}),
        chunkIndex: index,
        source,
    }));
    const collection = await getChromaCollection();

    // Replacing this source avoids stale or duplicate answers after an admin edit.
    await collection.delete({ where: { source } });
    if (documents.length) {
        const ids = documents.map((_, index) => `${source}_${index}_${crypto.randomUUID()}`);
        await collection.add({ ids, embeddings, metadatas: finalMetadatas, documents });
    }

    return { indexedChunks: documents.length };
}

let knowledgeBaseIndexQueue = Promise.resolve();

function queueKnowledgeBaseIndex(entries) {
    const chunks = entries.map((entry) => `[${entry.category}] ${entry.title}\n${entry.content}`);
    const metadatas = entries.map(({ title, category }) => ({ title, category }));
    const task = knowledgeBaseIndexQueue.then(() => replaceRagSource(chunks, metadatas, "club_kb"));

    // Keep later saves queued even if this generation request fails temporarily.
    knowledgeBaseIndexQueue = task.catch(() => undefined);
    return task;
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
    const response = await withAiRetry(() => getAiClient().models.generateContent({
        model: config.generationModel,
        config: { responseMimeType: "application/json", ...aiHttpOptions() },
        contents: [
            { role: "user", parts: [{ inlineData: { data, mimeType } }] },
            {
                role: "user",
                parts: [{ text: "你是一個資料庫歸檔專員。解析檔案內容並輸出純 JSON：{\"title\":\"精確標題\",\"category\":\"DOCUMENT | EVIDENCE | AUDIO_LOG | IMG_DATA | MEETING_NOTE\",\"content\":\"OCR、摘要或逐字稿（繁體中文）\"}" }],
            },
        ],
    }));
    return JSON.parse(response.text?.trim() || "{}");
}

function normaliseWebImportUrl(value) {
    const rawUrl = requireNonEmptyString(value, "url");
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error("網址格式不正確，請輸入完整的 http:// 或 https:// 網址。");
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error("僅支援 http 或 https 網址。");
    }
    if (parsed.username || parsed.password) {
        throw new Error("網址不可包含帳號或密碼。");
    }
    if (/^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|::1)$/i.test(parsed.hostname)) {
        throw new Error("不允許匯入本機網址。");
    }
    return parsed.toString();
}

function isPrivateIpAddress(address) {
    if (isIP(address) === 4) {
        const [first, second] = address.split(".").map(Number);
        return first === 0
            || first === 10
            || first === 127
            || (first === 169 && second === 254)
            || (first === 172 && second >= 16 && second <= 31)
            || (first === 192 && second === 168);
    }

    const normalised = address.toLowerCase();
    if (normalised === "::" || normalised === "::1" || normalised.startsWith("fc") || normalised.startsWith("fd") || normalised.startsWith("fe80:" )) {
        return true;
    }

    const mappedIpv4 = normalised.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return Boolean(mappedIpv4 && isPrivateIpAddress(mappedIpv4));
}

async function assertPublicHostname(hostname) {
    if (/^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|::1)$/i.test(hostname)) {
        throw new Error("不允許匯入本機網址。");
    }

    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateIpAddress(address))) {
        throw new Error("網址必須指向公開網際網路位址。");
    }
}

function htmlToPlainText(markup) {
    return markup
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();
}

async function fetchPublicWebPage(url, signal) {
    let currentUrl = new URL(url);
    for (let redirects = 0; redirects <= 3; redirects += 1) {
        await assertPublicHostname(currentUrl.hostname);
        const response = await fetch(currentUrl, {
            headers: {
                Accept: "text/html,text/plain;q=0.9,*/*;q=0.1",
                "User-Agent": "AISCU-Knowledge-Importer/1.0",
            },
            redirect: "manual",
            signal,
        });

        if ([301, 302, 303, 307, 308].includes(response.status)) {
            const location = response.headers.get("location");
            if (!location) throw new Error("網址重新導向時缺少目的地。");
            currentUrl = new URL(location, currentUrl);
            if (!['http:', 'https:'].includes(currentUrl.protocol)) {
                throw new Error("網址重新導向到不支援的協定。");
            }
            continue;
        }

        if (!response.ok) {
            throw new Error(`網址內容無法讀取（網站回傳 ${response.status}）。`);
        }

        const body = await response.text();
        const contentType = response.headers.get("content-type") || "";
        return contentType.includes("text/html") ? htmlToPlainText(body) : body.trim();
    }
    throw new Error("網址重新導向次數過多。");
}

async function summariseMarkdown(markdown) {
    const content = requireNonEmptyString(markdown, "markdown").slice(0, 30000);
    const response = await withAiRetry(() => getAiClient().models.generateContent({
        model: config.generationModel,
        config: { responseMimeType: "application/json", ...aiHttpOptions() },
        contents: [{
            role: "user",
            parts: [{ text: `你是一個網路情資收集員。請將以下內容摘要為純 JSON：\n{"title":"網頁標題","category":"WEB_ARCHIVE","content":"繁中摘要"}\n\n內容：\n${content}` }],
        }],
    }));
    return JSON.parse(response.text?.trim() || "{}");
}

async function importWebUrl(url) {
    const sourceUrl = normaliseWebImportUrl(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.urlImportTimeoutMs);
    try {
        // The browser cannot reliably read arbitrary sites because of CORS.
        // Fetch only validated public URLs through the local backend instead.
        const markdown = (await fetchPublicWebPage(sourceUrl, controller.signal)).trim();
        if (!markdown) throw new Error("網址沒有可整理的文字內容。");
        return summariseMarkdown(markdown);
    } catch (error) {
        if (error && error.name === "AbortError") {
            throw new Error("網址讀取逾時，請稍後再試或改用其他網址。");
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
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

app.get("/api/admin/knowledge-base", async (_req, res, next) => {
    try {
        res.json(await readKnowledgeBase());
    } catch (error) {
        next(error);
    }
});

app.put("/api/admin/knowledge-base", async (req, res, next) => {
    try {
        const entries = normaliseKnowledgeBase(req.body?.entries);
        await writeKnowledgeBase(entries);
        log("info", `Knowledge base saved (${entries.length} entries).`);
        try {
            const { indexedChunks } = await queueKnowledgeBaseIndex(entries);
            log("info", `Knowledge base index updated (${indexedChunks} entries).`);
            res.json({ success: true, entries, indexStatus: "updated", indexedChunks });
        } catch (indexError) {
            const indexMessage = indexError instanceof Error ? indexError.message : "Unknown indexing error";
            log("warn", `Knowledge base saved, but index update is pending: ${indexMessage}`);
            res.json({ success: true, entries, indexStatus: "pending", indexError: indexMessage });
        }
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

app.post("/api/rag/replace", async (req, res, next) => {
    try {
        const { chunks, metadatas = [], docIdPrefix = "club_kb" } = req.body;
        res.json({ success: true, ...await replaceRagSource(chunks, metadatas, docIdPrefix) });
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
        const response = await withAiRetry(() => getAiClient().models.generateContent({
            model: config.generationModel,
            config: { systemInstruction: ragSystemInstruction(context), temperature: 0.3, ...aiHttpOptions() },
            contents: [{ role: "user", parts: [{ text: query }] }],
        }));
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

app.post("/api/rag/import/url", async (req, res, next) => {
    try {
        res.json(await importWebUrl(req.body?.url));
    } catch (error) {
        next(error);
    }
});

app.post("/api/rag/summarize", async (req, res, next) => {
    try {
        res.json(await summariseMarkdown(req.body.markdown));
    } catch (error) {
        next(error);
    }
});

if (fs.existsSync(config.frontendDistDir)) {
    app.use(express.static(config.frontendDistDir, {
        setHeaders(res, filePath) {
            // The embedded browser only executes ES modules when the response
            // has the standard JavaScript module MIME type.
            if (filePath.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            }
        },
    }));
    app.use((req, res, next) => {
        if (req.method === "GET" && req.accepts("html")) {
            return res.sendFile(path.join(config.frontendDistDir, "index.html"));
        }
        return next();
    });
}

app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Internal server error";
    log("error", `API error: ${message}`);
    const status = /\b503\b|UNAVAILABLE|high demand/i.test(message) ? 503 : 400;
    res.status(status).json({ success: false, message });
});

app.listen(config.port, config.host, () => {
    log("info", `AISCU local server listening at http://${config.host}:${config.port}`);
});
