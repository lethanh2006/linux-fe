# Linux demo review implementation plan

> **For agentic workers:** Execute inline with executing-plans, then request a fresh final review.

**Goal:** Let the learner study the existing Linux course efficiently and rehearse a 15–20 minute demo.
**Architecture:** Static Next.js server page with three Markdown guides; a small client checklist uses browser-local storage. Existing components provide rendering and command-copying.
**Tech Stack:** Next.js 16.4.6, React, Tailwind 4, react-markdown.
**Spec:** `docs/superpowers/specs/2026-11-27-demo-review-design.md`.

## Global constraints

- Cover Linux TITV videos5–34 with canonical lesson links.
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
- [ ] Commit, push and verify deployment.
