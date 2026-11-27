# Ôn nhanh và demo Linux

User request: add a detailed summary to study quickly before Tuesday's demo; implement directly, then Claude can review later. Scope defaults to the existing TITV 5–34 Linux course and a 15–20 minute presentation. An optional scope question is pending; work proceeds under this stated assumption.

Add `/on-tap` with four sections: detailed topic summaries, a coherent terminal demonstration, oral questions with hidden answers, and a browser-local rehearsal checklist. Reuse the current palette, panels, Markdown renderer and copy controls. Surface it in the main navigation and homepage.

The demonstration uses one newly created directory and deterministic sample data, includes narration and observable results, and runs as a normal user. System administration examples belong to the detailed reference and explicitly use a lab VM. Summary topics link to the existing lessons and cover all 30 main videos.

Approaches: linking only to full lessons is too slow for rehearsal; a long unstructured cheat sheet is hard to scan. Choose a single structured page with native disclosure controls, a rehearsal script and short self-checks. No new dependency or backend schema is needed.

Checklist state is separate practice state stored locally, not a course-completion claim. Include a reset control and graceful handling of unavailable/invalid local storage.
