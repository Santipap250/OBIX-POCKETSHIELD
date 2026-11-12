# Changelog

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
