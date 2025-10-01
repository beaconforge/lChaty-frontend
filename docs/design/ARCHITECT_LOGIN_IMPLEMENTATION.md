Login screens implementation guide — Architect
===========================================

This guide describes how to implement the login screens for desktop and mobile, in both light and dark modes, using the tokens and brief provided in `docs/design/brief.md`.

Goals
-----
- Implement accessible, responsive login screens with minimal DOM changes.
- Keep Playwright testability: provide `data-testid` attributes for key elements.
- Use CSS custom properties (already present in `frontend/src/styles/tokens.css`) and Tailwind where appropriate.

Files to touch
--------------
- `frontend/src/styles/tokens.css` — update/add tokens as needed
- `frontend/src/styles/base.css` — import tokens and small utility classes
- `frontend/index.html` and `frontend/admin.html` — ensure header and H1 exist
- `frontend/src/app/user/main.user.ts` — mount the login card component
- Optionally: `frontend/src/components/LoginCard.ts` — create a small component that renders HTML + `data-testid`s

Tokens (map to `tokens.css`)
--------------------------------
- --lchaty-accent-600: #0b5fff
- --lchaty-accent-500: #2563eb
- --lchaty-fg: #0f172a
- --lchaty-muted: #6b7280
- --lchaty-bg: #ffffff
- --lchaty-border: #e6eef8

Dark mode tokens (prefixed with dark-)
- --lchaty-bg-dark: #0b1220
- --lchaty-fg-dark: #e6eef8
- --lchaty-border-dark: rgba(255,255,255,0.06)

CSS approach
------------
- Use `prefers-color-scheme` or a `.dark` class on `html` to switch tokens.
- Keep the login card markup semantic: `<form role="form" aria-labelledby="login-heading">`.
- Use `data-testid` attributes for these elements:
  - `data-testid="header-logo"` — header logo
  - `data-testid="login-username"` — username input
  - `data-testid="login-password"` — password input
  - `data-testid="login-submit"` — submit button

Responsive rules
----------------
- Desktop: center a max-width card (`clamp(320px, 38vw, 520px)`) with generous padding.
- Mobile: the card should be full-width with `padding: 16px` and a fixed bottom-safe-area padding for inputs.

Accessibility
-------------
- Ensure inputs have `<label for>` and `aria-describedby` for error messages.
- Use focus styles: `outline: none; box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.12)` or a 2px solid ring.
- Ensure color contrast (>= 4.5:1) for button text on the primary background.

Implementation steps (practical)
--------------------------------
1. Add/update tokens in `frontend/src/styles/tokens.css` (dark and light). Provide RGB helpers for focus outlines: `--lchaty-accent-rgb: 11,95,255;`.
2. Create `frontend/src/components/LoginCard.ts` (plain TS module that returns an HTML string or DOM nodes). Use template that includes `data-testid` attributes.
3. Update `main.user.ts` to import and mount the `LoginCard` instead of inline HTML. Keep fallback behavior intact.
4. Add CSS rules to `base.css` scoped to `.login-card` for card background, padding, radius, and responsive breakpoints; use tokens for colors.
5. Add dark mode rules using `.dark` or `prefers-color-scheme`.
6. Add Playwright smoke test in `frontend/tests/smoke.spec.ts` that loads the login page and asserts the presence of `data-testid` elements and that the H1 is visible.

Test hooks
----------
- `await page.locator('[data-testid="login-username"]').fill('demo')`
- `await page.locator('[data-testid="login-password"]').fill('demo')`
- `await page.locator('[data-testid="login-submit"]').click()`

Notes
-----
- Keep the component non-framework-specific — plain DOM + TypeScript makes it easy to integrate into the current app.
- Keep visual changes incremental and push small PRs so Playwright can validate each step.
