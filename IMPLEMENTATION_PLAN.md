# Lunar Gallery Active Implementation Plan

> **Note:** For completed modules (Phase 1 through 8), please refer to `CHANGELOG.md`. This document strictly tracks active and future developmental horizons.



## 🛠️ Phase 8.5: Final Polish & Predefined Categorization (Reopened ×2)
> *Goal: Eliminate UI blank spaces on desktop and install a locked structure of predefined astrophotography albums to perfectly guide the AI Brain.*

- [x] **8.5a (Reopened) — Desktop Masonry Stretch**: The images under a desktop chrome browser are on their original size leaving blankspace. Ensure `Next/Image` overrides intrinsic width caps dynamically to fill the `w-full` masonry blocks without distortion.
- [x] **8.5b — Predefined Album Seeding**: Established the 8 exact presets.
- [x] **8.5c — Beautiful Preset Covers**: Generated covers logically.
- [x] **8.5d — AI Prompt Lock-in**: Updated `/api/ingest/route.ts` and `AGENTS.md` perfectly.
- [x] **8.5e — Lightbox Border-Frame Hug**: The `PhotoLightbox.tsx` glowing border frame currently uses a fixed `max-h-[75vh]` container with `object-contain`, causing massive black bars above/below (landscape) or beside (portrait) images inside the border. Refactor so the glowing border frame **tightly hugs the actual image dimensions** — no black padding inside the frame. The image should dictate the container size, not the other way around. Keep `max-h` and `max-w` viewport guards so images never overflow the screen, but the frame must shrink-wrap to the rendered image.
- [x] **8.5f — Lightbox Desktop Aspect-Ratio Audit**: Test all 8 album categories on a desktop Chrome browser (landscape, portrait, and square source images). Verify zero visible black bars between the image edges and the glowing border on every single photo. The info pane (title + description) sits directly below the image with no gap.
- [x] **8.5g — Mobile Regression Guard**: Confirm the lightbox still renders correctly on mobile viewports (≤768px) after the desktop refactor. No horizontal overflow, no cropping, info pane still legible.

## 📷 Phase 8.7: Pro 3-Tier Image Pipeline (Fidelity Upgrade)
> *Goal: Adopt an industry-standard multi-tier image strategy (like Google Photos, Flickr, Apple Photos) so that every photo is stored at full fidelity, displayed at the best resolution for the viewer's screen, and loads instantly in the masonry grid — future-proofed for any telescope resolution.*

- [x] **8.7a — Prisma Schema Update**: Add a `displayUrl` field to the `Photo` model alongside the existing `url` (thumb) and `highResUrl` (original). Run `prisma db push` to migrate.
- [x] **8.7b — 3-Tier Sharp Pipeline**: Refactor `/api/ingest/route.ts` to generate **3 files** per upload:
  - **Original** (`highres-*`) — untouched binary, stored forever for download/zoom.
  - **Display** (`display-*`, max **2560px** wide) — used by the lightbox. Sharp resizes with `withoutEnlargement: true` so small originals (e.g. Seestar S50 at 1080px) stay native and are never artificially upscaled.
  - **Thumbnail** (`thumb-*`, max **600px** wide) — used by the masonry grid cards. Tiny file size (~30–50KB) for fast gallery browsing.
- [x] **8.7c — Backfill Script**: Create `scripts/backfill-3tier.ts` to retroactively process all existing photos. Reads each photo's `highResUrl` original, generates the missing `display` and smaller `thumb` tiers, and updates the database. Idempotent — safe to run multiple times.
- [x] **8.7d — Component Wiring**: Update `PhotoCard.tsx` to use the new `thumb` URL (600px) for the masonry grid. Update `PhotoLightbox.tsx` to load the `display` URL (2560px) instead of falling back to the thumbnail. Both use `highResUrl` only as a "View Full Resolution" option.
- [x] **8.7e — Native Resolution Cap**: Add `max-w` and `max-h` inline styles to the lightbox `<img>` matching the image's actual pixel dimensions (from the database `width`/`height` fields). This guarantees the browser **never upscales** beyond the image's native resolution — if the display tier is 1080px wide, the lightbox frame caps at 1080px. When a future 6000px telescope image arrives, the lightbox naturally scales up to fill the screen.
- [x] **8.7f — Grid Performance Audit**: Verify that the `/photos` and `/albums/[id]` pages load noticeably faster with the smaller 600px thumbnails. Compare before/after total page weight using Chrome DevTools Network tab.

## 🔧 Phase 8.8: Lightbox Info Pane Width Fix (Desktop Audit)
> *Goal: Fix the remaining lightbox layout issue where the info pane (title + description text) stretches the glowing border frame wider than the image, causing a dark gap on the right side for portrait-orientation photos on wide desktop viewports.*

**Root Cause**: On wide desktop viewports (1400px+), the flex container's width is driven by the **longest child**. When a long description spans wider than the 1080px portrait image, the container grows to fit the text — but the image stays at 1080px, leaving an empty dark strip on the right between the image edge and the border. Verified via full visual audit of all 32 photos across all albums.

**Affected photos** (confirmed via Chrome screenshots):
- IC 434: A Magnificent Star-forming Nebula — large gap right side
- Moonlit Jupiter — large gap right side
- M13 Hercules Globular Cluster — large gap right side
- Messier 108 — gap visible when viewed on wider viewports
- Multiple other portrait photos with long descriptions

- [x] **8.8a — Info Pane Width Constraint**: Refactor `PhotoLightbox.tsx` so the info pane (title + description div) width is constrained to match the **rendered image width**, not the viewport. The image must dictate the container width — the info pane should never stretch wider than the image above it.
- [x] **8.8b — Full Desktop Audit**: Verify every photo lightbox across all 8 album categories on a 1920px+ desktop Chrome browser. Confirm zero dark gaps on any side between the image edges and the glowing border frame.
- [x] **8.8c — Mobile Regression Check**: Confirm the info pane still renders properly on mobile viewports (≤768px) — no text truncation, no overflow.

## 🔄 Phase 8.9: Seestar Landscape Rotation & Card Polish
> *Goal: The Seestar S50 sensor (Sony IMX462) captures at 1920×1080 (16:9 landscape) but the physical mount rotates the output to 1080×1920 (9:16 portrait). This phase adds an optional pipeline rotation to convert images to their natural landscape orientation for desktop-friendly display, and fixes card description overflow in the masonry grid.*

- [x] **8.9a — Description Card Clamp**: Tighten `line-clamp` from 3 to 2 lines on PhotoCard descriptions to prevent long AI-generated text from overflowing card margins. Full text still visible in lightbox.
- [x] **8.9b — Pipeline Rotation Toggle**: Add an optional rotation step in `/api/ingest/route.ts` that detects Seestar S50 portrait images (1080×1920 with "Seestar" in EXIF Make) and rotates them 90° clockwise to 1920×1080 landscape before generating the 3-tier files. Controlled by an env var `ROTATE_SEESTAR=true`.
- [x] **8.9c — Backfill Rotation Script**: Create `scripts/backfill-rotate.ts` to retroactively rotate existing 1080×1920 Seestar photos to landscape and regenerate all 3 tiers.
- [x] **8.9d — Visual Verification**: Verify rotated images display correctly in both lightbox and masonry grid — telemetry overlay text (Seestar S50, coordinates, target) should read naturally in landscape.

## ☁️ Phase 9: Advanced Cloud Architecture (AWS Bedrock)
> *Goal: Transition the AI brain from a local LLaVA dependency to enterprise-grade AWS Bedrock models for increased accuracy, speed, and production deployment portability.*

- [ ] **9a — AWS Configuration**: Set up IAM roles, permissions, and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` safely in the `.env` file.
- [ ] **9b — Bedrock Adapter**: Rewrite the `/api/ingest` endpoint to utilize the `@aws-sdk/client-bedrock-runtime`. Determine the best multimodal model (e.g. Claude 3 Haiku/Sonnet or Titan Vision).
- [ ] **9c — Hybrid Toggle**: Implement a configuration toggle in the admin dashboard (or `.env`) allowing the user to seamlessly switch between "Local Mode" (Ollama) and "Cloud Mode" (Bedrock) depending on where the gallery is currently hosted.
