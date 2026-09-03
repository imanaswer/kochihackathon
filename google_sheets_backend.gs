/**
 * Kochi Hackathon 2026 — Google Sheets backend
 *
 * Create/open the Google Sheet you want to use, then Extensions -> Apps Script
 * and paste this entire file. Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 */

const SHEET_NAME = 'Leaderboard';
const HEADERS = [
  'Key', 'Name', 'Email', 'Phone', 'Location', 'Occupation',
  'Domain', 'Score', 'Time', 'Stack', 'Timestamp'
];

function doGet() {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return json_({ entries: [] });

    const entries = values.slice(1)
      .filter(row => row.some(v => String(v) !== ''))
      .map(rowToEntry_);

    return json_({ entries });
  } catch (err) {
    return json_({ error: String(err), entries: [] });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData && e.postData.contents || '{}');
    const action = payload.action;

    if (action === 'add') {
      const entry = payload.entry || {};
      const key = Utilities.getUuid();
      const sheet = getSheet_();

      sheet.appendRow([
        key,
        entry.name || '',
        entry.email || '',
        entry.phone || '',
        entry.location || '',
        entry.occupation || '',
        entry.domain || '',
        Number(entry.score) || 0,
        Number(entry.time) || 0,
        Array.isArray(entry.stack) ? entry.stack.join(', ') : (entry.stack || ''),
        Number(entry.timestamp) || Date.now()
      ]);

      return json_({ ok: true, key });
    }

    if (action === 'delete') {
      const key = String(payload.key || '');
      const sheet = getSheet_();
      const values = sheet.getDataRange().getValues();
      for (let i = values.length - 1; i >= 1; i--) {
        if (String(values[i][0]) === key) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return json_({ ok: true });
    }

    if (action === 'clear') {
      const sheet = getSheet_();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
      return json_({ ok: true });
    }

    return json_({ error: 'Unknown action' });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function rowToEntry_(row) {
  return {
    _key: String(row[0] || ''),
    name: String(row[1] || ''),
    email: String(row[2] || ''),
    phone: String(row[3] || ''),
    location: String(row[4] || ''),
    occupation: String(row[5] || ''),
    domain: String(row[6] || ''),
    score: Number(row[7]) || 0,
    time: Number(row[8]) || 0,
    stack: String(row[9] || '').split(',').map(s => s.trim()).filter(Boolean),
    timestamp: Number(row[10]) || 0
  };
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
