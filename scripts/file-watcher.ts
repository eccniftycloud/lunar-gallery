import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
// Phase 9d: Upgraded to Parallel Processing (Optimized for AWS Bedrock)
// We dynamically check Prisma to see if we are using Cloud (limit 5) or Local (limit 1)
const queue: string[] = [];
let activeWorkers = 0;

async function processFile(filepath: string, maxConcurrency: number) {
  try {
    console.log(`\n[Watcher] 🚀 Processing file: ${path.basename(filepath)} [Active: ${activeWorkers}/${maxConcurrency}, Queued: ${queue.length}]`);
    
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
    console.log(`[Watcher] ✅ Success: ${path.basename(filepath)}`);
    if (data.photo?._title !== "Auto Upload") {
        if (data.photo?.title) console.log(`   └─ Title: ${data.photo.title}`);
        if (data.photo?.albumId) console.log(`   └─ Album: ${data.photo.albumId}`);
    } else {
        console.log(`   └─ Fallback: AI timeout. Saved as Auto Upload.`);
    }

    // 4. Delete the original file from the dropzone
    await fs.unlink(filepath);
    console.log(`[Watcher] 🧹 Cleaned up: ${path.basename(filepath)}\n`);

  } catch (error) {
    console.error(`[Watcher] ❌ Failed to ingest file (${path.basename(filepath)}):`, error);
  }
}

async function processQueue() {
  if (queue.length === 0) return;

  // Dynamically fetch the current AI mode from the database to aggressively protect your local hardware.
  let maxConcurrency = 5; // Default for cloud
  try {
      const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
      if (config?.aiMode === "local") {
          maxConcurrency = 1; // Strict single-threading for LLaVA
      }
  } catch (e) {
      console.warn("[Watcher] Could not determine max concurrency from DB, defaulting to 1 for safety.");
      maxConcurrency = 1;
  }

  while (activeWorkers < maxConcurrency && queue.length > 0) {
    const filepath = queue.shift()!;
    activeWorkers++;
    processFile(filepath, maxConcurrency).finally(() => {
      activeWorkers--;
      processQueue(); // Kick off next item when a worker frees up
    });
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
