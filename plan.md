# TUIzACK rebrand and visual upgrade plan

## Scope

Rebrand the existing OBIX POCKETSHIELD static application to **TUIzACK** while preserving all tool behavior, cryptographic formats, local-only privacy model, safe cyber-lab boundaries, tests, CSP and Service Worker behavior. Add clearer usage guidance without changing the underlying tool functions.

## Design direction

- **Design movement:** cinematic terminal / cyberpunk operations console with restrained sci-fi motion.
- **Core principles:** legibility first, deliberate motion, local-control transparency, and accessible reduced-motion behavior.
- **Color philosophy:** retain OLED black as the privacy/security foundation, use TUIzACK electric cyan as the ownable signature, neon green for healthy/local status, amber for caution and red only for high-risk output.
- **Layout paradigm:** a command-console shell with a status rail, hero console and module cards; avoid decorative motion that competes with forms.
- **Signature elements:** cyan scanline grid, animated signal pulse around the TUIzACK mark, and hover/focus command brackets.
- **Interaction philosophy:** every animation confirms state or guides attention; no autoplay video, no fake measurement, and no change to tool outputs.
- **Animation:** CSS-only ambient grid drift, subtle boot-line reveal, panel hover lift, focus ring, and reduced-motion fallback that disables movement while preserving contrast and layout.
- **Typography:** existing monospace cyber display paired with readable system Thai/Latin body text.
- **Brand essence:** TUIzACK is a local-first terminal interface for practical security and developer utilities; personality: precise, calm, transparent.
- **Brand voice:** “Inspect locally. Keep control.” and “No theatrics—only clear signals.”
- **Wordmark/logo:** retain the shield mark but add a cyan TUIzACK wordmark and terminal cursor accent.
- **Signature brand color:** electric cyan `#48e8ff`, reserved for TUIzACK identity and interactive focus.

## Implementation

- Update page title, metadata, manifest, visible brand labels, footer, console labels and docs from PocketShield to TUIzACK where they refer to the product name.
- Add an in-app “How to use” section with module cards, quick-start steps, privacy rules and limitations; link it from Home and navigation.
- Add scoped CSS animation classes and keyframes; do not add dependencies or change JavaScript tool logic.
- Preserve IDs, event wiring, `PocketShieldCore` compatibility, OPS1 format, Service Worker cache strategy and security headers.
- Update tests/validators only for intentional branding and usage content; do not remove or weaken tests.

## Project structure

- `index.html`: product metadata, shell, Home usage guide and visible labels.
- `style.css`: TUIzACK visual system, motion and responsive/reduced-motion behavior.
- `manifest.webmanifest`: PWA name/short name/description/theme.
- `sw.js`: cache version and static asset references only if required by branding/version.
- `README.md`, `START-HERE-TH.md`, `VERIFICATION-REPORT.md`: product documentation.
- `tests/`: regression coverage for branding, usage guidance and preserved tool references.
