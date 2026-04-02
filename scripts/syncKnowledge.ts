
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually since we don't have dotenv
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf-8');
    return Object.fromEntries(
        content.split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => {
                const [key, ...vals] = line.split('=');
                return [key.trim(), vals.join('=').trim()];
            })
    );
}

const env = loadEnv();
const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in .env.local or process.env");
    process.exit(1);
}

const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta'
});

async function syncKnowledge() {
    const knowledgeDir = path.resolve(__dirname, '../knowledge');
    if (!fs.existsSync(knowledgeDir)) {
        console.error("Knowledge folder not found!");
        return;
    }

    function getAllFiles(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                getAllFiles(filePath, fileList);
            } else if (file.endsWith('.txt') || file.endsWith('.md')) {
                fileList.push(filePath);
            }
        });
        return fileList;
    }

    const allFiles = getAllFiles(knowledgeDir);
    if (allFiles.length === 0) {
        console.log("No .txt or .md scripts found in knowledge/ folder.");
        return;
    }

    let storeId = env.VITE_GEMINI_FILE_SEARCH_STORE_ID || env.GEMINI_FILE_SEARCH_STORE_ID;
    let store;

    // 1. Ensure File Search Store exists
    if (storeId) {
        try {
            console.log(`Checking existing store: ${storeId}`);
            store = await ai.fileSearchStores.get({
                name: storeId.startsWith('fileSearchStores/') ? storeId : `fileSearchStores/${storeId}`
            });
            console.log(`Found existing store: ${store.displayName}`);
        } catch (e) {
            console.warn(`Store ${storeId} not found or inaccessible. Creating new one.`);
            storeId = null;
        }
    }

    if (!storeId) {
        console.log("Creating new File Search Store...");
        store = await ai.fileSearchStores.create({
            config: { displayName: 'Zoop Knowledge Base' }
        });
        storeId = store.name;
        console.log(`Created store: ${storeId}`);

        // Update .env.local
        const envPath = path.resolve(__dirname, '../.env.local');
        let currentContent = fs.readFileSync(envPath, 'utf-8');
        if (!currentContent.includes('VITE_GEMINI_FILE_SEARCH_STORE_ID') && !currentContent.includes('GEMINI_FILE_SEARCH_STORE_ID')) {
            fs.appendFileSync(envPath, `\nVITE_GEMINI_FILE_SEARCH_STORE_ID=${storeId}\n`);
        } else {
            currentContent = currentContent.replace(/VITE_GEMINI_FILE_SEARCH_STORE_ID=.*/, `VITE_GEMINI_FILE_SEARCH_STORE_ID=${storeId}`);
            currentContent = currentContent.replace(/GEMINI_FILE_SEARCH_STORE_ID=.*/, `GEMINI_FILE_SEARCH_STORE_ID=${storeId}`);
            fs.writeFileSync(envPath, currentContent);
        }
        console.log("Updated .env.local with new Store ID");
    }

    // 2. Upload files
    console.log(`Syncing ${allFiles.length} files to store ${storeId}...`);
    for (const filePath of allFiles) {
        const file = path.basename(filePath);
        const mimeType = file.endsWith('.md') ? 'text/markdown' : 'text/plain';
        console.log(`Uploading: ${file} (${mimeType})`);
        try {
            const op = await ai.fileSearchStores.uploadToFileSearchStore({
                fileSearchStoreName: storeId,
                file: filePath,
                config: {
                    mimeType
                }
            });
            console.log(`Upload initiated for ${file}. Operation: ${op.name}`);
        } catch (e: any) {
            console.error(`Failed to upload ${file}:`, e.message);
        }
    }

    console.log("Sync process complete!");
}

syncKnowledge().catch(err => {
    console.error("Fatal error during sync:", err);
    process.exit(1);
});
