# Ôn nhanh và demo Linux

User request: add a detailed summary to study quickly before Tuesday's demo; implement directly, then Claude can review later. The user then confirmed the boundary: through stage 7. In the current curriculum this means stages 1–7, TITV videos 5–34, ending with networking. The rehearsal remains an estimated 15–20 minutes.

Add `/on-tap` with four sections: detailed topic summaries, a coherent terminal demonstration, oral questions with hidden answers, and a browser-local rehearsal checklist. Reuse the current palette, panels, Markdown renderer and copy controls. Surface it in the main navigation and homepage.

The demonstration uses one newly created directory and deterministic sample data, includes narration and observable results, and runs as a normal user. System administration examples belong to the detailed reference and explicitly use a lab VM. The summary has seven disclosures matching the seven curriculum stages, with links covering all 30 main videos. Stage 8 and later are outside this review scope.

Approaches: linking only to full lessons is too slow for rehearsal; a long unstructured cheat sheet is hard to scan. Choose a single structured page with native disclosure controls, a rehearsal script and short self-checks. No new dependency or backend schema is needed.

Checklist state is separate practice state stored locally, not a course-completion claim. Include a reset control and graceful handling of unavailable/invalid local storage.
