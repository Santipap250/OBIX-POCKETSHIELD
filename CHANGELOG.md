# Changelog

## v1.0.2-wip (partial, not a final release)
- Fixed: password strength estimator no longer scores repetitive/sequential/keyboard/common passwords as strong (new `strength.js`, pattern-aware, local only, no entropy claim for typed passwords).
- Passphrase: default 7 words (6-10), no predictable numeric suffix, entropy shown as words x log2(list size). Wordlist is STILL only 80 words, so passphrases remain weak. A verified list of 2,048+ words is still required.
- Added `tests/strength.test.js` (regression cases incl. aaaa..., 1234567890..., password123, qwerty123456, abcdefghijklmnop, 1q2w3e4r5t6y).
- Service worker cache bumped to v1.0.2 and precaches `strength.js`.
- NOT done: jsQR fallback, Playwright E2E, CI workflow, CSP/offline browser verification, PR/merge/deploy.


## v1.0.1 — Premium hardening release

- Reworked the dashboard into a responsive premium dark interface with a champagne-gold security identity.
- Added same-origin camera permission while keeping microphone and geolocation disabled.
- Removed the inline QR upload handler to keep compatibility with the strict Content Security Policy.
- Rebuilt Service Worker precache and offline navigation fallback for the app shell, scripts, styles, manifest, and icons.
- Added defensive local URL analysis for malformed percent encoding, lookalike brand domains, shorteners, IP hosts, and unusual ports.
- Corrected false positives for known Thai official domains including SCB, Shopee, Lazada, and Google Thailand.
- Limited encrypted files to 50 MB for better memory safety on phones while preserving the v1.0.0 `.obx` data format.
- Added a fully local QR Generator with UTF-8 ECI support, PNG download, and verified decoding samples.
- Added Input Validation and Cookie Security simulations to Safe Cyber Lab, plus authentication session guidance.
- Refreshed PWA icons and metadata, added project validation, and expanded regression tests.

## v1.0.0

- Initial static browser-local security toolkit release.
