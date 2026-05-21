# 🌙 Lunar Gallery: Automated Agent Instructions (AGENTS.md)

This file contains the core guardrails and order of operations for all AI agents (like Antigravity or Gemini) interacting with the Lunar Gallery repository.

## 🚀 Order of Operations (On Session Start)
When a new chat session starts, you MUST execute the following sequence before writing any code or making proposals:
1. **Initialize Core Context**: Read the following files to align with the current architecture, history, and roadmap:
   - `README.md` (Project setup and variables)
   - `IMPLEMENTATION_PLAN.md` (Active phase milestones)
   - `CHANGELOG.md` (Changelog history)
2. **Acknowledge and Report**: Proactively notify the user that the boot sequence is complete. Briefly list the upcoming implementation tasks, and prompt the user to assign the first task.
3. **Select and Load Specialized Agent**: Once the user assigns a task, inspect the `.agents/` directory and read the appropriate specialized profile to lock in that specific persona:
   - For UI/UX, page layouts, glassmorphism, or styling: Load `.agents/ux_designer.md`
   - For SQLite, Prisma, migrations, or queries: Load `.agents/db_architect.md`
   - For image resizing, EXIF, Ollama, or AWS Bedrock: Load `.agents/pipeline_engineer.md`
   - For compilation checks, changelogs, or Git commits: Load `.agents/compliance_officer.md`

## 🛡️ Core System Guardrails (The Constitution)
You must strictly adhere to these core codebase constraints at all times:
1. **Framework**: STRICTLY Next.js 14 App Router + React Server Actions ONLY (no `/pages/api` routes unless specifically requested).
2. **Database**: SQLite via Prisma. DO NOT use Postgres-specific features (such as case-insensitive `mode: 'insensitive'` searches).
3. **Styling**: Glassmorphism UI, strictly dark mode, Tailwind CSS only. Maintain Nebula/Cosmic aesthetic across all components.
4. **Ingestion Pipeline**: Use `sharp` for precise aspect-ratio mathematically correct downscaling. NEVER crop images to 1:1 squares without user consent.
5. **AI Brain (Hybrid Engine)**: Ingestion uses `exifr` to extract telescope telemetry, feeding it to Ollama LLaVA/Llama 3.2 Vision (local) or AWS Bedrock Claude 3 Haiku (cloud) to classify photos exactly into: `'Solar System'`, `'Moon'`, `'Sun'`, `'Galaxies'`, `'Nebula'`, `'Superclusters'`, `'Constellations'`, or `'Comets'`.

## 👮 Release & Safety Constraints
- **The Out-Loud Consent Loop**: Always explicitly prompt the user for permission out-loud before executing `git commit` operations or committing massive refactors. Provide a concise summary of changes about to be saved.
- **Build Checks**: Run `npm run build` to verify compilation before declaring any task complete.
- **No Legacy Features**: Do not output legacy Next.js methods (`getServerSideProps`, `getStaticProps`).

## 🔒 Agent Self-Protection Rules
These rules protect the integrity of the agent system itself:
1. **Do NOT modify `AGENTS.md`** without explicit, out-loud user consent. This file is the constitutional root of the agent workflow.
2. **Do NOT delete or rename files in `.agents/`** without explicit user consent. These are specialized persona profiles essential to the workflow.
3. **Do NOT add new dependencies** to `package.json` without explaining why they are necessary and confirming with the user first.
4. **Do NOT modify `.gitignore`** without explicitly explaining what will be tracked or untracked and getting user approval.
5. **Scope Discipline & Persona Announcement**: Always explicitly announce out-loud which specialized agent profile (`ux_designer`, `db_architect`, etc.) you are adopting before starting a new task. Stay within the boundaries of the loaded profile. If a task spans multiple domains, announce the persona swap to the user and load each relevant profile before proceeding.

## 💬 Quick Start Prompt
To begin a new session, simply say:
> **"Let's work on Lunar Gallery."**
