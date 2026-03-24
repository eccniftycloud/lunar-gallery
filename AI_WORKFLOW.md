# 🤖 How to Code on Lunar Gallery with Antigravity (or any AI)

Welcome! If you're picking up where we left off, you'll be using an AI agent (like Antigravity) to help you build out Lunar Gallery. 

To ensure the AI doesn't hallucinate incompatible code, break the design system, or lose track of what it's supposed to do, **you must start every new chat session by showing the AI these 4 core documents.**

---

## 📋 The "Big 4" Context Documents

Every time you open a new chat window with your AI coding assistant, your very first prompt should be:

> *"Please read `README.md`, `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`, and `AI_ARCHITECTURE.md` before we start working."*

Here is why each of these files matters to the AI:

### 1. `README.md` (The Overview)
This gives the AI the high-level elevator pitch. It tells the AI what the project is (an astronomy gallery), how it runs (Docker/Portainer), and the environmental variables it expects.

### 2. `IMPLEMENTATION_PLAN.md` (The Compass)
This keeps the AI focused. If you just tell an AI "add a feature," it might reinvent the wheel. The Implementation Plan outlines exactly what features belong in Phase 5 vs Phase 6, ensuring the AI only builds what it's supposed to build, in the right order.

### 3. `CHANGELOG.md` (The Timeline)
If the AI doesn't know the history of the codebase, it might accidentally overwrite a bug fix from yesterday. The changelog tells the AI what the current state of the main branch is vs what is currently unreleased.

### 4. `AI_ARCHITECTURE.md` (The Rules) 🚨 CRITICAL
This is the most important file in the repo. It dictates the strict rules the AI is forbidden the break. It includes:
* **The Tech Stack Rules:** (e.g., "Always use Next.js App Router and Server Actions, never old API Routes").
* **The Database Rules:** (e.g., "SQLite cannot handle `mode: insensitive`, so always use raw SQL for searches").
* **The Design System:** (e.g., "Use glassmorphism panels, strict dark mode, and nebula-colors. Do not use generic Tailwind buttons").

---

## ✅ Example "First Message" Prompt

Copy and paste this exact prompt to Antigravity when starting a new session on your NUC or Ryder machine:

```text
Hey! We are working on Lunar Gallery. Before you write any code or make any suggestions, please read the following 4 files in the root directory to understand the project architecture, the design system rules, and the current roadmap:
1. README.md
2. AI_ARCHITECTURE.md
3. IMPLEMENTATION_PLAN.md
4. CHANGELOG.md

Once you've read them, let me know, and I'll give you today's task!
```

---

## 🗂️ How to Use Supplemental Context (AWS, Databases, API Docs)

As the project grows, you might add complex cloud architecture diagrams, Terraform scripts, or API documentation (likely stored in a `docs/` folder). 

**Do NOT feed these to the AI on every single chat.** This results in "Context Bloat," making the AI slower, more expensive, and surprisingly forgetful. 

Instead, use them **only when assigning a relevant ticket**:

> *"Hey! We are working on Lunar Gallery. Please read the core 4 files (`README.md`, `AI_ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`).*
> 
> *Today we are working on optimizing the image storage. Please ALSO read `docs/aws/S3_STORAGE.md` and help me update the upload function!"*
