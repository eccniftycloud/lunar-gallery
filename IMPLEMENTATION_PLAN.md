# Lunar Gallery Active Implementation Plan

> **Note:** For completed modules (Phase 1 through 8), please refer to `CHANGELOG.md`. This document strictly tracks active and future developmental horizons.



## ☁️ Phase 9: Advanced Cloud Architecture (AWS Bedrock)
> *Goal: Transition the AI brain from a local LLaVA dependency to enterprise-grade AWS Bedrock models for increased accuracy, speed, and production deployment portability.*

- [ ] **9a — AWS Configuration**: Set up IAM roles, permissions, and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` safely in the `.env` file.
- [ ] **9b — Bedrock Adapter**: Rewrite the `/api/ingest` endpoint to utilize the `@aws-sdk/client-bedrock-runtime`. Determine the best multimodal model (e.g. Claude 3 Haiku/Sonnet or Titan Vision).
- [ ] **9c — Hybrid Toggle**: Implement a configuration toggle in the admin dashboard (or `.env`) allowing the user to seamlessly switch between "Local Mode" (Ollama) and "Cloud Mode" (Bedrock) depending on where the gallery is currently hosted.
- [ ] **9d — Parallel Cloud Ingestion**: Upgrade the `file-watcher.ts` async queue to process 5–10 photos concurrently via Bedrock, dramatically reducing batch sync times compared to single-threaded local Ollama.
- [ ] **9e — Token & Cost Telemetry Dashboard**: Add an admin widget tracking monthly Bedrock token usage and estimated cost to stay within AWS credit limits.

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

- [ ] **11a — Advanced Metadata Generation**: Refine the prompt schema in `AGENTS.md` and `/api/ingest/route.ts` to improve title and description quality (e.g., extracting specific astronomical objects, measuring aesthetic quality).
- [ ] **11b — Automated Tagging**: Introduce a robust tagging system powered by the updated AI model to automatically tag objects (e.g., "emission nebula", "globular cluster").
- [ ] **11c — Technical Specs Extraction**: Configure the AI to deeply analyze FITS/EXIF telemetry (Exposure time, Gain, Focal Length, Sensor Temp) and generate a clean "Technical Data" overlay inside the Lightbox.
- [ ] **11d — Capture Quality Scoring**: Have the AI formally critique astrophotography (star trailing, noise, focus) and assign a 1–10 quality score, enabling a "Best Of" sorting algorithm.
- [ ] **11e — Semantic Search**: Integrate vector embeddings (e.g. AWS Titan Embeddings) so users can search conversationally — *"Show me wide-field red nebulas"* or *"Photos of the moon in February"*.
