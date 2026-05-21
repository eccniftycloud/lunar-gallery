# Lunar Gallery Active Implementation Plan

> **Note:** For completed modules (Phase 1 through 8), please refer to `CHANGELOG.md`. This document strictly tracks active and future developmental horizons.



## ☁️ Phase 9: Advanced Cloud Architecture (AWS Bedrock)
> *Goal: Transition the AI brain from a local LLaVA dependency to enterprise-grade AWS Bedrock models for increased accuracy, speed, and production deployment portability.*

- [x] **9a — Scoped AWS Credentials (Dev)**: Create a highly restricted IAM User specifically for the local dev environment (allowing only `bedrock:InvokeModel`) and securely store `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in `.env`.
- [x] **9b — Hybrid AI Toggle**: Implement an admin UI toggle allowing seamless switching between "Local AI" (Ollama) and "Cloud AI" (Bedrock) to protect credits during simple local tasks.
- [x] **9c — Bedrock Adapter**: Update `/api/ingest` and Server Actions to utilize `@aws-sdk/client-bedrock-runtime` for cloud-based ingestion, selecting an appropriate multimodal model (e.g., Claude 3 Haiku).
- [x] **9d — Parallel Cloud Ingestion**: Upgrade the `file-watcher.ts` queue to process 5–10 photos concurrently via Bedrock, drastically reducing batch sync times.
- [x] **9e — Cost & Token Telemetry**: Build an admin dashboard widget to track monthly Bedrock token usage and estimated costs, ensuring we stay within AWS credit limits.
- [x] **9f — Containerization & EC2 Prep (Prod)**: Refine `Dockerfile` and `docker-compose.yml` for production AWS deployment, ensuring SQLite databases and image volumes persist correctly on EC2 block storage.
- [x] **9g — Keyless Security (Prod)**: Assign an IAM Instance Role to the EC2 server, completely removing the need for `.env` access keys in production to achieve "Gold Standard" AWS security *(Completed natively: `BedrockRuntimeClient` falls back to EC2 Instance Metadata without code changes).*

## 🖼️ Phase 10: Masonry Grid Layout Alignment & UI Polish
> *Goal: Unify the aspect ratio and grid alignment for all photo cards across all albums to ensure a perfectly consistent and aesthetically pleasing grid layout, with premium interactive polish.*

- [x] **10a — Consistent Card Dimensions**: Implement logic or CSS to ensure all photo cards in the masonry grid maintain a consistent visual alignment, regardless of the intrinsic aspect ratio of the thumbnail image.
- [x] **10b — Visual Verification**: Review all albums on desktop and mobile to ensure the grid alignment feels uniform and deliberate.
- [x] **10c — Grid/Masonry UI Toggle**: Add a glassmorphism toggle button allowing users to switch between the rigid square CSS Grid layout and the classic Pinterest-style masonry waterfall view.
- [x] **10d — Cosmic Skeletons (BlurHash)**: Extract dominant color or a tiny blur preview during the `sharp` pipeline and use it to tint loading skeleton placeholders with the actual hue of the celestial object before the full image loads.
- [x] **10e — Expanded Homepage Albums**: Display all 8 predefined albums on the homepage by default instead of only 4, ensuring the full observatory is immediately visible to visitors.
- [x] **10f — Astronomy Current Events Section**: Add a curated "Current Events" section to the homepage (max 4 cards) for timely astronomical topics like Artemis missions, eclipses, meteor showers, and space news — keeping the gallery feeling alive and connected to the real sky.

## 🧠 Phase 11: Improved AI Capabilities for Auto-Upload
> *Goal: Upgrade the auto-ingestion AI logic to produce even richer, more accurate metadata and support custom user-defined triggers or improved detection.*

- [x] **11a — Advanced Metadata Generation**: Refine the prompt schema in `AGENTS.md` and `/api/ingest/route.ts` to improve title and description quality (e.g., extracting specific astronomical objects, measuring aesthetic quality).
- [x] **11b — Automated Tagging**: Introduce a robust tagging system powered by the updated AI model to automatically tag objects (e.g., "emission nebula", "globular cluster").
- [x] **11c — Technical Specs Extraction**: Configure the AI to deeply analyze FITS/EXIF telemetry (Exposure time, Gain, Focal Length, Sensor Temp) and generate a clean "Technical Data" overlay inside the Lightbox.
- [x] **11d — Local AI Model Upgrade**: Replace Ollama LLaVA 7B with Llama 3.2 Vision 11B for significantly improved local classification accuracy, structured JSON reliability, and astronomical knowledge — while remaining CPU-compatible on the Ryzen AI 9 HX 370.

## 📱 Phase 12: Mobile Experience Overhaul & Layout Fixes
> *Goal: Refine the mobile UX to feel like a native application (e.g., Instagram), fix residual desktop padding issues, and guarantee true readability across all viewport sizes.*

- [ ] **12a — Mobile Feed Redesign:** Convert the mobile grid to an immersive vertical scrolling feed (Instagram-style) where image text fits perfectly beneath the photo without feeling cramped.
- [x] **12b — Desktop Grid Padding Fix:** Resolve the `max-w-7xl` misalignment introduced previously to restore perfectly centered, uniform padding for the Desktop UI without shrinking cards.
- [ ] **12c — Responsive Text Scaling:** Adjust the text typography inside the Lightbox and Photocards to scale dynamically on smaller phones so titles and descriptions never overlap or crowd the visual framing.
- [ ] **12d — Seamless Mobile Modals:** Ensure the new technical data panels and image details expand smoothly within the mobile flow without blowing out the device width or hijacking the scroll momentum.
- [ ] **12e — Design System Documentation (UI.md):** Create a master `UI.md` reference to codify glassmorphism tokens, mobile breakpoints, and accessibility standards to prevent layout regressions in future phases.
