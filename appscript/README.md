# Google Apps Script Setup — RAKER ADH Nasional 2026

## Google Sheet participant structure

The participant sheet must use these five columns:

| Column | Header | Purpose |
|---|---|---|
| A | No | Participant number |
| B | NPK | 6-digit participant NPK |
| C | NAMA | Participant name |
| D | TimeLog | First successful login timestamp |
| E | Hadir | Attendance flag; `1` after successful login |

Example:

`1 | 012345 | Albert | 08/10/2026 08:21:13 | 1`

## Rundown sheet

Create a sheet named `Rundown` with:

`Time | Activity | Type`

## Settings sheet

Create a sheet named `Settings` with:

`Key | Value`

Add `PDF_URL` in Key and the downloadable PDF URL in Value.

## Deploy

1. Open the Google Sheet.
2. Extensions → Apps Script.
3. Paste `Code.gs`.
4. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the Spreadsheet ID.
5. Deploy → New deployment → Web app.
6. Execute as: **Me**.
7. Who has access: **Anyone**.
8. Copy the `/exec` URL.
9. Put it in Vercel as `APPS_SCRIPT_URL`.

The website sends the NPK to Apps Script only after strict client/server validation of exactly 6 digits. If matched, the first login writes TimeLog and sets Hadir to `1`. A repeat login keeps the original TimeLog.
