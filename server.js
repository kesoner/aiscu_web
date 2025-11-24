import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure applications directory exists
const applicationsDir = path.join(__dirname, 'applications');
if (!fs.existsSync(applicationsDir)) {
    fs.mkdirSync(applicationsDir);
}

// Encryption Key (In a real app, this should be an environment variable)
// Using a fixed key for demonstration purposes to ensure retrievability
const ENCRYPTION_KEY = crypto.scryptSync('aiscu-secret-key', 'salt', 32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// API Endpoint
app.post('/api/apply', (req, res) => {
    try {
        const formData = req.body;

        // Basic validation
        if (!formData.fullName || !formData.studentId || !formData.email) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const timestamp = new Date().toISOString();
        const dataToSave = {
            timestamp,
            ...formData
        };

        // Encrypt the data
        const jsonString = JSON.stringify(dataToSave);
        const encryptedData = encrypt(jsonString);

        // Create filename based on timestamp and student ID
        const safeStudentId = formData.studentId.replace(/[^a-z0-9]/gi, '_');
        const filename = `app_${Date.now()}_${safeStudentId}.json`;
        const filePath = path.join(applicationsDir, filename);

        // Save to file
        fs.writeFileSync(filePath, JSON.stringify({
            id: filename,
            encryptedData: encryptedData
        }, null, 2));

        console.log(`Application received and saved: ${filename}`);
        res.json({ success: true, message: 'Application submitted successfully' });

    } catch (error) {
        console.error('Error processing application:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
