# Lunar Gallery System Architecture (The Constitution)

CRITICAL SYSTEM RULES FOR ALL FUTURE AI AGENTS:
1. **Framework:** STRICTLY Next.js 14 App Router + React Server Actions ONLY (no `/pages/api` unless specifically asked).
2. **Database:** SQLite via Prisma. DO NOT hallucinate Postgres-specific features (e.g., `mode: 'insensitive'`). Use raw SQL for advanced queries if needed.
3. **Styling:** Glassmorphism UI, strictly dark mode, Tailwind CSS only. Maintain Nebula/Cosmic aesthetic across all components.
4. **Ingestion Pipeline:** Uses `sharp` for precise aspect-ratio mathematically correct downscaling, NEVER hardcode 1:1 squares without user consent.
5. **AI Brain:** `exifr` injects embedded telescope telemetry (Make, Target, Coordinates) natively into Ollama LLaVA vision prompts to classify images exactly into: 'Solar System', 'Moon', 'Sun', 'Galaxies', 'Nebula', 'Superclusters', 'Constellations', or 'Comets'.

**Workflow Constraints:**
- Check `.agents/workflows/` before executing major sweeping refactors.
- Do not output legacy Next.js `getServerSideProps` code under any circumstances.
