# Linux demo review implementation plan

> **For agentic workers:** Execute inline with executing-plans, then request a fresh final review.

**Goal:** Let the learner study the existing Linux course efficiently and rehearse a 15–20 minute demo.
**Architecture:** Static Next.js server page with three Markdown guides; a small client checklist uses browser-local storage. Existing components provide rendering and command-copying.
**Tech Stack:** Next.js 16.4.6, React, Tailwind 4, react-markdown.
**Spec:** `docs/superpowers/specs/2026-11-27-demo-review-design.md`.

## Global constraints

- Cover stages 1–7 only: Linux TITV videos 5–34, with canonical lesson links.
- Reuse light/dark tokens and existing UI components.
- Demo mutations stay inside a newly created practice directory.
- Do not execute terminal commands from the web page or build process.
- User authorized implementation, commit and direct push.

## Review focus

- Correct command outputs and prerequisites through the complete rehearsal.
- Missing links, broken fences/tables and unbalanced details elements.
- Checklist hydration, invalid storage, reset and refresh persistence.
- Keyboard operation and 320px layout in both themes.
- New content is included in the production bundle.

## Task 1: Content and page

- [x] Write summary, demo and oral-question guides in `content/review/`.
- [x] Create `src/app/on-tap/page.tsx` and a server-only guide loader.
- [x] Add entry points in site-header and homepage.

## Task 2: Rehearsal checklist and validation

- [x] Add a labelled native-checkbox checklist, persistent local state and reset.
- [x] Extend Markdown checks to review guides.
- [x] Execute demo command blocks sequentially in a disposable Ubuntu lab and inspect expected outputs.

## Task 3: Delivery

- [x] Run lint, existing tests, content checks and production build.
- [x] Check navigation, disclosure/copy controls, checklist and mobile layouts in browser.
- [x] Request independent review, fix important findings and prepare Claude handoff.
- [x] Initial feature delivered in 3e0229c; direct push and deployment verified.

## Scope clarification: through stage 7

The user confirmed stages 1–7. The current curriculum ends stage 7 at video 34 (networking), so all 30 main lessons stay in scope. Reorganize the 10 topic groups into seven stage disclosures and make the boundary explicit in page metadata, homepage, rehearsal and checklist. Claude independently confirmed the boundary and identified stale references and optional material to simplify. Rehearsal recovery now compares both four-line files using cat, with tar paths verified in an isolated Ubuntu lab. Recheck scope links, build, browser and deployment for the follow-up.
