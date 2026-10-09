# RAKER ADH Nasional 2026 — Deployment

## 1. Google Sheets
Participant sheet must use exactly these headers:

`No | NPK | NAMA | TimeLog | Hadir`

The app searches NPK in column B. On successful check-in, the first login writes the current timestamp to TimeLog (D) and `1` to Hadir (E). Repeat logins do not overwrite the first TimeLog.

Create a `Rundown` sheet with: `Time | Activity | Type`.
Create a `Settings` sheet with: `Key | Value`; put the PDF URL in the row `PDF_URL`.

## 2. Google Apps Script
Open Extensions → Apps Script from the Google Sheet and paste `appscript/Code.gs`.
Set `SPREADSHEET_ID` to the Google Sheet ID.
Deploy → New deployment → Web app.
- Execute as: Me
- Who has access: Anyone
Copy the `/exec` URL.

## 3. Next.js / Vercel
Set environment variable:
`APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec`

Then deploy this project to Vercel.

## 4. Check-in behavior
Input must be exactly 6 digits. A valid NPK immediately performs the attendance write and opens the animated rundown. No separate Check In button is required.


### Official event PDF and branding

The uploaded Maybank Finance logo is served from `public/maybank-finance-logo.jpg`. The Download button uses the bundled official PDF at `public/Raker-ADH-2026-09102026.pdf`; it no longer depends on the `PDF_URL` setting in Google Sheets. Replace that file and rebuild/redeploy if the PDF changes.


## Updated rundown (9 October 2026)

The fallback rundown in `app/page.tsx` has been updated to match the latest rundown supplied by the user. The live website reads the `Rundown` tab from Google Sheets when it contains rows, so also replace that tab's data with `google-sheets/Rundown-Updated.csv` (columns: `Time`, `Activity`, `Type`) to make the updated schedule appear live. Keep the header row and import/paste the 24 schedule rows beneath it.
