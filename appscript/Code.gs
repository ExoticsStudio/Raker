/**
 * RAKER ADH NASIONAL 2026 - Google Apps Script Web App
 *
 * Required sheets:
 * Attendees: NPK | Name | Branch | Position | Status
 * Rundown:   Time | Activity | Type
 * Settings:  Key | Value (optional, for PDF_URL)
 */

const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const ATTENDEE_SHEET = 'Attendees';
const RUNDOWN_SHEET = 'Rundown';
const SETTINGS_SHEET = 'Settings';

function doGet(e) {
  try {
    const action = String(e?.parameter?.action || '').trim();
    if (action !== 'validate') {
      return json_({ ok: false, message: 'Invalid action.' });
    }

    const npk = String(e?.parameter?.npk || '').trim();
    if (!/^\d{6}$/.test(npk)) {
      return json_({ ok: false, message: 'NPK harus tepat 6 digit angka.' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const attendee = findAttendee_(ss, npk);

    if (!attendee) {
      return json_({ ok: false, message: 'NPK tidak ditemukan dalam daftar peserta terdaftar.' });
    }

    const status = String(attendee.status || '').trim().toUpperCase();
    if (status && ['REGISTERED', 'PRESENT', 'CHECKED-IN', 'CHECKED IN'].indexOf(status) === -1) {
      return json_({ ok: false, message: 'Status registrasi untuk NPK ini belum aktif.' });
    }

    return json_({
      ok: true,
      attendee: {
        npk: attendee.npk,
        name: attendee.name,
        branch: attendee.branch,
        position: attendee.position,
        status: attendee.status,
      },
      rundown: getRundown_(ss),
      pdfUrl: getSetting_(ss, 'PDF_URL'),
    });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, message: 'Terjadi kesalahan pada database event.' });
  }
}

function findAttendee_(ss, npk) {
  const sheet = ss.getSheetByName(ATTENDEE_SHEET);
  if (!sheet) throw new Error('Missing sheet: ' + ATTENDEE_SHEET);

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return null;

  const headers = values[0].map(normalize_);
  const index = {
    npk: headers.indexOf('npk'),
    name: headers.indexOf('name'),
    branch: headers.indexOf('branch'),
    position: headers.indexOf('position'),
    status: headers.indexOf('status'),
  };

  if (index.npk === -1 || index.name === -1) {
    throw new Error('Attendees sheet must contain NPK and Name columns.');
  }

  for (let i = 1; i < values.length; i++) {
    const rowNpk = String(values[i][index.npk] || '').trim();
    if (rowNpk === npk) {
      return {
        npk: rowNpk,
        name: index.name >= 0 ? String(values[i][index.name] || '').trim() : '',
        branch: index.branch >= 0 ? String(values[i][index.branch] || '').trim() : '',
        position: index.position >= 0 ? String(values[i][index.position] || '').trim() : '',
        status: index.status >= 0 ? String(values[i][index.status] || '').trim() : '',
      };
    }
  }
  return null;
}

function getRundown_(ss) {
  const sheet = ss.getSheetByName(RUNDOWN_SHEET);
  if (!sheet) return [];

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map(normalize_);
  const timeIndex = headers.indexOf('time');
  const activityIndex = headers.indexOf('activity');
  const typeIndex = headers.indexOf('type');

  if (timeIndex === -1 || activityIndex === -1) {
    throw new Error('Rundown sheet must contain Time and Activity columns.');
  }

  return values.slice(1)
    .map((row) => ({
      time: String(row[timeIndex] || '').trim(),
      activity: String(row[activityIndex] || '').trim(),
      type: typeIndex >= 0 ? String(row[typeIndex] || '').trim() : 'Session',
    }))
    .filter((item) => item.time && item.activity);
}

function getSetting_(ss, key) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) return '';
  const values = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toUpperCase() === key.toUpperCase()) {
      return String(values[i][1] || '').trim();
    }
  }
  return '';
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
