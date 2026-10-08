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
