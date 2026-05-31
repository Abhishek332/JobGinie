# JobGinie – Implementation Plan  
## Resume Fit + Gap Analysis + Smart Resume Builder (Demo-Ready)

This document is the **single source of truth** for implementing the priority feature. When you say "implement Step N", the implementation will follow this plan. Complete steps in order; after each step: implement → review → feedback → fix → commit → next step.

**Implementation checklist (Steps 0–12):** See the table at the end of this document. Tick `[x]` as you complete each step.

---

## Current scope & phased approach

- **Target:** End-to-end demoable in **1 week**. Only the **resume flow** (USP) is in scope; all other features are **hidden** and their **code paths must not run** (not just UI hidden). We finish the top feature first, then cleanup, then extend.
- **Phase 1 (now):** Plan and finish the **top-most feature** – resume flow (Steps 0–12) – using **LangChain** for LLM. One flow: Job details → Upload → Parse → Fit/Gap analysis → Build resume → Preview → Edit → Download.
- **Phase 2 (after demo):** **Cleanup** – remove or disable old/unnecessary features and code that is not required for the demo. No dead code or running paths for hidden features.
- **Phase 3 (later):** **New features** – agentic flows, MCP, chat-with-resume, etc. Product extends only after Phase 1 and 2 are done.
- **Architecture:** Code must stay **clear, maintainable, and scalable** so the product can grow without tech debt. Follow the rules below like a senior fullstack engineer + architect (single LLM abstraction, layered structure, no feature logic coupled to a specific provider or library).

---

## Goals

- **Scope:** One flow: Job details → Resume PDF upload → Parse → Fit + Gap analysis → "Build my resume?" + ATS/AI explainer → Generated resume → Preview → Edit → Download. Demo-ready. Other features hidden; their flows do not run in code.
- **Cost:** ₹0 – free APIs only (e.g. Gemini free tier). No paid services.
- **Provider switch:** All LLM usage behind **LangChain**. When one provider’s free credits end, switch via **config/env and credentials only**; no code change. LangChain handles provider-specific APIs and structured output. We do not use LangChain "memory" or chat caching for resume analysis (any caching is application-level, per plan below).
- **Code:** Clear architecture, scalability, maintainability. No feature logic coupled to a specific LLM or PDF library.
- **Server:** Actions run on the server (parse, LLM, DB). For demo + free tier this is acceptable. If hosting quota becomes a concern later, consider background jobs (e.g. Inngest) or client-side PDF parse; not required for initial demo.

---

## Architecture Rules

### Do

1. **LLM abstraction (LangChain)**
   - All AI calls go through one module (e.g. `lib/llm` or `services/llm`) backed by **LangChain**. Feature code never imports Gemini/OpenAI/LangChain model classes directly; only the abstraction.
   - One interface: e.g. `generateStructured<T>(prompt, systemPrompt?, schema): Promise<T>`. Provider chosen by env (e.g. `LLM_PROVIDER=gemini`). Switching provider = env and credentials only.

2. **Single source of truth for resume content**
   - One structured JSON schema for the generated resume. Preview component and PDF generator both consume this JSON. No duplicate "display" vs "export" models.

3. **Server actions for mutations**
   - Form submit, upload, analysis, resume generation, save edits → server actions. Keep client thin; validation and DB on server.

4. **Session / run model**
   - One "resume session" (or "run") per flow: job context + parsed resume + analysis result + generated resume. Store in DB; link to user. Enables resume flow, history later.

5. **Structured AI output**
   - Analysis and resume generation both use a fixed JSON schema (Zod or TypeScript type). Parse and validate LLM response; never trust raw string for structure.

6. **Env-based configuration**
   - API keys, provider name, feature flags in env. Document in `.env.example`. No secrets in code.

7. **Layered structure**
   - `app/` – routes, pages, server actions that orchestrate.
   - `lib/` or `services/` – LLM, PDF parse, shared utilities.
   - `components/` – UI only; no direct DB or LLM calls (pass data as props or use server components where appropriate).
   - `actions/` – server actions that call lib/services and DB.

8. **Error handling**
   - Server: throw or return `{ success: false, error: string }`; client shows message. Log on server; never expose stack to client.

9. **Types**
   - Shared types for job context, analysis result, resume schema in a dedicated file (e.g. `types/resume-flow.ts`). Use in actions, components, and LLM layer.

### Don’t

1. **No direct LLM SDK in feature code**
   - Don’t import `@google/genai` or `openai`, or LangChain model classes in pages, components, or resume/analysis actions. Only the app's LLM abstraction (which uses LangChain under the hood).

2. **No provider-specific logic in prompts**
   - Prompts are plain text + schema. No "if Gemini do X, if OpenAI do Y" in the same function. Provider-specific handling only in the abstraction implementation.

3. **No duplicate resume structure**
   - Don’t maintain one shape for "preview" and another for "PDF". One schema, two renderers (React component + PDF).

4. **No long procedural files**
   - Split by responsibility: e.g. `parseResumePdf.ts`, `runAnalysis.ts`, `generateResume.ts`, each calling the LLM abstraction. Avoid one 500-line action file.

5. **No hardcoded secrets or API keys**
   - No keys in repo or in code. Env only.

6. **No silent failures**
   - Every user-facing path: loading state or clear error message. No empty screens or unhandled rejections.

7. **No business logic in UI components**
   - Components receive data and callbacks. Validation, API calls, and DB access in actions or lib. Exception: client-side validation for UX (e.g. required fields) in addition to server validation.

8. **No PDF parsing on client**
   - Parse PDF only on server (e.g. `pdf-parse`). Browser doesn’t need to send parsed content; upload file, server returns result or saves to session.

9. **No LangChain/conversation "memory" for job+resume caching**
   - LangChain’s "memory" is for chat context, not for caching analysis by job+resume. If you add caching, do it at application level (e.g. cache key = hash(jobDescription + jobTitle + resumeText)); return cached result only when **inputs are identical**. Re-analyze whenever job or resume content changes. Do not reuse a cached result for a different resume – that would be incorrect.

---

## Re-analysis and optional caching

- **When to re-analyze:** Every time the **job** (title, description, YOE) or **resume** (uploaded PDF / parsed text) changes, run analysis again. Same company + same position but **different resume** → must re-analyze; there is no shortcut without returning wrong/stale data.
- **When caching helps:** Only when the **exact same** job + same resume is submitted again (e.g. user re-uploads same file for same job, or retries). Then you can return the previous analysis (and optionally generated resume) without calling the LLM again – faster response, no duplicate cost.
- **How to cache (optional, later):** Application-level cache: key = stable hash of `jobTitle + jobDescription + resumeText` (and optionally `userId`); value = analysis result (and optionally generated resume JSON). Use DB or a simple cache layer; **LangChain is not required** for this.
- **Hallucination:** Caching does not increase LLM hallucination. Reusing a cached result only when inputs are identical is safe. Wrong results come from reusing cache when inputs changed – avoid that by re-analyzing whenever job or resume content changes.

---

## Scalability & Maintainability

- **Add a new LLM provider:** Add the provider in LangChain config and env; no change in analysis or resume generation code (LangChain handles provider-specific APIs).
- **Change analysis schema:** Update one type and one prompt; all consumers use the same type.
- **Add a new step in the flow:** Add a new route/step and a new action; existing steps keep their contracts (e.g. session id, job context, analysis, resume JSON).
- **Switch PDF library:** Only `lib/pdf` (or equivalent) changes; upload and "parsed text" contract stay the same.
- **Tests later:** Keep actions and lib functions pure where possible (input → output) so unit tests can be added without touching UI.
- **Server cost / quota:** More server-side work uses more hosting quota (e.g. Vercel function duration). For demo + free tier this is acceptable. If limits are hit later, consider moving heavy steps (e.g. parse + LLM) to a background job (Inngest) so the request returns quickly, or offload PDF parsing to the client.

---

## Step-by-Step Implementation

---

### Step 0: Prep

**Goal:** Checklist and env strategy; no feature code yet.

**Default LLM (documented):**
- **Primary:** Gemini free tier via [Google AI Studio](https://aistudio.google.com/). Get API key there; no cost for demo usage within free limits.
- **Fallback (optional, to be wired later):** Ollama (local). Run models locally with no API cost; add `ollama` as a provider in `lib/llm` when needed.

**Env vars (see `.env.example`):**
- `LLM_PROVIDER` – which provider to use: `gemini` (default), or later `openai`, `ollama`.
- `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` – for Gemini. Either name is supported.
- Later (when adding providers): `OPENAI_API_KEY`, `OLLAMA_BASE_URL` (e.g. `http://localhost:11434`).

**Tasks:**

- [x] **0.1** Add an "Implementation checklist" section (e.g. at the top of this file or in README) listing Steps 1–12; tick as you complete.
- [x] **0.2** Decide default free LLM (e.g. Gemini free tier via Google AI Studio). Document in this plan. Optional: note a fallback (e.g. Ollama) to be wired later.
- [x] **0.3** Document env vars: `LLM_PROVIDER`, `GEMINI_API_KEY` (or `GOOGLE_GENERATIVE_AI_API_KEY`), and any later vars for other providers. Update `.env.example` with these and short comments.

**Deliverable:** Checklist + env documentation; `.env.example` updated.  
**Commit message:** `chore: implementation checklist and env plan`

---

### Step 1: LLM abstraction layer (LangChain)

**Goal:** One provider-agnostic way to call an LLM for structured JSON, using **LangChain**. Feature code only uses this layer; switching provider = env and credentials only.

**Tasks:**

- [x] **1.1** Create `lib/llm/` (or `services/llm/`):
  - **Types:** Define `LLMProvider` (e.g. `'gemini' | 'openai' | 'ollama'`) and `GenerateStructuredOptions<T>` (prompt, systemPrompt?, schema or schema description).
  - **Interface:** `generateStructured<T>(options): Promise<T>`. Contract: given prompt + optional system prompt + schema, returns parsed and typed `T`. Throw or return `Result` on failure.
- [x] **1.2** **Migrate to LangChain** (replace current Gemini-only impl):
  - Use LangChain (e.g. `ChatGoogleGenerativeAI`, `withStructuredOutput`); no direct `@google/genai`. Provider by env.
Gemini’s - [x] **1.3** Ensure **all** LLM usage goes through this layer: refactor `actions/industry-trends.ts`, `lib/inngest/functions.ts` (and any other direct Gemini/OpenAI calls) to use `generateStructured` or the LangChain-backed abstraction. For Phase 1, hidden features can be disabled so their code paths do not run; when re-enabled they must use the abstraction only.
- [x] **1.4** Add a tiny **verification**: script or test that calls `generateStructured` with a trivial prompt and logs the result. Ensures env and provider work; later you can switch provider by changing env only. **Implemented:** GET `/api/verify-llm` – run dev server and open this URL to verify.

**Files to create/update:**

- `lib/llm/types.ts` – provider type, options, result type.
- `lib/llm/index.ts` – public API: `generateStructured`.
- `lib/llm/providers/langchain-gemini.ts` – LangChain-based Gemini implementation.
- `app/api/verify-llm/route.ts` – verification endpoint.
- `.env.example` – already updated in Step 0.

**Don’t:** Put prompts for "analysis" or "resume" in this layer; only generic "prompt + schema → T".  
**Commit message:** `feat: LLM abstraction via LangChain; provider switch by env only`

---

### Step 2: Hide incomplete features in UI

**Goal:** Nav shows only working flows; one clear entry for the new resume flow.

**Tasks:**

- [x] **2.1** In the header/nav component, remove or hide links for:
  - Cover Letter Generator
  - Interview Prep (and any other "coming soon" items).
- [x] **2.2** Keep: Home and **one** entry for the resume feature (e.g. "Resume for this job"). **Hide** Industry Trends and other non-resume features for Phase 1; their routes/code paths must not run until Phase 2 cleanup and Phase 3 extensions.
- [x] **2.3** Set that entry’s href to the route you will use (e.g. `/resume-for-job` or `/resume-builder`). If the page does not exist yet, you can add a minimal placeholder page that says "Resume flow – Step 3 will add the form", or leave the link and add the page in Step 3.

**Files to update:**

- `components/header.tsx` (or wherever nav is defined).
- `app/(main)/resume-for-job/page.tsx` – minimal placeholder (added so link does not 404).

**Commit message:** `chore: hide incomplete features in nav; add entry for resume-for-job flow`

---

### Step 3: Job details form + route

**Goal:** User can enter job title, JD, optional YOE and proceed to the next step; data is persisted for the flow.

**Tasks:**

- [x] **3.1** Create route: `app/(main)/resume-for-job/page.tsx` (or `resume-builder` – stick to one name).
- [x] **3.2** Form fields:
  - Job title (required, text).
  - Job description (required, textarea).
  - Years of experience required (optional, number).
- [x] **3.3** Client-side validation (e.g. Zod schema) and server-side validation in the server action. On submit, call a server action that:
  - Validates input.
  - Creates or updates a "resume session" in DB (e.g. `ResumeSession` or use existing table with job context fields: `jobTitle`, `jobDescription`, `yearsRequired`). Link to current user.
  - Returns `{ success: true, sessionId }` or redirects to next step with session in URL or cookie.
- [x] **3.4** After success, redirect to upload step (e.g. `resume-for-job/upload` or same page with `step=2`). Ensure the next step can read the session (e.g. by `sessionId` in URL or from DB by user).

**Data model (if new table):**

- Example: `ResumeSession` with `id`, `userId`, `jobTitle`, `jobDescription`, `yearsRequired` (nullable), `createdAt`. Later steps add `parsedResumeText`, `analysisResult`, `generatedResumeJson`.

**Files to create/update:**

- `app/(main)/resume-for-job/page.tsx` – form and redirect.
- `actions/resume-session.ts` or similar – create/update session, validate.
- Prisma schema – new model or new fields if reusing existing.
- Shared types for job context (e.g. in `types/resume-flow.ts`).

**Commit message:** `feat: job details form and resume-for-job flow entry`

---

### Step 4: Resume upload + PDF parsing

**Goal:** User uploads a PDF; server parses it and stores text (and optionally simple structure) in the same session. No paid PDF API.

**Tasks:**

- [ ] **4.1** Upload step UI (new page or same flow, step 2):
  - Accept one file: PDF only. Client-side: check `file.type` and size (e.g. max 5 MB). Show clear error if not PDF or too large.
- [ ] **4.2** Upload: use a server action (or API route) that receives `FormData` with the file. Do not store the raw PDF long-term if avoiding cost; parse and store only text (and optional structured sections).
- [ ] **4.3** Server-side parsing: use `pdf-parse` (or equivalent) in a dedicated module (e.g. `lib/pdf/parseResumePdf.ts`). Given a buffer, return `{ text: string }` or `{ text, sections? }`. Handle errors: corrupt PDF, password-protected, non-PDF. Throw or return `{ ok: false, error: string }`.
- [ ] **4.4** After successful parse, associate result with the current session: save `parsedResumeText` (and optional `parsedStructured`) to the DB row for this session. Session identified by `sessionId` from Step 3 (from URL, cookie, or DB by user + latest session).
- [ ] **4.5** Return success (and optionally redirect) to the analysis step, or return `{ success: true }` and let the client navigate to the analysis page.

**Files to create/update:**

- `app/(main)/resume-for-job/upload/page.tsx` or upload section in the same flow.
- `lib/pdf/parseResumePdf.ts` – parse buffer → text (and optional structure).
- Server action that: receives file, calls parser, saves to session in DB.
- Prisma schema – add `parsedResumeText` (and optional `parsedStructured`) to session model.

**Don’t:** Parse PDF on the client; no paid third-party PDF API.  
**Commit message:** `feat: resume PDF upload and server-side parsing`

---

### Step 5: Fit + gap analysis (backend)

**Goal:** One server action that, given session (job + resume text), returns and persists structured fit + gaps using the LLM abstraction.

**Tasks:**

- [ ] **5.1** Define **analysis result type** (e.g. in `types/resume-flow.ts`):  
  `fitScore: number`, `missingKeywords: string[]`, `skillGaps: string[]`, `experienceGaps: string[]`, `summaryParagraph: string`, `topRecommendations: string[]`.
- [ ] **5.2** Create a function (e.g. in `lib/resume/runAnalysis.ts` or `actions/run-analysis.ts`) that:
  - Input: `jobTitle`, `jobDescription`, `yearsRequired?`, `resumeText`.
  - Builds one **analysis prompt** (plain text): e.g. "Compare this resume to this job description and return fit score, missing keywords, skill gaps, experience gaps, a short summary, and top 3–5 recommendations."
  - Calls **only** `generateStructured<AnalysisResult>(...)` from the LLM layer with this prompt and the analysis schema. No direct Gemini/OpenAI import.
  - Returns typed `AnalysisResult`.
- [ ] **5.3** Expose a **server action** (e.g. `runResumeAnalysis(sessionId)`) that: loads session from DB, gets job + parsed text, calls the function above, saves result to session (e.g. `analysisResult` JSON column), returns result to client (or returns success and client fetches analysis).
- [ ] **5.4** Persist analysis in the same session row (e.g. `analysisResult Json` or similar). Client will use this for the analysis UI and for the "build resume" step.

**Files to create/update:**

- `types/resume-flow.ts` – `AnalysisResult` type and schema for LLM.
- `lib/resume/runAnalysis.ts` (or under `actions/`) – pure function that calls LLM abstraction.
- Server action that loads session, runs analysis, saves to DB.
- Prisma – `analysisResult` (or equivalent) on session model.

**Commit message:** `feat: fit and gap analysis via LLM abstraction`

---

### Step 6: Analysis result UI

**Goal:** Show fit score, gaps, recommendations, ATS/AI explainer, and "Build my resume" CTA.

**Tasks:**

- [ ] **6.1** Analysis page/step: after upload (and optional auto-trigger of analysis), call the analysis action or load analysis from session. Show loading state while analysis runs.
- [ ] **6.2** Display:
  - **Fit score** (e.g. 0–100) with a simple visual (circular progress or bar).
  - **What’s missing:** missing keywords, skill gaps, experience gaps (use the schema from Step 5).
  - **Top recommendations** and **summary** paragraph.
- [ ] **6.3** Add a short **"How ATS & AI selection work"** block: 2–3 bullets on ATS (keywords, clear structure) and AI screening (relevance, clarity). Static content; no API. Can be expandable/collapsible.
- [ ] **6.4** CTA button: **"Build my resume for this job"**. On click, navigate to the resume generation step (or trigger generation then navigate to preview). Session already has job + resume + analysis; next step will generate the resume JSON.

**Files to create/update:**

- `app/(main)/resume-for-job/analysis/page.tsx` or analysis section in the flow.
- Optional: reusable components for score display, gap list, recommendations.
- Copy for ATS/AI explainer (can live in the same file or `content/` / `data/`).

**Commit message:** `feat: analysis result UI and build-resume CTA`

---

### Step 7: Resume generation (backend)

**Goal:** Generate structured resume JSON from job + resume text + analysis; persist in session. No PDF yet.

**Tasks:**

- [ ] **7.1** Define **resume schema** (e.g. in `types/resume-flow.ts`): one structure used for preview and PDF. Example: `{ summary: string, experience: { title, organization, startDate, endDate, bullets: string[] }[], education: same shape, skills: string[] }`. Add any sections you need (e.g. certifications).
- [ ] **7.2** Create a function (e.g. `lib/resume/generateResume.ts`) that:
  - Input: `jobTitle`, `jobDescription`, `resumeText`, `analysisResult` (from Step 5).
  - Builds a **resume-generation prompt**: e.g. "Generate an ATS- and AI-screening-friendly resume. Use standard sections (Summary, Experience, Education, Skills). Incorporate missing keywords naturally. Match required experience where possible. Output only structured content (no layout)."
  - Calls **only** `generateStructured<StructuredResume>(...)` with this prompt and the resume schema.
  - Returns typed `StructuredResume`.
- [ ] **7.3** Server action (e.g. `generateResumeForSession(sessionId)`): load session (job, parsed text, analysis), call the function above, save result to session (e.g. `generatedResumeJson`). Return success; client then navigates to preview or fetches the generated resume.
- [ ] **7.4** Ensure the same schema is used in Step 8 (preview) and Step 10 (PDF). No second "export-only" shape.

**Files to create/update:**

- `types/resume-flow.ts` – `StructuredResume` type and schema for LLM.
- `lib/resume/generateResume.ts` – calls LLM abstraction only.
- Server action that loads session, runs generation, saves `generatedResumeJson`.
- Prisma – `generatedResumeJson` (Json) on session model.

**Commit message:** `feat: resume generation via LLM with structured schema`

---

### Step 8: Preview component + page

**Goal:** Show the generated resume in the app using the same structured JSON that will drive the PDF.

**Tasks:**

- [ ] **8.1** Create a **ResumePreview** component that accepts the **StructuredResume** JSON (from Step 7). Render sections (summary, experience, education, skills) with clear typography and layout. Prefer semantic HTML and CSS; avoid complex tables/graphics so it stays ATS-style and matches PDF later.
- [ ] **8.2** Add preview page/step (e.g. `resume-for-job/preview`). Load the session’s `generatedResumeJson` for the current user/session. If missing, redirect back to appropriate step or show "Generate resume first".
- [ ] **8.3** Add a **"Download PDF"** button. For this step it can be disabled or show "Step 10 will enable download"; in Step 10 you will wire it to the PDF generator.

**Files to create/update:**

- `components/resume/ResumePreview.tsx` (or under `app/(main)/resume-for-job/`) – receives `StructuredResume`, renders layout.
- `app/(main)/resume-for-job/preview/page.tsx` – loads session, passes `generatedResumeJson` to `ResumePreview`.

**Commit message:** `feat: resume preview from structured JSON`

---

### Step 9: Edit and persist

**Goal:** User can edit sections/bullets in the preview; changes persist to the session’s `generatedResumeJson`.

**Tasks:**

- [ ] **9.1** On the preview page, make content **editable**: e.g. click to edit summary, experience bullets, education, skills. Use local state for the edited JSON, then on "Save" call a server action that updates the session’s `generatedResumeJson` in DB.
- [ ] **9.2** Keep **one source of truth**: the same `StructuredResume` type. Preview and PDF both read from this; no separate "display" model.
- [ ] **9.3** After save, show a brief "Saved" feedback and re-render preview from the updated data (refetch or use returned JSON).

**Files to create/update:**

- Preview page or a wrapper component: add edit UI (inline or modal) and save action.
- Server action: e.g. `updateResumeContent(sessionId, generatedResumeJson)` that updates the session row.

**Commit message:** `feat: edit resume and persist to session`

---

### Step 10: PDF download

**Goal:** User can download a PDF that matches the preview layout, generated from the same structured JSON.

**Tasks:**

- [ ] **10.1** Use `@react-pdf/renderer` (or another lib) to build a PDF from the **same** `StructuredResume` type. Reuse section/bullet structure so the PDF looks like the preview (same order, same content).
- [ ] **10.2** Implement download flow: on "Download PDF", generate the PDF (server-side recommended: e.g. API route or server action that returns a blob or temporary URL). Client triggers download (e.g. `window.open` or blob download). If you prefer client-side PDF generation, ensure the same JSON is used and the output matches the preview.
- [ ] **10.3** Do not store PDFs long-term unless you add storage later; for demo, "generate on demand and download" is enough. Optional: store in DB or object storage in a later iteration.
- [ ] **10.4** Ensure encoding/fonts support required characters (e.g. basic Latin for English resumes).

**Files to create/update:**

- `lib/pdf/buildResumePdf.ts` (or `components/resume/ResumePdfDocument.tsx` for react-pdf) – accepts `StructuredResume`, returns PDF buffer or blob.
- API route or server action that loads session, gets `generatedResumeJson`, calls PDF builder, returns file or URL.
- Preview page: wire "Download PDF" to this endpoint/action.

**Commit message:** `feat: PDF download from structured resume`

---

### Step 11: Errors and loading

**Goal:** Every step has clear loading and error states; no silent failures.

**Tasks:**

- [ ] **11.1** **Loading:** Job form submit, upload+parse, analysis, resume generation, PDF download – show a spinner or message (e.g. "Analyzing your resume…", "Building your resume…").
- [ ] **11.2** **Errors:** Handle and show messages for: invalid/missing job or resume, parse failure, LLM failure, session not found. Where possible, offer "Try again" or "Start over".
- [ ] **11.3** **Validation:** Job title and JD required; PDF only and file size limit. Show validation errors next to the form or upload area. Server must also validate; never trust client only.
- [ ] **11.4** Optional: global or layout-level error boundary for the resume flow so unhandled errors show a friendly message instead of a blank screen.

**Files to create/update:**

- Relevant pages and components: add loading states and error UI.
- Server actions: return `{ success: false, error: string }` or throw and catch in UI to show message.

**Commit message:** `feat: loading and error handling for resume flow`

---

### Step 12: Demo polish and README

**Goal:** End-to-end flow works; README describes the product and how to run it.

**Tasks:**

- [ ] **12.1** **Smoke test:** Sign up → onboarding → open "Resume for this job" → enter job details → upload PDF → see analysis → "Build my resume" → preview → edit → download. Fix any broken links, missing guards (e.g. redirect to job form if session is missing), or inconsistent state.
- [ ] **12.2** **README:** Short project description (JobGinie), main demo flow ("Resume for this job": job details → upload → analysis → build → preview → edit → download). How to run (install, env vars from Step 0). Note "free APIs only" and "LLM provider configurable via env".
- [ ] **12.3** Optionally in README: mention that some features (e.g. cover letter, interview prep) are hidden and will be added later.

**Files to update:**

- `README.md`
- Any route or redirect that was missing after smoke test.

**Commit message:** `chore: demo polish and README update`

---

## Implementation checklist (track progress)

| Step | Description                    | Done |
|------|--------------------------------|------|
| 0    | Prep (checklist, env)          | [x]  |
| 1    | LLM abstraction (LangChain)    | [x]  |
| 2    | Hide incomplete UI             | [x]  |
| 3    | Job details form + route       | [x]  |
| 4    | Resume upload + PDF parse      | [ ]  |
| 5    | Fit + gap analysis (backend)   | [ ]  |
| 6    | Analysis result UI             | [ ]  |
| 7    | Resume generation (backend)    | [ ]  |
| 8    | Preview component + page       | [ ]  |
| 9    | Edit and persist               | [ ]  |
| 10   | PDF download                   | [ ]  |
| 11   | Errors and loading             | [ ]  |
| 12   | Demo polish + README           | [ ]  |

---

## Prompt for implementing a single step

When you want to implement **Step N**, use this prompt (fill N and the step title):

```
Implement Step N: [step title] from implementation-plan.md.

- Follow the "Tasks" and "Files to create/update" for Step N exactly.
- Respect all "Architecture rules" and "Do / Don't" in the same document.
- Use existing codebase patterns (e.g. Prisma, server actions, existing components).
- After implementation, the deliverable and commit message from the plan should be satisfied.
```

You will implement step by step; after each step you will review, get feedback, address it, commit, then proceed to the next step.

**Phases (reminder):** Phase 1 = Steps 0–12 (resume flow, LangChain). Phase 2 = cleanup of unused/hidden feature code. Phase 3 = new features (agentic, MCP, etc.).
