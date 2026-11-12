# OBIX POCKETSHIELD v1.0.1 — Verification Report

## Automated checks

- JavaScript syntax checks: passed (`app.js`, `security.js`, `sw.js`, `qr.js`)
- `npm test`: **25 passed, 0 failed**
- `npm run build`: **passed** (static production validation)
- DOM reference check: all literal `getElementById` references found in the HTML
- PWA precache check: all listed assets exist
- QR encoder: generated samples decoded successfully with OpenCV QRCodeDetector, including ASCII payloads and Thai UTF-8 text using ECI (versions 1, 2, 3, and 4)
- AES file handling: verified 0-byte, 1 MB, wrong-password, and tampered-data cases
- URL scanner: verified known Thai official domains, lookalike domains, malformed percent encoding, and HTTP warnings
- Vercel policy check: same-origin camera only; microphone and geolocation disabled
- Inline event handlers: none in HTML; scripts are local
- Archive contents: verified with `unzip -t`

## Important manual checks after deployment

These require the deployed HTTPS origin and a real device/browser:

1. Grant and test camera permission on Android Chrome.
2. Verify QR scanning on the intended device. `BarcodeDetector` support is browser-dependent; unsupported browsers receive an explanatory message.
3. Test PWA installation and offline reload after the first successful load.
4. Test the appearance and touch layout on the actual Android/iOS devices used by the audience.

The app does not claim these device-specific checks have already been performed. The QR generator itself was tested independently by generating QR matrices and decoding them with OpenCV; this is not a substitute for testing the in-browser download flow on a phone.
