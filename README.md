# OBIX POCKETSHIELD v1.0.1

**Private Security Suite — premium, mobile-first, browser-local PWA.**

OBIX POCKETSHIELD is a static web application. Core tools process data locally in the browser; no account, database, required API key, paid backend, or analytics service is included.

## Included tools

- Secure password and passphrase generator, plus a local strength estimate
- AES-256-GCM text and file encryption using PBKDF2-SHA256 (600,000 iterations)
- SHA-256 / SHA-384 / SHA-512 hashing and digest comparison
- Local URL pattern analysis, including known brand-domain lookalikes and malformed encodings
- JWT Header/Payload decoder (does **not** verify signatures)
- HTTP Security Header and Set-Cookie analyzer for headers supplied by the user
- QR generator (local encoder, up to 78 ASCII bytes; non-ASCII text uses UTF-8 ECI with capacity based on encoded byte length) and QR scanner using the browser's `BarcodeDetector` API where supported
- Developer tools: Base64, URL, HTML entity, JSON, timestamp, UUID, color, text compare, random token
- Safe Cyber Lab simulations: SQL Injection, XSS, input validation, Cookie flags, and session guidance
- Responsive premium dashboard, theme preference, favorites, recent tools, Thai-first interface, and optional English navigation/tool headings
- PWA manifest and offline service worker cache

## Run locally

Requires Node.js 18+ for tests. No dependencies or install step are needed.

```bash
npm test
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080`. Camera access requires HTTPS or localhost.

## GitHub + Vercel deployment

1. Create or open the GitHub repository.
2. Upload the contents of this folder to the repository root (not the enclosing folder).
3. In Vercel choose **Add New → Project**, then import the repository.
4. Choose **Other** as the framework preset.
5. Build Command: `npm run build` (or leave blank; the app is static).
6. Output Directory: `.` (repository root).
7. No environment variables are required. Deploy.

Vercel applies the security headers in `vercel.json`. Camera access is allowed only to the same origin; microphone and geolocation remain disabled. Pushes to the connected branch trigger automatic deployments.

## Install as an app

- Android: open the deployed HTTPS site in Chrome → menu → Install app / Add to Home screen.
- iPhone: open in Safari → Share → Add to Home Screen.
- Desktop: use the browser's install action where supported.

## Privacy and technical limits

- Passwords, encryption keys, plaintext, selected files, QR images, and URLs are not uploaded by the application.
- Preferences, favorites, and recent tool names may be saved in local browser storage; users can turn off recent activity or clear local preferences.
- QR generation is fully local and supports payloads up to 78 ASCII bytes (UTF-8 ECI is used for non-ASCII text; capacity depends on encoded byte length) (QR versions 1–4, error-correction level L).
- The URL scanner is a **heuristic pattern checker**, not a reputation database, malware scanner, or guarantee of safety. It does not visit the URL.
- QR scanning depends on browser support for `BarcodeDetector`; Chrome on many Android devices supports it, but support is not universal. The app does not send images to a third party as a fallback.
- Web Crypto requires a secure context (HTTPS or localhost).
- File encryption is limited to 50 MB to reduce memory pressure on phones. Files created by v1.0.0 use the same `.obx` format and remain compatible.
- AES-GCM files cannot be recovered if the user loses the password.
- JWT decoding is not signature verification.
- This app cannot scan the whole phone, installed applications, operating-system files, Wi-Fi networks, or malware on the device. It is not an antivirus product.
- Cyber Lab exercises are local simulations only; they do not attack external systems.

## Tests

`npm test` runs AES, Hash, QR, URL-analysis, and project-integrity regression tests. `npm run build` validates required assets, JavaScript syntax, JSON configuration, and the absence of inline event handlers. Manual browser/device checks are still required for actual camera permissions and install prompts.

## License

MIT. See `LICENSE`.
