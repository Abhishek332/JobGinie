# JobGinie – Implementation Plan  
## AI Job Application Copilot (Full-Stack, Portfolio-Ready)

This document is the **single source of truth** for building JobGinie. When you say **"implement Step N"**, follow this plan exactly. After each step: implement → review → feedback → fix → commit → next step.

**Checklist:** See the table at the end. Tick `[x]` as you complete each step.

---

## Product vision

**One-line pitch:** JobGinie helps you win **one specific job application** — match analysis, grounded bullet fixes, tailored resume, and application tracking.

**Not building:** Generic AI resume writer, auto-apply bots, full job board, commodity cover-letter generator, or mock interviews in v1.

**Building:** A full-stack **application copilot** — paste a job → upload resume → get match score + actionable fixes → edit tailored resume → download PDF → track the application.

### Why this creates real user value (market-backed)

| User pain (2026) | JobGinie response |
|------------------|-------------------|
| Spray-and-pray applications with no tracking | Application tracker per job |
| Resume keywords don't match JD → invisible in ATS search | Fit/gap analysis + bullet rewrites using JD language |
| Generic AI resumes get rejected (62% reject unpersonalized AI) | Anti-hallucination: only rewrite facts from user's resume |
| Multi-column PDFs break parsing (~34% format failures) | ATS format check on upload |
| India: Naukri headline/skills matter as much as resume | Phase 2: Naukri/LinkedIn export snippets |
| Users pay for diagnosis + fix, not score alone | Treatment loop: analyze → suggest → generate → edit → download |

### Why this is strong on your resume (portfolio framing)

When you ship Phase 1, you can honestly claim:

- **Full-stack SaaS:** Next.js 15 App Router, React 19, TypeScript, shadcn/ui
- **Auth & multi-tenant data:** Clerk + Prisma + PostgreSQL (Neon)
- **AI engineering:** LangChain abstraction, structured JSON outputs, Zod validation, provider switch via env
- **Document pipeline:** Server-side PDF parse (`pdf-parse`) + PDF generation (`@react-pdf/renderer`)
- **Server architecture:** Server Actions, layered `lib/` services, typed contracts
- **Background jobs:** Inngest cron (industry insights refresh — optional Phase 2 contextual use)
- **Real user flow:** Sign up → profile → job application kit → AI analysis → editable output → export

**Demo story for interviews:** *"I built an AI copilot that compares a resume to a job description, suggests grounded bullet rewrites, generates a tailored ATS-friendly resume, and tracks applications — with hallucination guardrails and a provider-agnostic LLM layer."*

---

## Current status (May 2026)

**Done (Foundation, Steps 0–5):** Env/LLM layer, nav cleanup, job details form, PDF upload + parse, fit/gap analysis backend.

**Working path today:** Sign up → onboarding → **Resume for this job** → job details → upload PDF → analysis page **stub** (parsed text saved; analysis UI not wired).

**Next (Step 6):** Wire analysis UI and complete the core application kit loop (Steps 6–14).

**Existing but demoted:** Industry Trends dashboard — keep code, but Phase 1 home should become **Applications** / **New application**, not Industry Trends. Insights become contextual inside the job flow in Phase 2.

**Legacy schema (no app code):** `Resume`, `ResumeAnalysis`, `CoverLetter`, `MockInterview`, `Assessment` — remove in Phase 3 cleanup.

---

## Phased roadmap

| Phase | Goal | Steps | Outcome |
|-------|------|-------|---------|
| **Foundation** | Platform + data model | 0–5 | Done |
| **Phase 1 — MVP** | End-to-end application kit | 6–14 | Demo-ready product; portfolio centerpiece |
| **Phase 2 — Differentiation** | India + retention | 15–19 | Naukri export, interview prep, career profile |
| **Phase 3 — Extend** | Optional growth | 20+ | Mock interview, analytics, cleanup |

---

## Goals & constraints

- **Cost:** ₹0 for demo — Gemini free tier; no paid APIs required for Phase 1.
- **LLM:** All AI via `lib/llm` (LangChain). Switch provider = env + credentials only.
- **Trust:** Never invent experience. Every generated bullet must trace to parsed resume text.
- **Architecture:** Layered, maintainable, scalable — senior full-stack quality throughout.
- **Scope discipline:** Finish Phase 1 before Phase 2. No mock interview / auto-apply / job board in Phase 1.

---

## Architecture rules

### Do

1. **LLM abstraction** — All AI through `generateStructured<T>()` in `lib/llm`. No direct provider SDKs in feature code.
2. **Single resume schema** — One `StructuredResume` JSON for preview, edit, and PDF. No duplicate models.
3. **Server actions** — Mutations (upload, analyze, generate, save, track) on server; thin client.
4. **Application session model** — `ResumeSession` = one job application attempt: job context + parsed resume + analysis + generated resume + status.
5. **Structured AI + Zod** — LLM returns JSON; validate with Zod before persisting or showing.
6. **Anti-hallucination** — Post-LLM validator: flag or reject bullets that introduce employers, dates, metrics, or skills not present in `parsedResumeText`.
7. **Env-based config** — Keys, provider, flags in `.env.example`. No secrets in code.
8. **Layered structure** — `app/` routes, `actions/` orchestration, `lib/` business logic, `components/` UI only.
9. **Shared types** — `types/resume-flow.ts`, `types/application.ts` for cross-layer contracts.

### Don't

1. No direct Gemini/OpenAI/LangChain model imports in pages or components.
2. No provider-specific branching inside prompts.
3. No client-side PDF parsing.
4. No silent failures — loading + error states on every step.
5. No generic AI resume from scratch — **tailor existing content only**.
6. No LangChain "memory" for caching — use application-level cache keyed on `hash(job + resume)` if needed later.
7. No building features not in the current phase without explicit approval.

---

## Re-analysis & caching

- Re-analyze when **job** or **resume** content changes.
- Cache analysis only when inputs are **identical** (same JD + same parsed text).
- Re-upload clears stale `analysisResult` and `generatedResumeJson` (already implemented in `uploadResumePdf`).

---

## Foundation (Steps 0–5) — DONE

These steps are complete. Do not re-implement unless fixing bugs.

| Step | Summary | Key files |
|------|---------|-----------|
| **0** Prep | Checklist, env docs, `.env.example` | `.env.example` |
| **1** LLM layer | LangChain abstraction, verify endpoint | `lib/llm/`, `app/api/verify-llm/route.ts` |
| **2** Nav | Hide incomplete features; resume entry | `components/header.tsx` |
| **3** Job details | Form + `ResumeSession` create | `resume-for-job/page.tsx`, `actions/resume-session.ts` |
| **4** Upload + parse | PDF upload, server parse, store text | `upload/page.tsx`, `lib/pdf/parseResumePdf.ts` |
| **5** Analysis backend | Fit/gap LLM + `runResumeAnalysis` | `lib/resume/runAnalysis.ts`, `types/resume-flow.ts` |

---

## Phase 1 — MVP: Application Kit (Steps 6–14)

**North-star metric:** User completes one real application kit — analysis → tailored resume → PDF download → saved in tracker.

---

### Step 6: Analysis result UI

**Goal:** Wire `runResumeAnalysis`, show fit score, gaps, recommendations, and CTA to build resume.

**Status:** **Next step.**

**Tasks:**

- [ ] **6.1** Replace placeholder in `analysis/page.tsx`: auto-run `runResumeAnalysis(sessionId)` on load if no cached `analysisResult`; show loading ("Analyzing your resume…").
- [ ] **6.2** Display: fit score (0–100 visual), missing keywords, skill gaps, experience gaps, summary, top recommendations.
- [ ] **6.3** Static **"How ATS & AI screening work"** block (2–3 bullets). No API.
- [ ] **6.4** CTA: **"Build tailored resume"** → navigates to generation step (Step 10).
- [ ] **6.5** Extend `getResumeSessionForUser` to return `analysisResult`, `jobDescription`, `yearsRequired`.

**Files:**

- `app/(main)/resume-for-job/analysis/page.tsx`
- `app/(main)/resume-for-job/_components/analysis-view.tsx` (new)
- `app/(main)/resume-for-job/_components/fit-score.tsx`, `gap-list.tsx` (optional)
- `actions/resume-session.ts`

**Commit:** `feat: analysis result UI and build-resume CTA`

---

### Step 7: ATS format check

**Goal:** Catch parse-breaking resume formats before analysis; educate user on fixes.

**Tasks:**

- [ ] **7.1** Extend `lib/pdf/parseResumePdf.ts` (or new `lib/pdf/checkResumeFormat.ts`) to detect warnings: very low text length (image scan), suspiciously short extract, optional heuristics for multi-column hints if detectable.
- [ ] **7.2** Store format warnings on session (e.g. `formatWarnings Json?` on `ResumeSession`) or return inline from upload action.
- [ ] **7.3** Show warnings on upload success and analysis page: "Your PDF may not parse well in ATS — use single-column, text-based PDF."
- [ ] **7.4** Link to static tips in `data/ats-tips.ts`.

**Files:**

- `lib/pdf/checkResumeFormat.ts`
- `prisma/schema/resume_session.prisma` — optional `formatWarnings`
- `resume-upload-form.tsx`, analysis UI

**Commit:** `feat: ATS format warnings on resume upload`

---

### Step 8: Bullet-level rewrite suggestions

**Goal:** Highest-value differentiator — suggest specific bullet rewrites using JD keywords, grounded in user's existing experience.

**Tasks:**

- [ ] **8.1** Extend `AnalysisResult` in `types/resume-flow.ts`:

  ```ts
  bulletRewrites: {
    originalBullet: string;
    suggestedBullet: string;
    reason: string; // e.g. "Adds JD keyword 'Kubernetes'"
  }[];
  ```

- [ ] **8.2** Update `lib/resume/runAnalysis.ts` prompt: return 3–6 bullet rewrites; **only rephrase existing bullets**, never invent new roles or metrics.
- [ ] **8.3** Display rewrites on analysis page: side-by-side original vs suggested; "Copy" button per suggestion.
- [ ] **8.4** Persist in `analysisResult` JSON (no schema migration if using Json column).

**Commit:** `feat: bullet-level rewrite suggestions in analysis`

---

### Step 9: Anti-hallucination validator

**Goal:** Trust moat — reject or flag LLM output that introduces facts not in the resume.

**Tasks:**

- [ ] **9.1** Create `lib/resume/validateGroundedContent.ts`:
  - Input: `parsedResumeText`, `StructuredResume` or `bulletRewrites`
  - Check: new employers, dates, numbers, or skills not found in source text (fuzzy match / keyword extraction)
  - Output: `{ valid: boolean, violations: string[] }`
- [ ] **9.2** Run validator after analysis and after resume generation; log violations server-side.
- [ ] **9.3** If violations found: retry once with stricter prompt, or strip offending bullets and show user warning.
- [ ] **9.4** UI badge: **"Grounded in your resume"** when validation passes.

**Files:**

- `lib/resume/validateGroundedContent.ts`
- Wire into `runAnalysis` and `generateResume` (Step 10)

**Commit:** `feat: anti-hallucination validator for AI resume output`

---

### Step 10: Tailored resume generation (backend)

**Goal:** Generate `StructuredResume` JSON from job + resume + analysis; persist in session.

**Tasks:**

- [ ] **10.1** Define `StructuredResume` in `types/resume-flow.ts`:

  ```ts
  {
    summary: string;
    experience: { title, organization, startDate, endDate, bullets: string[] }[];
    education: { degree, institution, year }[];
    skills: string[];
  }
  ```

- [ ] **10.2** Create `lib/resume/generateResume.ts` — prompt: ATS-friendly, incorporate missing keywords naturally, **reuse only facts from parsed resume and bullet rewrites**.
- [ ] **10.3** Server action `generateResumeForSession(sessionId)` — load session, generate, run validator (Step 9), save `generatedResumeJson`.
- [ ] **10.4** Route: `resume-for-job/build` — triggers generation with loading UI, redirects to preview.

**Commit:** `feat: tailored resume generation with structured schema`

---

### Step 11: Preview + edit

**Goal:** Show generated resume; user can edit and save.

**Tasks:**

- [ ] **11.1** `ResumePreview` component — renders `StructuredResume` with clean ATS-style typography.
- [ ] **11.2** Preview page `resume-for-job/preview` — load session; redirect if no `generatedResumeJson`.
- [ ] **11.3** Inline edit: summary, bullets, skills. Local state → **Save** calls `updateResumeContent(sessionId, json)`.
- [ ] **11.4** Re-run grounded validator on save (warn if user adds unverifiable content — optional soft warning).

**Files:**

- `components/resume/ResumePreview.tsx`
- `app/(main)/resume-for-job/preview/page.tsx`
- `actions/resume-session.ts` — `updateResumeContent`

**Commit:** `feat: resume preview and inline edit`

---

### Step 12: PDF download

**Goal:** Download PDF matching preview, from same `StructuredResume` JSON.

**Tasks:**

- [ ] **12.1** `lib/pdf/buildResumePdf.ts` or `components/resume/ResumePdfDocument.tsx` using `@react-pdf/renderer`.
- [ ] **12.2** API route or server action: load session → build PDF buffer → return download.
- [ ] **12.3** Wire **Download PDF** on preview page. Generate on demand; don't store PDFs long-term.
- [ ] **12.4** Single-column layout; standard fonts; basic Latin support.

**Commit:** `feat: PDF download from structured resume`

---

### Step 13: Application tracker

**Goal:** Retention + organization — every completed session appears in a tracker (Teal's core paid value, simplified).

**Tasks:**

- [ ] **13.1** Extend `ResumeSession` (or rename conceptually to **Application**):

  ```prisma
  companyName     String?   // optional, from job title or user input
  status          ApplicationStatus @default(DRAFT)
  // enum: DRAFT | ANALYZED | READY | APPLIED | INTERVIEW | REJECTED | OFFER
  appliedAt       DateTime?
  matchScore      Int?      // copy from analysisResult.fitScore when analyzed
  ```

- [ ] **13.2** Route: `app/(main)/applications/page.tsx` — list user's sessions as cards: job title, match %, status, date, link to analysis/preview.
- [ ] **13.3** On PDF download or explicit **"Mark as applied"**, set status `APPLIED` and `appliedAt`.
- [ ] **13.4** Update nav: **Applications** as primary signed-in home. Demote Industry Trends to secondary or remove from nav for Phase 1.
- [ ] **13.5** Redirect onboarding → `/applications` (or `/resume-for-job`) instead of `/industry-trends`.

**Files:**

- `prisma/schema/resume_session.prisma`
- `app/(main)/applications/page.tsx`
- `actions/resume-session.ts` — `listApplications`, `updateApplicationStatus`
- `components/header.tsx`

**Commit:** `feat: application tracker with status pipeline`

---

### Step 14: Phase 1 polish + README (portfolio-ready)

**Goal:** End-to-end demo works; README sells the project for recruiters and GitHub visitors.

**Tasks:**

- [ ] **14.1** Smoke test full flow: sign up → profile → new application → upload → analysis → rewrites → build → edit → download → tracker.
- [ ] **14.2** README sections:
  - Problem & solution (2 paragraphs)
  - **Live demo** link (deploy to Vercel)
  - Architecture diagram (optional mermaid)
  - Tech stack table
  - How to run locally (env vars)
  - Key design decisions (LLM abstraction, anti-hallucination, structured output)
  - Screenshots / GIF of main flow
- [ ] **14.3** Update landing page copy (`data/features.tsx`, `howItWorks.tsx`) to match actual product — remove mock interview / job search claims until Phase 3.
- [ ] **14.4** Error boundaries + consistent loading copy across all steps.
- [ ] **14.5** Optional: `ARCHITECTURE.md` one-pager for portfolio depth.

**Commit:** `chore: Phase 1 polish, README, and portfolio docs`

---

## Phase 2 — Differentiation (Steps 15–19)

Build after Phase 1 is demo-ready.

---

### Step 15: Career profile (persistent memory)

**Goal:** Merge onboarding data + parsed resumes into a reusable career profile that improves tailoring.

**Tasks:**

- [ ] **15.1** Extend `User` or new `CareerProfile` model: industry, skills, YOE, bio (from onboarding), plus optional `masterResumeText`.
- [ ] **15.2** Pre-fill job application flow from profile; use profile context in LLM prompts.
- [ ] **15.3** Reframe onboarding as **"Build your career profile"** — one-time setup.

**Commit:** `feat: career profile as LLM context`

---

### Step 16: Naukri + LinkedIn export snippets

**Goal:** India-specific value — export headline, key skills, summary tuned to the job.

**Tasks:**

- [ ] **16.1** After analysis, generate: Naukri headline (≤250 chars), key skills list, profile summary.
- [ ] **16.2** LinkedIn headline + About snippet variant.
- [ ] **16.3** UI: copy buttons per field; static tips for Naukri vs LinkedIn (`data/channel-tips.ts`).

**Commit:** `feat: Naukri and LinkedIn profile snippets per application`

---

### Step 17: "Why I fit" paragraph

**Goal:** Application kit includes a short paragraph for email, Naukri cover note, or recruiter DM — not a full cover letter product.

**Tasks:**

- [ ] **17.1** Generate 3–4 sentence paragraph from analysis + resume; store on session (`applicationBlurb String?`).
- [ ] **17.2** Show on analysis/preview page with copy button.

**Commit:** `feat: why-I-fit application paragraph`

---

### Step 18: Job-specific interview prep

**Goal:** Questions derived from JD gaps + user's resume — high value, late-funnel.

**Tasks:**

- [ ] **18.1** `lib/resume/generateInterviewPrep.ts` — 5–8 likely questions + talking points grounded in user's experience.
- [ ] **18.2** Route: `resume-for-job/interview-prep?sessionId=` — available when status ≥ `APPLIED` or always after analysis.
- [ ] **18.3** Display Q&A cards; optional "practice mode" (user types answer, AI feedback — stretch).

**Commit:** `feat: job-specific interview prep`

---

### Step 19: Contextual industry insights

**Goal:** Repurpose Industry Trends as **in-flow context**, not standalone dashboard.

**Tasks:**

- [ ] **19.1** On analysis page: show salary band + in-demand skills for user's industry **relevant to this job title**.
- [ ] **19.2** Reuse `IndustryInsight` data + existing Inngest cron; remove or hide standalone `/industry-trends` from primary nav.
- [ ] **19.3** Disable standalone industry-trends code path if not needed, or keep as secondary "Insights" tab.

**Commit:** `feat: contextual industry insights in application flow`

---

## Phase 3 — Extend & cleanup (Steps 20+)

| Step | Feature | Notes |
|------|---------|-------|
| **20** | Mock interview | Only after Step 18; generic mock is low value |
| **21** | Application analytics | Callback rate by match score, resume version |
| **22** | Schema cleanup | Remove unused `Resume`, `CoverLetter`, `MockInterview`, `Assessment` models |
| **23** | Optional caching | Hash-based analysis cache for identical job+resume |
| **24** | Agentic / MCP | Chat-with-resume, only if core loop is solid |

**Explicitly not planned for v1:** Auto-apply bots, job board aggregation, paid API dependencies.

---

## Implementation checklist

| Step | Description | Phase | Done |
|------|-------------|-------|------|
| 0 | Prep (checklist, env) | Foundation | [x] |
| 1 | LLM abstraction (LangChain) | Foundation | [x] |
| 2 | Nav cleanup | Foundation | [x] |
| 3 | Job details form + session | Foundation | [x] |
| 4 | Resume upload + PDF parse | Foundation | [x] |
| 5 | Fit + gap analysis (backend) | Foundation | [x] |
| 6 | Analysis result UI | Phase 1 | [ ] ← **next** |
| 7 | ATS format check | Phase 1 | [ ] |
| 8 | Bullet-level rewrite suggestions | Phase 1 | [ ] |
| 9 | Anti-hallucination validator | Phase 1 | [ ] |
| 10 | Tailored resume generation | Phase 1 | [ ] |
| 11 | Preview + edit | Phase 1 | [ ] |
| 12 | PDF download | Phase 1 | [ ] |
| 13 | Application tracker | Phase 1 | [ ] |
| 14 | Polish + README (portfolio) | Phase 1 | [ ] |
| 15 | Career profile | Phase 2 | [ ] |
| 16 | Naukri / LinkedIn snippets | Phase 2 | [ ] |
| 17 | "Why I fit" paragraph | Phase 2 | [ ] |
| 18 | Job-specific interview prep | Phase 2 | [ ] |
| 19 | Contextual industry insights | Phase 2 | [ ] |
| 20+ | Extend & cleanup | Phase 3 | [ ] |

---

## User journey (Phase 1 target)

```
Sign up (Clerk)
  → Career profile (industry, skills, YOE) — 2 min
  → Applications dashboard (empty)
  → "New application" → paste job title + JD
  → Upload resume PDF (+ format warnings if any)
  → Analysis: match score, gaps, bullet rewrites, ATS tips
  → "Build tailored resume" → preview → edit → download PDF
  → Mark applied → appears in tracker with match %
```

---

## Prompt for implementing a single step

```
Implement Step N: [step title] from implementation-plan.md.

- Follow the "Tasks" and "Files" for Step N exactly.
- Respect all Architecture rules (especially anti-hallucination for AI steps).
- Use existing codebase patterns (Prisma, server actions, shadcn, lib/ layer).
- After implementation, deliverable and commit message from the plan should be satisfied.
- Do not implement steps from a later phase unless explicitly asked.
```

---

## Tech stack reference (for README / resume)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| UI | shadcn/ui, Tailwind CSS, Recharts (insights) |
| Auth | Clerk |
| Database | PostgreSQL (Neon) + Prisma 7 |
| AI | LangChain → Gemini (env-switchable) |
| PDF | pdf-parse (input), @react-pdf/renderer (output) |
| Jobs | Inngest (optional cron) |
| Deploy | Vercel |

**Phases reminder:** Foundation (0–5) done → **Phase 1 (6–14)** = shippable portfolio project → Phase 2 = differentiation → Phase 3 = extend.
