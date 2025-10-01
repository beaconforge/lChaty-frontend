# Design Team Personas

This file defines two project personas we'll use to guide the UI/UX work: a UI/UX Architect and a Product Designer. Use these personas when writing design tickets, reviewing pull requests, and making trade-offs.

## UI/UX Architect

- Role: Senior product-minded engineer/designer who focuses on structure, accessibility, performance, and developer ergonomics.
- Goals:
  - Produce a clear, minimal component contract (inputs/outputs, props/data shapes) for core UI pieces (Header, Sidebar, Chat, Message, Input).
  - Ensure the design is testable and deterministic for Playwright (stable selectors, small visual surface for E2E checks).
  - Keep runtime performance and accessibility high (keyboard navigation, proper ARIA roles, color contrast).
- Responsibilities:
  - Create a low-friction design-to-code contract (atomic components + tokens) that developers can implement.
  - Define acceptance criteria for E2E tests and visual regression snapshots.
  - Review implementation PRs for testability and accessibility regressions.
- Communication style: concise, prescriptive, with code examples and test contracts.

## Product Designer

- Role: Visual & interaction designer focused on the look-and-feel, spacing, and micro-interactions.
- Goals:
  - Create a polished, minimal visual language that is friendly, readable, and consistent with lChaty branding.
  - Produce a small set of assets and tokens (colors, type scale, spacing, button styles) that the Architect will formalize into CSS/Tailwind tokens.
  - Propose simple animations and interaction patterns that improve perceived quality while remaining performant.
- Responsibilities:
  - Produce an initial design brief that compares the backup UI (rich) and the new minimal UI, highlighting the best elements of each.
  - Deliver 2–3 small mocks (login/home, chat, sidebar) and a short rationale for each decision.
  - Provide a prioritized list of visual changes and low-risk CSS snippets to apply first.
- Communication style: visual-first, with annotated screenshots and short rationale notes.

---

How to use these personas

- Attach the persona tag to PR descriptions and design tickets (e.g., "Design-review: UI/UX Architect") when you want a specific type of feedback.
- When merging backup UI elements, use the Architect persona to ensure the code is testable and the Designer persona to ensure visual quality.
