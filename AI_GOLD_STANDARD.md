# Lunar Gallery: The 'Gold Standard' AI Agent Architecture

This document proves the implementation and reasoning behind the **"Native Agent Workflow Ecosystem"** used in Lunar Gallery to preserve the Context Window, minimize AI token/compute costs, reduce API latency, and prevent project hallucination over time.

## 🎯 The Problem with Massive Markdown Files
Previously, Lunar Gallery maintained hundreds of lines of documentation natively inside `AI_WORKFLOW.md` and `IMPLEMENTATION_PLAN.md`. 

While this was excellent raw documentation, forcing an AI (like Antigravity or Gemini) to *re-read all three documents* on every single new chat session resulted in:
1. **Context Bloat:** Wasting tens of thousands of tokens over the course of a day just keeping the AI "reminded" of the project.
2. **Hallucination:** Passing 8 completed milestone phases in the active plan confuses the AI's "Attention Mechanism," making it mistakenly prioritize yesterday's fixed bugs over today's active tickets.
3. **Execution Sluggishness:** The more text inside the active memory bank, the slower the inference engine types.

## 🛠️ The 3-Pillar Solution (Implemented Today)

### Pillar 1: The Zero-Friction Blueprint (`AGENTS.md`)
The core architectural laws have been compressed from highly wordy explanations into a 150-word manifest stored in **`AGENTS.md`**.
* **Why it matters:** Advanced IDEs like Antigravity naturally ingest `AGENTS.md` securely into the **System Prompt** upon initialization. The AI automatically knows Lunar Gallery uses strictly Next.js 14 Server Actions, SQLite, and pristine `sharp` aspect-ratio masonry—saving you from ever having to manually paste the configuration rules again.

### Pillar 2: Triggered Mini-Agents (`.agents/`)
The sprawling operational manuals inside `AI_WORKFLOW.md` have been broken down and moved into **`.agents/`** as specialized agent profiles.
* **Why it matters:** Instead of loading 5 pages of "How to deploy to AWS Bedrock" into the AI's active brain when you only want to change a CSS button, these files act as dormant, self-contained personas. The AI automatically fetches the appropriate file (e.g., `.agents/pipeline_engineer.md`) when it physically needs to perform that exact deployment. Huge memory savings, but zero capability loss.

### Pillar 3: A Hyper-Lean Active Plan (`IMPLEMENTATION_PLAN.md`)
The completed milestones (Phases 1 through 8) were ripped entirely out of `IMPLEMENTATION_PLAN.md` and securely deposited natively inside `CHANGELOG.md`.
* **Why it matters:** `IMPLEMENTATION_PLAN.md` is now exclusively designed to track the bare-minimum *horizon*. It tells the AI exactly what ticket to execute next (e.g., Phase 9 AWS Configuration) and nothing more. This creates unparalleled instruction coherence.

## 🚀 Best Practices Summary for the Future
1. **Never dump raw API documentation** into the root directory unless you stick it inside `.agents/workflows/` so it only summons on-demand.
2. **If you finish a massive Phase**, immediately extract it to the `CHANGELOG.md` to keep the AI "light on its feet".
3. **Let the Dashboard govern your health.** If the AI feels confused, start a **New Chat**. Because of the new `AGENTS.md` ecosystem, starting fresh wiping your slate clean gives you 100% peak accuracy without the AI "forgetting" the project!

## 🧠 Advanced Methodology: Lessons from BMAD
While we don't use heavy third-party framework wrappers (like the BMAD Method npm package), our native Antigravity ecosystem deeply aligns with BMAD's core philosophy. For maximum effectiveness in future sessions, adhere to these three principles:

1. **Persona Switching (Party Mode):** Don't just ask the AI to "code this." Explicitly assign it a professional hat. Start sessions with *"Act as an expert Mobile UX Designer"* or *"Act as a strict AWS DevOps Engineer."* This shifts the LLM's probability weighting and produces distinctly better, role-specific code.
2. **Standardized Trigger Workflows:** When a multi-step routine is executed frequently (e.g., pulling files from the Seestar S50, re-running backfills, or a deploy script), codify those exact steps into a dormant markdown file (e.g., `.agents/workflows/seestar-sync.md`). The AI can then execute the entire chain robotically upon a single command.
3. **Architecture First, Code Second:** Never let the AI "wing it" on complex structural designs. If a major UI overhaul or database schema change is required, first collaborate to write a strict ruleset (e.g., `UI.md` or a Database ERD markdown), finalize it, and *only then* execute the code implementation phase against that strict documentation.
