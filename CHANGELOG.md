# Changelog

All notable changes to the Lunar Gallery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased / Next Feature]
- **Search:** Real-time search feature using case-insensitive SQLite queries and a glassmorphism UI overlay.
- **Backfill Script:** Idempotent script (`scripts/backfill-dimensions.ts`) to populate missing width/height for old photos using sharp.
- **Sorting:** Dynamic gallery sorting (Newest, Oldest, A→Z) with smooth layout transitions.
- **Loading Skeletons:** Animated nebula-purple shimmer placeholders (`skeleton-shimmer`) for sort transitions and slow connections.
- **Toast Notifications:** Centralized `ToastProvider` with spring animations for success (green), error (red), and info (purple) feedback.
- **Backup Script:** Added local SQLite and uploads backup script (`scripts/backup.sh`) with `--restore` capability and auto-cleanup.
- **Rate Limiting:** Zero-dependency in-memory rate limiter protecting upload (10/5min) and login (5/min) endpoints.
- **Auto-Ingest API:** New `/api/ingest` endpoint protected by `INGEST_API_KEY` that automatically resizes and maps uploads directly to the database.
- **AI "Brain" Adapter:** Integrated `Ollama/LLaVA` directly into the ingest pipeline to automatically generate beautiful Titles, Descriptions, and dynamically assign Albums without user input.
- **Google Drive Bridge:** Created `scripts/sync-drive.sh` utilizing `rclone copy` to automatically pull astrophotography straight from the user's tablet cloud sync to the local server.
- **Async File Watcher:** Built an invisible, node-based file watcher (`scripts/file-watcher.ts`) leveraging `chokidar` with a custom asynchronous queue, ensuring large sync batches are processed flawlessly and sequentially by the local AI model.

## [1.1.0] - 2026-03-30
### Added
- **Pro 3-Tier Image Pipeline (Phase 8.7):** Industry-standard multi-tier image strategy for every photo:
  - **Original** (`highres-*`) — untouched binary preserved forever for download/zoom.
  - **Display** (`display-*`, max 2560px) — optimized for lightbox viewing. Uses Sharp `withoutEnlargement: true` so small originals stay native.
  - **Thumbnail** (`thumb-*`, max 600px) — optimized for masonry grid. Tiny file sizes (~30-50KB) for instant gallery browsing.
- **Prisma Schema:** Added `displayUrl` field to the `Photo` model for the display tier.
- **Backfill Script:** Created `scripts/backfill-3tier.ts` to retroactively upgrade all 32 existing photos to the 3-tier format. Idempotent — safe to rerun.
- **Native Resolution Cap (Phase 8.7e):** Lightbox image `max-width`/`max-height` capped to actual pixel dimensions, preventing browser upscaling beyond native resolution. Future high-res telescope images will automatically fill the screen.
- **Component Wiring:** `displayUrl` piped through `PhotoCard`, `PhotoLightbox`, `PaginatedGallery`, `SearchBar`, and homepage. Grid uses thumb (600px), lightbox uses display (2560px).

### Fixed
- **Lightbox Info Pane Overflow (Phase 8.8a):** Long description text was stretching the glowing border frame wider than the image on desktop viewports, creating a dark gap on the right side of portrait photos. Fixed by using `inline-flex` container + `w-0 min-w-full` on the info pane so the image dictates width and text wraps within it.
- **Lightbox Desktop Audit (Phase 8.8b):** Verified all 32 photos across 4 album categories — zero dark gaps on any side.
- **Description Card Overflow (Phase 8.9a):** Tightened `line-clamp` from 3 to 2 lines on PhotoCard descriptions to prevent long AI-generated text from overflowing masonry card margins. Full descriptions remain visible in lightbox.

## [1.0.1] - 2026-02-24
### Fixed
- **Authentication:** `AUTH_URL` environment variable fixed to support Cloudflare Tunnel / reverse proxy redirects properly (no longer defaulting to localhost).
- **Documentation:** Updated README.md security section explicitly warning users to set `AUTH_URL` matching their production domain.

## [1.0.0] - Launch Release
### Added
- **Core:** Next.js 14 App Router integration with Prisma and SQLite.
- **Auth:** NextAuth.js setup for admin authentication using bcrypt hashed passwords.
- **Uploads:** Sharp integration for automatic image resizing (max 1080x1080).
- **Database:** Models for `Photo`, `Album`, and a singleton `AdminConfig`.
- **UI:** A completely custom, dark-mode cosmic design system built with Tailwind CSS (featuring deep space background, aurora text gradients, and glassmorphism panels).
- **Features:** 
  - Dynamic, editable site title.
  - Paginated gallery feed.
  - Masonry-style album covers mimicking Apple Photos.
  - Full-screen lightbox mode for photo viewing.
  - Admin-only routes for creating albums, uploading photos, and deleting items.
- **Docker:** Production-ready `Dockerfile` and `docker-compose.yml` with persistent volume mounts for database and uploaded images.
# Lunar Gallery: Completed Phases Archive

This document preserves the historical implementation details of Lunar Gallery.
For current and active tasks, refer to `IMPLEMENTATION_PLAN.md`.

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

##  Phase 5: Performance & Deployment
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
- [x] **8c — EXIF/FITS Metadata Parsing**: Installed `exifr` package and injected real-time parsing into `/api/ingest`. Analyzes buffer directly and isolates embedded targets/coords/telemetry before running AI.
- [x] **8d — Improved AI Prompting**: Hooked EXIF telemetry gracefully into the LLaVA prompt format, giving the computer vision model highly accurate context to confidently name and sort celestial objects.
- [x] **8e — Album Layout & Consistency**: Ensure dynamic Album categories generated by AI have correct `coverImage` references spanning to thumbnails, explicitly preserving user's structural workflow.
- [x] **8f — High Fidelity Aesthetics Check**: The `PhotoCard` generated thumbnails are maintaining original aspect ratios inappropriately. Refactor Next.js `<Image>` object-fit classes so they elegantly stretch to conform uniformly without black padding or scaling issues.
- [x] **8g — Precision AI Architecture Tuning**: Improve Ollama "rules of engagement" or migrate the "brain" prompt instructions to force the AI to respect precise categories (i.e. routing any moon telemetry accurately to "Lunar" strictly).

## ✅ Phase 8.5: Final Polish & Predefined Categorization
> *Goal: Eliminate UI blank spaces on desktop and install a locked structure of predefined astrophotography albums to perfectly guide the AI Brain.*

- [x] **8.5a — Desktop Masonry Stretch**: Refactored CSS `object-fit` and height attributes on `PhotoCard` so images fully stretch to fill borders on desktop seamlessly.
- [x] **8.5b — Predefined Album Seeding**: Established a strict, predefined set of Albums in the database: *Solar System, Moon, Sun, Galaxies, Nebula, Superclusters, Constellations, Comets*.
- [x] **8.5c — Beautiful Preset Covers**: Generated and injected high-fidelity predefined aesthetic thumbnail covers for each of the 8 locked albums.
- [x] **8.5d — AI Prompt Lock-in**: Updated `/api/ingest/route.ts` and the `AGENTS.md` ruleset to restrict LLaVA strictly to the 8 predefined categories.
