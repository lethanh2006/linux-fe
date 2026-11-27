# TITV course integration implementation plan

> **For agentic workers:** Execute inline with the executing-plans workflow; request an independent final review.

**Goal:** Deliver a default-light theme and a Vietnamese course following TITV videos 5–34, with practical examples and quizzes.

**Architecture:** Keep the existing Next.js Markdown lesson renderer. The main course follows one video per lesson in source order; advanced lessons stay in a separate extension part. Theme preference is independent of lesson content.

**Tech Stack:** Next.js 16.4.6, React, Tailwind 4, Markdown, gray-matter.

**Spec:** The user's request in this chat and the 30 main-course entries in `src/content/curriculum.ts`; source playlist https://www.youtube.com/playlist?list=PLyxSzL3F74878husgCe4IF6iJNSCjYTGq.

## Global constraints

- Main lessons correspond exactly to TITV video numbers 5 through 34.
- Write original explanations and exercises; use transcripts as factual outlines.
- Keep the five theme files and default-light behavior delivered in commit 790661f.
- Preserve existing advanced material; redirect replaced lesson URLs.
- Run privileged examples only inside a disposable lab, never against the host.
- User explicitly authorized direct commit and push to master.

## Review focus

- Video IDs, displayed numbers, order, and previous/next links agree.
- Old lesson links resolve after splitting combined lessons.
- Password and group examples use disposable lab accounts.
- Network and boot-changing commands explain their effects and recovery steps.
- Light/dark preference persists and mobile lesson navigation does not overflow.

## Task 1: Theme

- [x] Add manual light/dark selection with light as default.
- [x] Check lint, production build, keyboard, persistence, mobile sizing, and browser console.
- [x] Commit and push 790661f; verify successful Vercel deployment.

## Task 2: Main course

- [x] Claude authors videos 5–20, curriculum, labels, redirects, and main/extension UI.
- [x] Codex authors videos 21–34: date/time, shutdown, boot targets, text cutting, system information, users, groups, permissions, links, and networking.
- [x] Each Markdown file has summary, minutes, command index, explained quiz answers, command breakdowns, and hidden exercise solutions.
- [x] Check source facts against notes and primary manuals; execute representative commands in isolated labs.

## Task 3: Integration and delivery

- [x] Fix the verified 320px previous/next navigation overflow with an explicit single-column grid.
- [x] Run `pnpm check`, `pnpm lint`, and `pnpm build`.
- [x] Audit one-to-one coverage of videos 5–34 and verify all video IDs.
- [x] Review the final diff independently and fix important findings.
- [x] Check main/extension navigation, quizzes, exercise expansion, redirects, and both themes in a browser.
- [ ] Commit/push reviewed course work and check deployment.

## Compatibility decision

Retired lesson IDs unambiguously identify historical results, so their completion can carry to replacement topics and their quiz scores appear separately. Retained IDs cannot distinguish pre-rewrite from new submissions; they stay as saved snapshots, with a retake note, and never automatically complete another new topic. This avoids incorrectly marking new learners as finished.

Validation includes the production build, six compatibility tests, all 30 video IDs, 320px layout, quiz submission and legacy-history browser fixtures. Temporary-IP examples and Netplan generation were tested in an isolated Ubuntu lab; real VM reboot/persistent network application was not exercised.
