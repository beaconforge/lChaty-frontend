# Components Contract (starter)

This short contract helps Developers and the UI/UX Architect agree on the shape, inputs, outputs, and test contracts for the main UI components.

Each component must include:
- Purpose: one sentence
- Inputs/Props: shape and types
- Outputs/Events: DOM events or callbacks
- Accessibility: ARIA, keyboard behavior
- Test hooks: data-testids or stable selectors for Playwright

1) Header
- Purpose: persistent top navigation that contains the logo, product name, and a minimal nav.
- Props: { username?: string | null }
- Events: emits `nav:home` when Home clicked
- Accessibility: role=banner, nav element with aria-label
- Test hooks: `data-testid="header-logo"`, `data-testid="header-home"`

2) LoginCard
- Purpose: compact login form used on the landing page
- Props: none
- Events: `login:submit` with payload { username, password }
- Accessibility: form with aria-labelledby, inputs with labels
- Test hooks: `data-testid="login-username"`, `data-testid="login-password"`, `data-testid="login-submit"`

3) Sidebar (stub for MVP)
- Purpose: vertical navigation & quick actions
- Props: { collapsed?: boolean }
- Events: `sidebar:toggle`
- Accessibility: role=navigation
- Test hooks: `data-testid="sidebar"`, `data-testid="sidebar-new-chat"`

4) ChatLayout (placeholder)
- Purpose: two-column chat layout (sidebar + main chat area)
- Props: none for MVP
- Accessibility: main chat area role="main" and labelled
- Test hooks: `data-testid="messages-container"`, `data-testid="message-input"`

Notes
- Keep classnames small and provide `data-testid` attributes for anything Playwright needs to assert.
- Avoid random or hashed ids in tests; prefer stable `data-testid` hooks.
