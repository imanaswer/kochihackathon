const SHEET_NAME = 'Leaderboard';

const HEADERS = [
  'Key',
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Location',
  'Occupation',
  'Domain',
  'Score',
  'Time (sec)',
  'Stack'
];

function doGet() {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return json_({ entries: [] });
    }

    const entries = values
      .slice(1)
      .filter(row => row.some(v => String(v) !== ''))
      .map(row => ({
        _key: String(row[0] || ''),
        timestamp: Number(row[1]) || 0,
        name: String(row[2] || ''),
        email: String(row[3] || ''),
        phone: String(row[4] || ''),
        location: String(row[5] || ''),
        occupation: String(row[6] || ''),
        domain: String(row[7] || ''),
        score: Number(row[8]) || 0,
        time: Number(row[9]) || 0,
        stack: String(row[10] || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }));

    return json_({ entries });

  } catch (err) {
    return json_({
      error: String(err),
      entries: []
    });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(
      e.postData && e.postData.contents
        ? e.postData.contents
        : '{}'
    );

    if (payload.action === 'add') {

      const entry = payload.entry || {};
      const sheet = getSheet_();
      const key = 'k_' + Date.now() + '_' +
        Math.random().toString(36).substring(2, 8);

      sheet.appendRow([
        key,
        Number(entry.timestamp) || Date.now(),
        entry.name || '',
        entry.email || '',
        entry.phone || '',
        entry.location || '',
        entry.occupation || '',
        entry.domain || '',
        Number(entry.score) || 0,
        Number(entry.time) || 0,
        Array.isArray(entry.stack)
          ? entry.stack.join(', ')
          : (entry.stack || '')
      ]);

      return json_({
        ok: true,
        key: key
      });
    }

    if (payload.action === 'delete') {

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

    if (payload.action === 'clear') {

      const sheet = getSheet_();
      const lastRow = sheet.getLastRow();

      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      return json_({ ok: true });
    }

    return json_({
      ok: false,
      error: 'Unknown action'
    });

  } catch (err) {

    return json_({
      ok: false,
      error: String(err)
    });
  }
}

function getSheet_() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, HEADERS.length)
      .setValues([HEADERS]);

    sheet.setFrozenRows(1);
  }

  return sheet;
}

function json_(obj) {

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}