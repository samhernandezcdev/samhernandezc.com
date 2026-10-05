# Viewports and coverage

Defined in `scripts/screenshot.mjs`.

| Name | Size | Device scale |
|---|---|---|
| desktop | 1440 × 900 | 1 |
| mobile | 390 × 844 | 2 |

- Color schemes: `light`, `dark` (via `prefers-color-scheme` emulation; once the manual theme toggle exists, the system preference remains the default the script exercises).
- Reduced motion: always on during capture, so reveal animations don't hide content.
- Full-page screenshots.

## Routes
Discovered automatically from `dist/**/index.html` (so new routes are covered without editing the script). Override with `--routes`.

Expected after the redesign: `/`, `/work`, `/work/<slug>`, `/notes`, `/notes/<slug>`, `/about`, `/es`, `/es/work`, `/es/about`, `/404`.
Current (legacy) site: `/`, `/en`.

Dev-only pages (not in `dist/`) are captured through the dev server:
`MSYS_NO_PATHCONV=1 node scripts/screenshot.mjs --dev --routes /dev/design-system` (the env var stops Git Bash on Windows rewriting `/dev/...` into a filesystem path). The dev toolbar is disabled for captures.

## Extra manual checks when relevant
- 320 px width for overflow (pass `--routes` and temporarily adjust, or use the browser).
- Keyboard-only pass: skip link, focus order, palette open/close with Escape.
