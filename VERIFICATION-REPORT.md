# TUIzACK v1.0.2 — Hacker Edition Verification Report

## Current automated checks completed in this release run

Environment: Node.js 22, npm CI install, Chromium headless/browser automation, and local static HTTP server.

- `npm ci`: passed; the project has no runtime dependencies.
- `npm test`: **23 passed, 0 failed**.
- `npm run build`: passed; `scripts/validate.js` reported 19 required assets, 10 precache assets and no inline handlers.
- `npm audit`: passed with **0 info, 0 low, 0 moderate, 0 high and 0 critical vulnerabilities**.
- JavaScript syntax validation: passed for `wordlist.js`, `core.js`, `app.js` and `sw.js` through the production validator.
- Secret/risky outbound scan: no secret-pattern match; no application `fetch`, XMLHttpRequest or beacon call. Service Worker fetches are same-origin cache/network handling only.

## Browser automation and responsive checks

The app was served from `http://127.0.0.1:8080` and opened in Chromium. Browser checks confirmed:

- Desktop interaction smoke test at the browser's 1280px viewport: no runtime errors captured.
- Navigation to all nine primary modules changed the hash and opened the intended section.
- Thai/English toggle, search filter and password generation responded successfully.
- Real browser crypto round-trip: AES-256-GCM encrypted and decrypted Thai/emoji text; wrong password was rejected.
- Password generator returned a 24-character result and the local estimator classified it; passphrase generation returned a seven-token compound passphrase from the 6,400-token vocabulary.
- URL Inspector returned LOW for `https://example.com` and HIGH for a deceptive Google lookalike.
- JWT decoder returned the payload and the UI remains explicitly non-verifying.
- Header analyzer identified six supplied security checks.
- QR flow displayed the explicit unsupported `BarcodeDetector` message in this browser; no fallback upload or external decoder was invoked.
- Service Worker was registered and controlling the page; cache `tuizack-cyber-v1.0.3` existed in the browser.
- Fixed a production UX issue found during deployment smoke testing: the first Service Worker installation no longer shows a misleading “Update available” toast; that toast now appears only for a real update when an existing controller is present.
- Chromium screenshots were captured and visually checked at 320px, 390px, 768px and 1440px. No horizontal overflow was observed in the inspected screenshots.

Evidence screenshots are stored under `docs/pocketshield-viewports/`.

## Security/production checks

The reviewed Vercel configuration uses same-origin scripts, disallows inline scripts, limits camera to the same origin, disables microphone and geolocation, sets HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Resource-Policy` and `Service-Worker-Allowed`. The local app uses DOM construction/text nodes for dynamic output; the documented educational XSS/SQLi examples remain inert simulations.

The ZIP version was compared against the existing GitHub `main` before integration. Existing history was preserved; the Hacker Edition is being delivered on a release branch rather than silently rewriting `main`.

## Manual checks still required after production deployment

1. Test camera permission and QR scanning on the intended Android Chrome device.
2. Verify QR image reading on each target browser and confirm `BarcodeDetector` support.
3. Install the PWA on Android/iOS and verify offline reload after one successful online load.
4. Test 15 MiB encryption/decryption on the actual low-memory phones intended for use.
5. Check keyboard behavior and visual layout on physical devices.
6. Verify the final Vercel response headers and HTTPS after the production deployment completes.

Automated checks do not claim these physical-device checks have been completed.
