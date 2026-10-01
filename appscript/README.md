# Google Apps Script setup

1. Create a Google Sheet.
2. Add sheets named `Attendees`, `Rundown`, and optionally `Settings`.
3. Keep the NPK column formatted as **Plain text** so values such as `001234` are not converted to `1234`.
4. Paste `Code.gs` into Apps Script.
5. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE`.
6. Deploy as a Web App.
7. Put the `/exec` URL into `APPS_SCRIPT_URL` on the Next.js server.
