# RAKER ADH Nasional 2026 — Registration Portal

Next.js event registration portal based on the supplied RAKER ADH Nasional 2026 poster direction.

## Flow

1. Participant opens the registration page.
2. Participant enters an NPK that must be **exactly 6 numeric digits**.
3. Next.js validates the NPK server-side through the Google Apps Script Web App.
4. If the participant exists, the page unlocks an animated, scrollable rundown.
5. The rundown can expose a PDF download link returned by Apps Script.

## Tech

- Next.js 15.5.9
- React 19
- TypeScript
- Lucide icons
- CSS-only visual system, no Tailwind dependency
- Google Sheets + Apps Script as the source of truth
- Next.js server route used as a proxy to avoid browser CORS issues

## Google Sheet structure

### Sheet: `Attendees`

| NPK | Name | Branch | Position | Status |
|---|---|---|---|---|
| 123456 | Albert Tanaputra | Jakarta | Supervisor | REGISTERED |

NPK is treated as text in Apps Script so leading zeroes are preserved.

### Sheet: `Rundown`

| Time | Activity | Type |
|---|---|---|
| 08.30 – 08.35 | Indonesia Raya | Opening |
| 08.35 – 08.40 | Mars Maybank & Maybank Finance | Opening |

### Sheet: `Settings` (optional)

| Key | Value |
|---|---|
| PDF_URL | https://.../rundown.pdf |

If `Settings` is not used, set `NEXT_PUBLIC_PDF_URL` in the server environment.

## Apps Script

Open `appscript/Code.gs`, update `SPREADSHEET_ID`, then deploy it as a Web App:

- Execute as: **Me**
- Who has access: **Anyone** (or the appropriate access setting for your organization)

Copy the Web App `/exec` URL into `.env.local`:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
NEXT_PUBLIC_PDF_URL=https://example.com/rundown.pdf
```

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

Set the same environment variables in Vercel Project Settings and deploy.
