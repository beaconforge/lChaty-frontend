# Starter Design Plan — merge backup visual language into the minimal frontend

Overview
--------
We have two states:

- Backup (rich): `frontend_Back` — polished layout, sidebar, chat layout, detailed Tailwind styles and components.
- Current (minimal): `frontend` — intentionally small shell, easier to maintain, but visually sparse.

Goal
----
Produce a small, testable visual upgrade that brings the best of the backup into the current app while keeping deterministic test selectors and minimal runtime weight.

Deliverables (MVP)
------------------
1) Design brief (this plan + 2 mock images): Product Designer
2) Component contract and tokens: UI/UX Architect
3) Small implementation PR that replaces the current minimal shell with the upgraded look (Header, Login shell, Sidebar stub, Chat placeholder): Developer
4) Playwright visual regression snapshots & acceptance tests: QA/Architect

Prioritized tasks (short term)
--------------------------------
1. Compare & capture
   - Designer: give a 1-page annotated screenshot comparing the two home pages and highlight the parts to inherit (logo, header spacing, card treatment, color tokens).
   - Output: 2–3 annotated PNGs in `docs/design/`.

2. Tokens and accessibility
   - Architect: define color tokens, spacing scale, and accessible contrast checks.
   - Output: small CSS/Tailwind token file `src/styles/tokens.css` or tailwind config changes.

3. Minimal component contract
   - Architect: describe the Header, Sidebar, ChatLayout, Message (props, events, accessibility), and a tiny API for mounting the login screen.
   - Output: `docs/components-contract.md` (short, code-focused).

4. Implement low-risk visuals
   - Developer: implement the Header, Login shell, and Sidebar stub with the tokens. Keep components small and isolated.
   - Acceptance: Build passes, Playwright smoke tests still green, visual snapshots match design within tolerance.

5. Expand chat area
   - Developer: port the `ChatComponent` layout from `frontend_Back/src/components/ChatComponent.ts` but keep internal logic stubbed to call existing `services/api.*`.
   - Acceptance: Chat placeholder renders, UI elements have stable data-testids for E2E.

Acceptance criteria (each milestone)
-----------------------------------
- Build/Typecheck: no new TypeScript errors.
- Playwright smoke test: a single Playwright headed run opens the login page and verifies header and H1 are present.
- Visual snapshots: baseline snapshot for the login page (PNG) and a new snapshot after the style changes. Differences must be intentional.
- Accessibility: header and login form meet color contrast >= 4.5:1 for body copy.

Visual test suggestions
----------------------
- Use Playwright to capture `login.png` and `login_backup.png` at 1200x900. Use `ignoreHTTPSErrors` only for the backup server if needed. Store in `tmp/design-snapshots/`.
- Compare images locally with a visual diff tool or create a tiny script that uses pixelmatch to show difference percentage.

Initial timeline (estimates)
---------------------------
- Designer annotated screenshots: 1 day
- Architect tokens & component contract: 1 day
- Dev implementation (MVP header/login/sidebar): 1–2 days
- Playwright snapshots & QA: 0.5–1 day

Next immediate action (I can do now)
-----------------------------------
I can scaffold the `docs/design/` folder, add a `components-contract.md` template and a `src/styles/tokens.css` starter with the backup's color tokens. Tell me to proceed and I will:

1. Create `docs/design/` and `docs/components-contract.md` with the Architect template.
2. Add `src/styles/tokens.css` and wire a short import into `base.css` so the tokens are available.
3. Optionally capture guided screenshots from both running previews and save them to `docs/design/` for the Designer to annotate.
