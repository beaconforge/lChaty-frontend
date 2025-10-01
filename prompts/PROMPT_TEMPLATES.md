Prompt templates — use with personas
=================================

Intent: These short templates show how to call a persona (from `prompts/personas.yaml`) to perform common tasks. Replace bracketed variables but do not change hard constraints.

1) Writing a docs page (tech-writer)

Persona: tech-writer

Summary: Write a concise Windows-first runbook for [TASK]. Include exact PowerShell commands, troubleshooting steps, and a 3-step verification checklist.

Constraints:
- Use only the two local origins and the backend origin.
- No TODOs; provide full content.

Deliverables:
- File: [path/to/file.md]

2) Implement a Vite/Ts change (frontend-eng → qa-e2e)

Persona: frontend-eng

Summary: Implement [FEATURE] by editing [file(s)]. Provide a short commit-style changelog and add/modify one Playwright test.

Secondary persona: qa-e2e — add or update Playwright test for MOCK + LIVE modes.

3) Add or fix host/cert scripts (devops)

Persona: devops

Summary: Implement idempotent script to add/remove hosts entries and generate SAN cert for both hosts. Provide PowerShell script and exact admin commands to trust cert.

4) Run-until-green loop operator (system-architect + tech-writer)

Persona: system-architect

Summary: Run the AI_OPERATIONS run-until-green loop. If a step fails, create a minimal patch and document the fix.

5) Review and release checklist (release)

Persona: release

Summary: Produce release notes and checklist. Ensure all acceptance gates from AI_OPERATIONS.md are explicitly checked; refuse release if any fail.

Template usage rules
- Start the assistant message with the persona line. E.g., "Persona: tech-writer".
- When invoking code edits, always include the EDIT log line (EDIT: <file> — <one-line rationale) in the reply.
