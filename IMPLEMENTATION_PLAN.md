# Lunar Gallery Active Implementation Plan

> **Note:** For completed modules (Phase 1 through 8), please refer to `CHANGELOG.md`. This document strictly tracks active and future developmental horizons.



## ☁️ Phase 9: Advanced Cloud Architecture (AWS Bedrock)
> *Goal: Transition the AI brain from a local LLaVA dependency to enterprise-grade AWS Bedrock models for increased accuracy, speed, and production deployment portability.*

- [ ] **9a — AWS Configuration**: Set up IAM roles, permissions, and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` safely in the `.env` file.
- [ ] **9b — Bedrock Adapter**: Rewrite the `/api/ingest` endpoint to utilize the `@aws-sdk/client-bedrock-runtime`. Determine the best multimodal model (e.g. Claude 3 Haiku/Sonnet or Titan Vision).
- [ ] **9c — Hybrid Toggle**: Implement a configuration toggle in the admin dashboard (or `.env`) allowing the user to seamlessly switch between "Local Mode" (Ollama) and "Cloud Mode" (Bedrock) depending on where the gallery is currently hosted.

## 🖼️ Phase 10: Masonry Grid Layout Alignment
> *Goal: Unify the aspect ratio and grid alignment for all photo cards across all albums to ensure a perfectly consistent and aesthetically pleasing grid layout.*

- [ ] **10a — Consistent Card Dimensions**: Implement logic or CSS to ensure all photo cards in the masonry grid maintain a consistent visual alignment, regardless of the intrinsic aspect ratio of the thumbnail image.
- [ ] **10b — Visual Verification**: Review all albums on desktop and mobile to ensure the grid alignment feels uniform and deliberate.

## 🧠 Phase 11: Improved AI Capabilities for Auto-Upload
> *Goal: Upgrade the auto-ingestion AI logic to produce even richer, more accurate metadata and support custom user-defined triggers or improved detection.*

- [ ] **11a — Advanced Metadata Generation**: Refine the prompt schema in `AGENTS.md` and `/api/ingest/route.ts` to improve title and description quality (e.g., extracting specific astronomical objects, measuring aesthetic quality).
- [ ] **11b — Automated Tagging**: Introduce a robust tagging system powered by the updated AI model to automatically tag objects (e.g., "emission nebula", "globular cluster").
