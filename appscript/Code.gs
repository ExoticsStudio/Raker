/**
 * RAKER ADH NASIONAL 2026 - Google Apps Script Web App
 *
 * Google Sheet participant structure:
 * A = No
 * B = NPK
 * C = NAMA
 * D = TimeLog
 * E = Hadir
 *
 * When a valid 6-digit NPK is submitted:
 * - NPK is matched in column B
 * - NAMA is read from column C
 * - First successful login writes the current timestamp to column D
 * - Hadir is set to 1 in column E
 * - Existing TimeLog is never overwritten on repeat login
 */

const SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
const ATTENDEE_SHEET = 'Attendees'; // Change to your participant sheet name.
const RUNDOWN_SHEET = 'Rundown';
const SETTINGS_SHEET = 'Settings';
const NPK_HEADER = 'NPK';
const NAME_HEADER = 'NAMA';
const TIMELOG_HEADER = 'TimeLog';
const HADIR_HEADER = 'Hadir';

function doGet(e) {
  try {
    const action = String(e?.parameter?.action || '').trim();
    if (action !== 'validate' && action !== 'checkin') {
      return json_({ ok: false, message: 'Invalid action.' });
    }

    const npk = String(e?.parameter?.npk || '').trim();
    if (!/^\d{6}$/.test(npk)) {
      return json_({ ok: false, message: 'NPK harus tepat 6 digit angka.' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getAttendeeSheet_(ss);
    const attendee = findAttendee_(sheet, npk);

    if (!attendee) {
      return json_({
        ok: false,
        message: 'NPK tidak ditemukan dalam daftar peserta terdaftar.'
      });
    }

    if (action === 'checkin') {
      // Prevent two simultaneous scans from writing conflicting first timestamps.
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const latest = findAttendee_(sheet, npk);
        const timeCell = sheet.getRange(latest.rowNumber, 4);
        const hadirCell = sheet.getRange(latest.rowNumber, 5);
        const existingTime = String(timeCell.getDisplayValue() || '').trim();

        if (!existingTime) {
          timeCell.setValue(new Date());
          timeCell.setNumberFormat('dd/MM/yyyy HH:mm:ss');
          latest.timeLog = String(timeCell.getDisplayValue() || '').trim();
        } else {
          latest.timeLog = existingTime;
        }

        hadirCell.setValue(1);
        latest.hadir = '1';
        attendee.timeLog = latest.timeLog;
        attendee.hadir = '1';
      } finally {
        lock.releaseLock();
      }
    }

    return json_({
      ok: true,
      attendee: {
        npk: attendee.npk,
        name: attendee.name,
        timeLog: attendee.timeLog || '',
        hadir: attendee.hadir || '0'
      },
      rundown: getRundown_(ss),
      pdfUrl: getSetting_(ss, 'PDF_URL')
    });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, message: 'Terjadi kesalahan pada database event.' });
  }
}

function getAttendeeSheet_(ss) {
  const preferred = ss.getSheetByName(ATTENDEE_SHEET);
  if (preferred && hasParticipantHeaders_(preferred)) return preferred;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    if (hasParticipantHeaders_(sheets[i])) return sheets[i];
  }

  throw new Error('Tidak ditemukan sheet peserta dengan kolom NPK dan NAMA.');
}

function hasParticipantHeaders_(sheet) {
  if (sheet.getLastRow() < 1 || sheet.getLastColumn() < 5) return false;
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 5))
    .getDisplayValues()[0].map(normalize_);
  return headers.indexOf(normalize_(NPK_HEADER)) >= 0 &&
         headers.indexOf(normalize_(NAME_HEADER)) >= 0 &&
         headers.indexOf(normalize_(TIMELOG_HEADER)) >= 0 &&
         headers.indexOf(normalize_(HADIR_HEADER)) >= 0;
}

function findAttendee_(sheet, npk) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return null;

  const headers = values[0].map(normalize_);
  const npkIndex = headers.indexOf(normalize_(NPK_HEADER));
  const nameIndex = headers.indexOf(normalize_(NAME_HEADER));
  const timeIndex = headers.indexOf(normalize_(TIMELOG_HEADER));
  const hadirIndex = headers.indexOf(normalize_(HADIR_HEADER));

  if ([npkIndex, nameIndex, timeIndex, hadirIndex].some(i => i === -1)) {
    throw new Error('Kolom peserta wajib: NPK, NAMA, TimeLog, Hadir.');
  }

  for (let i = 1; i < values.length; i++) {
    const rowNpk = normalizeNpk_(values[i][npkIndex]);
    if (rowNpk === npk) {
      return {
        rowNumber: i + 1,
        npk: npk,
        name: String(values[i][nameIndex] || '').trim(),
        timeLog: String(values[i][timeIndex] || '').trim(),
        hadir: String(values[i][hadirIndex] || '').trim()
      };
    }
  }
  return null;
}

function getRundown_(ss) {
  const sheet = ss.getSheetByName(RUNDOWN_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0].map(normalize_);
  const timeIndex = headers.indexOf('time');
  const activityIndex = headers.indexOf('activity');
  const typeIndex = headers.indexOf('type');

  if (timeIndex === -1 || activityIndex === -1) {
    throw new Error('Rundown sheet must contain Time and Activity columns.');
  }

  return values.slice(1)
    .map(row => ({
      time: String(row[timeIndex] || '').trim(),
      activity: String(row[activityIndex] || '').trim(),
      type: typeIndex >= 0 ? String(row[typeIndex] || '').trim() : 'Session'
    }))
    .filter(item => item.time && item.activity);
}

function getSetting_(ss, key) {
  const sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return '';

  const values = sheet.getDataRange().getDisplayValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toUpperCase() === key.toUpperCase()) {
      return String(values[i][1] || '').trim();
    }
  }
  return '';
}

function normalizeNpk_(value) {
  const text = String(value || '').trim();
  if (!/^\d+$/.test(text)) return text;
  return text.padStart(6, '0');
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase();
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
