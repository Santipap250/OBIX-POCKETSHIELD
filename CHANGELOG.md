# Changelog

## v1.0.2 — Hacker Edition

- Replaced the Luxury Navy/Gold visual system with a cohesive hacker/cyber-operations interface: terminal panels, neon green accents, scanline/grid atmosphere, monospace typography, system status console, and responsive tool navigation.
- Reworked the password generator and strength estimator using cryptographically secure random selection and conservative weakness detection; repetitive, sequential, common, and predictable patterns are downgraded.
- Added a 6,400-token compound passphrase vocabulary with a seven-token default and selectable length.
- Preserved the OPS1 v1 AES-256-GCM file format and added a fixed legacy fixture regression test.
- Lowered the file encryption limit to 15 MiB to reduce browser memory pressure on phones.
- Hardened URL parsing, Thai official-domain checks, cookie analysis, and local-only lab output.
- Refined Service Worker precache, PWA metadata, CSP, and same-origin camera permission.
- Added GitHub Actions CI, security documentation, Thai deployment instructions, and expanded regression/UI tests.

## v1.0.1 — Premium hardening release

- Premium mobile-first responsive dashboard and browser-local security utilities.
- QR generator, URL analysis, AES file/text encryption, hashing, and cyber lab simulations.
- PWA installation and offline app shell.
