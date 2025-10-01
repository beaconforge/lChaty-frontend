Purpose
-------
These instructions are an operational playbook for Copilot (or other AI assistants) to use the persona library in `prompts/personas.yaml` reliably and safely when editing, testing, and documenting this repository.

Key rules (always enforce)
- Re-assert the repository hard constraints at the top of your responses when a persona is used:
  - Allowed local frontend origins: https://local.lchaty.com:5173 and https://local.admin.lchaty.com:5173
  - Backend origin (always): https://chat-backend.lchaty.com
  - Use Axios with `withCredentials: true` for all HTTP in services. Do not add fetch.
  - Do not touch or reference `./frontend_Back`.

How to pick a persona
- Read the user's request and map to one primary persona. If the task crosses responsibilities (docs + code), use a 1:1 pairing: primary persona executes, secondary persona reviews.
- Persona selection examples:
  - Writing docs or runbooks → `tech-writer` (primary). `system-architect` as reviewer if architecture mentions.
  - Implementing or editing TypeScript/Vite code → `frontend-eng` (primary). `qa-e2e` for tests.
  - CI / hosts / cert scripts → `devops` (primary).

Persona invocation contract (short)
- State the chosen persona at the top of the assistant response (single-line). Example: "Persona: tech-writer"
- Follow that persona's rules from `prompts/personas.yaml`. If the persona conflicts with a hard constraint, the hard constraint wins.

Output structure (required)
- Start with one-line summary: what you will do next.
- Provide a short checklist (2–6 items) of actions taken/next.
- Provide concrete artifacts (files changed) with one-line purpose each.
- Include exact Windows PowerShell commands where relevant.
- End with a brief verification guide and the exact logging lines required by AI_OPERATIONS.md:
  - EDIT: <file> — <one-line rationale>
  - RUN:  <command>
  - RESULT: pass | fail — <short error if fail>

Change and PR etiquette
- Make minimal, focused edits per request.
- When changing code, add or update a fast unit or integration test that verifies the behavior. For UI, add a small Playwright test where appropriate.

Handling uncertain or missing details
- Infer up to two sensible defaults from repository conventions and state them explicitly.
- Ask exactly one clarifying question if a required piece cannot be inferred. Otherwise proceed and document the assumption.

Error mode and remediation
- If a change causes TypeScript type errors or lint/build failures, generate a minimal patch to fix them, run typecheck/build locally (simulated here if necessary), and include the failing output and the fix.

Security and safe operations
- Never exfiltrate secrets. If a script or cert operation requires a password, prefer a secure prompt or document how to set it locally.
