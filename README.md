# OBIX POCKETSHIELD v1.0.2 — CYBER OPS

**Privacy-first hacker-style security toolkit and installable PWA.**

OBIX POCKETSHIELD is a static application that performs its security and developer utilities in the browser. It has no account requirement, paid API dependency, backend database, analytics or tracking service.

## Modules

- **Password Lab:** CSPRNG password generation, 6,400-token passphrase combinations (6–10 tokens), conservative local strength categories.
- **AES Encryption:** AES-256-GCM with PBKDF2-SHA256 (600,000 rounds), random salt and IV, authenticated `.obx` output. The OPS1 v1 file format remains compatible with v1.0.0/v1.0.1. File input is limited to 15 MiB for mobile memory safety.
- **Hash Engine:** SHA-256, SHA-384 and SHA-512 text/file digests and checksum comparison.
- **URL Inspector:** local heuristic inspection for HTTP, credentials in URLs, IP hosts, shorteners, Punycode, malformed percent encoding and known brand lookalikes. It does not visit destinations or query live reputation feeds.
- **JWT Inspector:** decodes header and payload only. It does not verify signatures.
- **Header Audit:** parses user-supplied HTTP response headers and cookie flags; it does not make requests to target sites.
- **QR Scanner:** uses the browser `BarcodeDetector` API for camera and image decoding. Browser support is not universal; unsupported browsers receive a clear message. No image is uploaded and no third-party decoder fallback is included in this release.
- **Safe Cyber Lab:** inert SQL Injection, XSS, input validation and cookie simulations, plus session-security guidance.
- **Dev Toolbox:** Base64, URL, HTML entity, JSON, timestamp, UUID, color, text diff and random token utilities.

## Run locally

Requires Node.js 20 or later. There are no runtime dependencies.

```bash
npm ci
npm test
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080`. Camera and Web Crypto features require HTTPS or localhost.

## GitHub and Vercel

1. Upload the **contents** of this folder to the repository root (the folder must not be nested one level deeper).
2. Connect the repository to Vercel, Framework Preset `Other`.
3. Build Command: `npm run build`.
4. Output Directory: `.`.
5. No environment variables are required.

GitHub Actions runs `npm ci`, `npm test`, and `npm run build` for pushes and pull requests. Vercel can deploy from `main` after the branch is updated.

## Install as a PWA

- Android: open the HTTPS site in Chrome, then use **Install app** / **Add to Home screen**.
- iPhone: open in Safari, use **Share → Add to Home Screen**.
- Desktop: use the browser install command where supported.

Load the app once while online before testing its offline app shell.

## Privacy and limitations

- Passwords, encryption keys, plaintext, files and QR images are not uploaded by the application.
- Theme, language, favorites and recent module names may be stored in local browser storage. These can be cleared in Privacy Protocol.
- Password strength is a conservative heuristic, not a breach-database lookup or an exact entropy measurement.
- Passphrase theoretical selection entropy assumes uniform selection from the 6,400 unique compound tokens.
- The URL Inspector is not antivirus, a phishing blocklist, live threat intelligence or a guarantee of safety.
- QR decoding depends on browser support for `BarcodeDetector`; actual camera behavior must be checked on the target devices.
- The app cannot scan all installed apps, operating-system files, device malware, Wi-Fi traffic or hidden device settings. It is not an antivirus product.
- Cyber Lab tools are educational simulations only and do not attack external systems.

## Tests

`npm test` covers password regressions, passphrase vocabulary, AES-GCM integrity and legacy OPS1 compatibility, hashing, URL false-positive/malformed-input cases, JWT parsing, DOM references, CSP/Permissions Policy and PWA precache assets. `npm run build` performs static release validation. Physical camera, PWA installation and offline behavior still require real-device verification after deployment.

## License

MIT. See `LICENSE`.
