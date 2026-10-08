# RAKER ADH Nasional 2026 — Registration

Next.js registration portal with a premium black/yellow visual system based on the supplied event posters.

## NPK / Attendance flow

1. The participant enters an NPK in the browser.
2. The browser accepts only exactly 6 numeric digits.
3. Next.js sends the NPK to Google Apps Script through `/api/registration`.
4. Google Apps Script searches the official Google Sheet `Attendees` tab.
5. If the NPK exists, Apps Script writes `status_hadir = 1` to that participant row.
6. Apps Script returns the participant data and the rundown.
7. Next.js unlocks the animated rundown page.

**There is no Excel participant database in the browser. Google Sheets is the single source of truth.**

## Google Sheets structure

### Attendees

Required columns:

`NPK | Name | Branch | Position | status_hadir`

NPK should be stored as text or in a format that preserves leading zeroes. The app requires exactly 6 digits.

### Rundown

Required columns:

`Time | Activity | Type`

### Settings

Optional columns:

`Key | Value`

Add `PDF_URL` to control the rundown download link without changing the Next.js code.

## Google Apps Script

1. Open the Google Sheet.
2. Extensions → Apps Script.
3. Copy `appscript/Code.gs`.
4. Set `SPREADSHEET_ID`.
5. Deploy → New deployment → Web app.
6. Execute as the spreadsheet owner.
7. Set access according to your organization's requirements.
8. Put the `/exec` URL into `.env.local` as `APPS_SCRIPT_URL`.

## Next.js

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_PDF_URL=https://example.com/rundown.pdf
```

`NEXT_PUBLIC_PDF_URL` is only a fallback. Prefer the `PDF_URL` value from the `Settings` sheet.
