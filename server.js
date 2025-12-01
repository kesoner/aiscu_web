import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// =============================
// Middleware
// =============================
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// =============================
// Ensure applications directory exists
// =============================
const applicationsDir = path.join(__dirname, 'applications');
if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir);
}

// =============================
// Encryption Setup
// =============================
const ENCRYPTION_KEY = crypto.scryptSync('aiscu-secret-key', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// =============================
// Application Form Endpoint
// =============================
app.post('/api/apply', (req, res) => {
    try {
        const formData = req.body;

        if (!formData.fullName || !formData.studentId || !formData.email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const timestamp = new Date().toISOString();
        const dataToSave = {
            timestamp,
            ...formData
        };

        const jsonString = JSON.stringify(dataToSave);
        const encryptedData = encrypt(jsonString);

        const safeStudentId = formData.studentId.replace(/[^a-z0-9]/gi, '_');
        const filename = `app_${Date.now()}_${safeStudentId}.json`;
        const filePath = path.join(applicationsDir, filename);

        fs.writeFileSync(
            filePath,
            JSON.stringify({ id: filename, encryptedData }, null, 2)
        );

        console.log(`Application received and saved: ${filename}`);
        res.json({ success: true, message: 'Application submitted successfully' });

    } catch (error) {
        console.error('Error processing application:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// =============================
// ChromaDB (Vector Store) Setup
// =============================
const CHROMA_COLLECTION_NAME = "aiscu_rag_collection";
let chromaClient = null;
let chromaCollection = null;

async function getChromaCollection() {
    if (!chromaClient) {
        chromaClient = new ChromaClient({
            path: "http://localhost:8000"
        });
    }

    if (!chromaCollection) {
        try {
            chromaCollection = await chromaClient.getOrCreateCollection({
                name: CHROMA_COLLECTION_NAME
            });
            console.log("ChromaDB Collection Initialized:", CHROMA_COLLECTION_NAME);
        } catch (e) {
            console.error("Failed to init Chroma Collection:", e);
            throw e;
        }
    }

    return chromaCollection;
}

// =============================
// RAG API: Ingest Documents
// =============================
app.post('/api/rag/ingest', async (req, res) => {
    try {
        const { ids, embeddings, metadatas, documents } = req.body;

        if (!ids || !embeddings || !documents) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const col = await getChromaCollection();
        await col.add({ ids, embeddings, metadatas, documents });

        console.log(`Ingested ${ids.length} chunks to Chroma.`);
        res.json({ success: true, message: `Ingested ${ids.length} chunks` });

    } catch (error) {
        console.error("Ingest error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================
// RAG API: Query
// =============================
app.post('/api/rag/query', async (req, res) => {
    try {
        const { queryEmbeddings, nResults } = req.body;

        if (!queryEmbeddings) {
            return res.status(400).json({
                success: false,
                message: "Missing queryEmbeddings"
            });
        }

        const col = await getChromaCollection();
        const results = await col.query({
            queryEmbeddings,
            nResults: nResults || 3
        });

        res.json({ success: true, results });

    } catch (error) {
        console.error("Query error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// =============================
// Start Server
// =============================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
