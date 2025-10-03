Design annotation instructions
==============================

Purpose
-------
This README explains how to annotate the two screenshots in this repo so the Product Designer can produce a short visual brief. The screenshots are:

- `docs/design/login_current.png` — current minimal UI (captured from the deployed user app)
- `docs/design/login_backup.png` — backup polished UI (legacy reference mock)

Recommended annotation workflow
-------------------------------
1) Tools (pick one):
   - Figma (preferred if you want vector annotations and live comments). Import the PNGs as frames and use sticky notes / arrows.
   - Photopea (free online Photoshop-like tool) for quick pixel annotations.
   - macOS Preview or Windows Photos for simple markup if you want to draw rectangles and add text.
   - Markup Hero, PixelSnap, or similar screenshot-annotation web tools.

2) Annotation guidance:
   - Keep annotations short (1–2 sentences each).
   - Tag annotations as one of: Keep, Improve, Remove, or Replace.
   - Prioritize: label each annotation with 1 (high), 2 (medium), or 3 (low) priority.
   - Give a short rationale (20–40 words) for each high-priority item explaining user benefit.

3) Which parts to annotate first:
   - Header / brand treatment (logo size, spacing)
   - Hero / H1 visibility (test-required H1 should remain visible for Playwright tests)
   - Login card (spacing, input clarity, CTA prominence)
   - Sidebar / navigation density (if present in backup)
   - Color tokens: highlight any use of accent/contrast you like

4) File naming and upload:
   - Name annotated files like `login_current.annotated.png` and `login_backup.annotated.png`.
   - Commit annotated files to the repo under `docs/design/` or attach them to the design ticket/PR.

5) Output the designer should produce:
   - A 1-page brief (PDF or MD) with two annotated images and 3–5 prioritized visual changes.
   - Simple token suggestions (hex values for primary accent and background) suitable for the Architect to convert.

How we will use the annotations
------------------------------
- The UI/UX Architect will convert prioritized annotations into tokens and component contract changes.
- The Developer will implement the first-pass visuals (Header and Login) and run Playwright smoke tests.

Git notes (exclusions)
---------------------
- We intentionally exclude `certs/` from commits because it contains private keys and generated TLS assets.

If you want me to create a PR branch with the annotated files included, say so and I'll create `design/visual-merge` and prepare a PR-ready commit (you will need to push it).
