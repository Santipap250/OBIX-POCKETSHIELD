# Security Notes

## Reporting

Please report suspected vulnerabilities privately to the repository owner before public disclosure. Do not include real passwords, production tokens, personal files or sensitive URLs in an issue.

## Application security model

- Static, browser-local utilities; no first-party API or backend is used for the core modules.
- AES-256-GCM with PBKDF2-SHA256, 600,000 iterations, a fresh 16-byte salt, 12-byte IV and 128-bit authentication tag.
- The OPS1 v1 file envelope is kept compatible with previous releases. The parser accepts PBKDF2 counts from 100,000 through 1,000,000 to avoid unreasonable attacker-controlled work factors.
- CSPRNG (`crypto.getRandomValues`) is used for generated credentials, tokens, salts and IVs.
- Content Security Policy blocks inline scripts, external scripts, objects and framing. Camera is allowed only for the same origin; microphone and geolocation are disabled.
- Service Worker caches only same-origin application assets and the navigation app shell. It does not cache arbitrary external URLs or user-entered content.

## Limitations

- Password strength labels use conservative local heuristics. They are not exact entropy calculations and do not query breached-password services.
- URL risk results are heuristic and cannot prove a URL is safe.
- JWT decoding is not signature verification.
- QR scanning depends on the browser BarcodeDetector API. No third-party image upload or decoder fallback is used.
- The application is not antivirus and cannot scan the entire device, installed applications, OS files, Wi-Fi or hidden device settings.

## Supported security behavior

Please preserve the local-only privacy model, strict CSP, explicit permission requests and the legacy OPS1 compatibility tests when contributing changes.
