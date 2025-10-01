Design brief — tokens and spacing (first-pass)
=============================================

This short file captures the first-pass tokens and spacing the Designer recommends for the MVP Header + Login work. The Architect can translate these into Tailwind tokens or CSS custom properties.

Color tokens
------------
- --lchaty-accent-600: #0b5fff  (Primary blue)
- --lchaty-accent-500: #2563eb  (Hover)
- --lchaty-fg: #0f172a         (Body text)
- --lchaty-muted: #6b7280      (Muted text)
- --lchaty-bg: #ffffff         (Page background)
- --lchaty-border: #e6eef8     (Subtle borders)

Type scale (rem)
--------------
- H1: 1.875rem (30px) — 700
- H2: 1.25rem (20px) — 600
- Body: 1rem (16px) — 400
- Small: 0.875rem (14px)

Spacing scale
-------------
- s-2: 4px
- s-1: 8px
- s0: 12px
- s1: 16px
- s2: 24px
- s3: 32px

Components (quick mapping)
--------------------------
- Header:
  - height: 56px
  - padding: s1 (16px)
  - logo size: 24–32px square
  - data-testid: header-logo, header-home

- Login card:
  - width: clamp(320px, 38vw, 520px)
  - padding: s2 (24px)
  - border-radius: 12px
  - CTA button height: 40px, border-radius: 8px
  - data-testid: login-username, login-password, login-submit

Micro-interactions
------------------
- Input focus: 2px outline using `--lchaty-accent-500` with 12% opacity.
- Button hover: darken primary to `--lchaty-accent-500`.
- Floating CTA (beta): subtle translateY -4px on hover.

Notes for the Architect
-----------------------
- Provide `data-testid` attributes for Header and Login elements.
- Prefer CSS custom properties in `tokens.css` so values are centrally maintained.
- Keep animations short (80–180ms) and GPU-friendly (transforms & opacity only).

Next: When Designer provides annotated images and mock PNGs, Architect will finalize tokens and Developer will implement header + login polish.
