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
