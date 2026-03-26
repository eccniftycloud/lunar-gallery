# Lunar Gallery Implementation Plan & Checklist

## ✅ Phase 1: Core Setup & Infrastructure
- [x] **Project Initialization**: Next.js App Router, TypeScript, Tailwind CSS.
- [x] **Database Setup**: SQLite with Prisma ORM (`User`, `Account`, `Session`, `Photo`, `Album` models).
- [x] **Authentication**: NextAuth.js (Auth.js) with Discord Provider.
- [x] **UI Framework**: Glassmorphism design system (`globals.css`), Framer Motion integration.
- [x] **Layout**: Responsive layout with sidebar navigation (`Sidebar.tsx`) and animated background (`GlassCanvas.tsx`).

## ✅ Phase 2: Photo Management
- [x] **Upload Feature**:
    - [x] Drag-and-drop upload form (`UploadForm.tsx`).
    - [x] Server Actions for handling file uploads (`uploadPhoto`).
    - [x] Album selection dropdown.
    - [x] Metadata support (Title, Description).
- [x] **Gallery Display**:
    - [x] Masonry grid layout for photos.
    - [x] Responsive columns (1-4 columns based on screen width).
    - [x] Loading states and empty states.
- [x] **Admin Actions**:
    - [x] Edit photo details (Title, Description) with inline form overlay.
    - [x] Delete photo functionality with confirmation modal.
    - [x] Persistent action bar for admins (Edit/Delete buttons).
    - [x] Server-side validation and revalidation.

## ✅ Phase 3: Album Features
- [x] **Album Management**:
    - [x] Create new albums.
    - [x] Assign photos to albums.
    - [x] Cover image support (auto-selected from first photo).
- [x] **Views**:
    - [x] Album listing page (`/albums`).
    - [x] Individual album detail page (`/albums/[id]`).
    - [x] Filtered photo grid for specific albums.

## ✅ Phase 4: UX & Polish
- [x] **Mobile Responsiveness**:
    - [x] Collapsible sidebar with hamburger menu for mobile/tablet.
    - [x] Optimized grid layouts for smaller screens.
    - [x] Touch-friendly tap targets.
- [x] **Immersive Viewing**:
    - [x] **Full-Screen Lightbox**: Custom modal with React Portal.
    - [x] **Cosmic Animations**: Spinning rings, floating particles, glowing borders.
    - [x] **Zoom & Pan**: Smooth entry/exit animations.
    - [x] **Expanded Info**: Full title and description displayed in the lightbox.
- [x] **Bug Fixes**:
    - [x] Fixed "Edit/Delete" button click handling by using Portals/z-index.
    - [x] Resolved text visibility issues by moving info out of hover-only overlay.
- [x] **Dynamic Site Title**: Admin-configurable site title with cosmic starlight effect.

## � Phase 5: Performance & Deployment
- [x] **Docker Support**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, standalone build.
- [x] **Image Optimization (Backend)**: `sharp` installed, `uploadPhoto` auto-resizes to 1080x1080 square and saves width/height to DB.
- [x] **Image Optimization (Frontend)**: `PhotoCard` uses `next/image` when dimensions are available.
- [x] **Pagination (Backend)**: `getPhotos()` supports `page` and `limit` parameters.
- [x] **Pagination (UI)**: "Load More" button on gallery pages.
- [x] **Backfill Script**: Populate width/height for existing photos.
- [x] **Search**: Filter photos by title/description.
- [x] **Sorting**: Sort photos by date (newest/oldest) or name (A-Z).

## 🔜 Phase 6: Polish & Extras (Ideas)
- [x] **Loading Skeletons**: Animated shimmer placeholders while photos load.
- [x] **Toast Notifications**: Success/error popups for upload, edit, delete actions.
- [ ] **Drag-to-Reorder**: Manually sort albums.
- [x] **Backup Script**: Automated SQLite DB + uploads backup with restore support.
- [x] **Rate Limiting**: Protect upload and login endpoints from abuse.

## 🔭 Phase 7: Auto-Ingest Pipeline (Concept)
> *Goal: Snap a photo on your telescope app → it appears in the right album, labeled, automatically.*

- [x] **7a — The Bucket (MCP / Folder Watcher)**: Fully implemented local watcher connecting Google Drive via `rclone` with an async queue to seamlessly ingest Astrophotography.
- [x] **7b — The Brain (AI Architecture)**: Built API Ingest endpoint utilizing Local AI (Ollama + LLaVA) running safely with a fallback API structure.
- [x] **7c — Auto-Filing Task**: End-to-end integration mapping "What celestial object is this?" dynamically to existing database albums or creating new categorized ones.
- [x] **7d — The Push Workflow (API Endpoint)**: A secure `/api/ingest` endpoint protected by `INGEST_API_KEY` for manual or automated uploads.
- [x] **7e — The Orchestrator**: Replaced Redis/BullMQ with a lightweight, built-in async queue in `file-watcher.ts` to coordinate uploads asynchronously without external dependencies.

## 🛠️ Phase 8: Bug Fixes & High-Fidelity Enhancements
> *Goal: Fix viewing issues, preserve telescope metadata for accurate AI categorization, and implement high-res viewing.*

- [x] **8a — Lightbox Bug Fix**: Fixed the bug where some images couldn't be viewed fully. The lightbox now scales correctly up to 95vw safely using CSS Flex boundaries.
- [x] **8b — High-Resolution Storage**: Modified the `.prisma` schema and the `sharp` ingestion pipeline. Create two versions of uploaded images: a `1080p` thumbnail for the gallery grid, and store the *original high-res* version natively which is selectively fetched when expanding the Lightbox view.
- [ ] **8c — EXIF/FITS Metadata Parsing**: Astrophotography files often contain built-in metadata (coordinates, target name). Parse this EXIF data using an npm package before sending it to LLaVA.
- [ ] **8d — Improved AI Prompting**: Feed the parsed EXIF metadata into the Ollama prompt to guarantee 100% accurate categorization (e.g., "Nebula", "Galaxy", "Solar System") instead of solely relying on vision inference.

## ☁️ Phase 9: Advanced Cloud Architecture (AWS Bedrock)
> *Goal: Transition the AI brain from a local LLaVA dependency to enterprise-grade AWS Bedrock models for increased accuracy, speed, and production deployment portability.*

- [ ] **9a — AWS Configuration**: Set up IAM roles, permissions, and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` safely in the `.env` file.
- [ ] **9b — Bedrock Adapter**: Rewrite the `/api/ingest` endpoint to utilize the `@aws-sdk/client-bedrock-runtime`. Determine the best multimodal model (e.g. Claude 3 Haiku/Sonnet or Titan Vision).
- [ ] **9c — Hybrid Toggle**: Implement a configuration toggle in the admin dashboard (or `.env`) allowing the user to seamlessly switch between "Local Mode" (Ollama) and "Cloud Mode" (Bedrock) depending on where the gallery is currently hosted.
