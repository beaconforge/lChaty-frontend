Design brief — first-pass visual brief for Product Designer
===========================================================

Objective
---------
Create a concise visual brief and 2–3 small mocks that blend the best of the backup UI (`frontend_Back`) and the current minimal shell. The goal is to produce an implementable set of visual decisions (tokens, spacing, and a login + header mock) that the Architect and Developer can convert into code quickly.

Priority
--------
1) Login / Landing page (high)
2) Persistent Header (high)
3) Sidebar stub / chat placeholder (medium)

Assets available
----------------
- `docs/design/login_current.png` — (current minimal UI screenshot)
- `docs/design/login_backup.png` — (backup polished UI screenshot)
- Tokens: `frontend/src/styles/tokens.css` (primary colors and small helpers)
- Source: `frontend_Back/src/style.css` and `frontend_Back/src/components` (for reference only — do not commit `frontend_Back`)

Constraints & non-negotiables
----------------------------
- Keep the visible H1 used by tests: `Foundation. Innovation. Connection.` — this must remain visible and accessible in the top-left area in final pages.
- Any change must preserve Playwright testability: provide stable selectors or data-testids for the Header and Login form.
- Accessible contrast: body copy should meet WCAG AA (4.5:1) minimum.
- Keep the bundle weight low: avoid adding heavy icon libraries or fonts; prefer SVG assets already in `public/assets/`.

Deliverables (what we want back)
--------------------------------
1. Annotated images:
   - `docs/design/login_backup.annotated.png`
   - `docs/design/login_current.annotated.png`
   - Use tags: Keep / Improve / Remove / Replace with 1-3 priority level and a short rationale (<=40 words).

2. One-page brief (`docs/design/brief.md`) with:
   - Proposed primary color token hex values (or confirm tokens in `tokens.css`).
   - Font sizes/weights for H1 / H2 / body (px or rem) and spacing scale (4/8/16/24 steps preferred).
   - A small micro-interaction list (e.g. button hover, input focus ring) with simple specs.

3. Two small mocked images exported as PNGs (1200x900):
   - `docs/design/mock_login_v1.png` (primary proposal)
   - `docs/design/mock_login_alt.png` (one alternative, optional)

4. A short implementation note for the Architect (bullet list) describing token mapping to `frontend/src/styles/tokens.css` and required `data-testid`s for Playwright (header logo, login username, login password, login submit).

Suggested workflow & tools
--------------------------
- Figma is recommended: import the PNGs as frames and annotate using sticky notes and comments.
- If Figma is not available, export annotated PNGs from Photopea or similar.
- Name annotated files exactly and commit them to `docs/design/` or attach them to the PR.

Acceptance criteria
-------------------
- One annotated screenshot per source image with clear, prioritized changes.
- A single-page design brief with tokens and spacing that the Architect can translate into CSS/Tailwind tokens.
- Two mocks (1200x900) in `docs/design/` suitable for developer implementation.

Timeline & communication
------------------------
- Suggested: 1 business day for annotated screenshots and brief, 1 additional day for mocks (if no blockers).
- Add comments in the PR created for `design/designer-brief` if you want feedback; tag the Architect with @ (or leave comments in the PR thread).

Where to put the outputs
------------------------
Place all outputs in `docs/design/` and name files exactly as requested. If you need to attach a Figma link, include it in the README and brief.

If you want me to create the PR and assign reviewers (Architect and Dev), say so and I will create the PR and request the appropriate reviewers.
