import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";

// --- Configuration ---
const DROPZONE_DIR = path.join(process.cwd(), "dropzone");
const API_URL = "http://localhost:3000/api/ingest";
const API_KEY = process.env.INGEST_API_KEY || "super_secret_local_key_123";

// Ensure dropzone exists
fs.mkdir(DROPZONE_DIR, { recursive: true }).catch(console.error);

console.log(`\n🔭 Lunar Gallery Watcher started.`);
console.log(`📁 Watching directory: ${DROPZONE_DIR}`);
console.log(`⏳ Waiting for new astrophotography images...\n`);

// --- Processing Queue Setup ---
// We process files sequentially so we don't overwhelm the local LLaVA AI 
// when syncing large batches of photos at once.
const queue: string[] = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  const filepath = queue.shift()!;
  
  try {
    console.log(`\n[Watcher] 🚀 Processing file: ${path.basename(filepath)} (${queue.length} remaining in queue)`);
    
    // 1. Read file
    const fileBuffer = await fs.readFile(filepath);
    
    // 2. Prepare FormData
    const formData = new FormData();
    formData.append("file", fileBuffer, path.basename(filepath));

    // 3. Post to API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Watcher] ✅ Success! Photo processed and saved to database.`);
    if (data.photo?._title !== "Auto Upload") {
        if (data.photo?.title) console.log(`   └─ Title: ${data.photo.title}`);
        if (data.photo?.albumId) console.log(`   └─ Album: ${data.photo.albumId}`);
    } else {
        console.log(`   └─ Fallback: AI timeout. Saved as Auto Upload.`);
    }

    // 4. Delete the original file from the dropzone
    await fs.unlink(filepath);
    console.log(`[Watcher] 🧹 Cleaned up dropzone file.\n`);

  } catch (error) {
    console.error(`[Watcher] ❌ Failed to ingest file:`, error);
  } finally {
    isProcessing = false;
    processQueue(); // Process next file in queue
  }
}

// --- Watcher Setup ---
const watcher = chokidar.watch(DROPZONE_DIR, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
});

watcher.on("add", async (filepath) => {
  console.log(`[Watcher] 📸 Detected new file: ${path.basename(filepath)}`);

  const ext = path.extname(filepath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    console.warn(`[Watcher] ⚠️ Ignoring non-image file: ${path.basename(filepath)}`);
    return;
  }

  // Add to queue and kick off processor
  queue.push(filepath);
  processQueue();
});
