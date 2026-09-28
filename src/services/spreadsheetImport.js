import JSZip from 'jszip';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = String(text || '').replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0];
  const body = rows.slice(1).map((cols) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cols[index] || '';
    });
    return item;
  });
  return { headers, rows: body };
}

function sharedStrings(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.getElementsByTagName('si')].map((si) => (
    [...si.getElementsByTagName('t')].map((t) => t.textContent || '').join('')
  ));
}

function parseSheet(xml, strings) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const matrix = [];
  [...doc.getElementsByTagName('c')].forEach((cell) => {
    const ref = cell.getAttribute('r') || 'A1';
    const col = ref.replace(/[0-9]/g, '').split('').reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
    const rowIndex = Number(ref.replace(/[A-Z]/gi, '')) - 1;
    const type = cell.getAttribute('t');
    const raw = cell.getElementsByTagName('v')[0]?.textContent || '';
    let value = raw;
    if (type === 's') value = strings[Number(raw)] || '';
    if (type === 'inlineStr') {
      value = [...cell.getElementsByTagName('t')].map((t) => t.textContent || '').join('');
    }
    if (!matrix[rowIndex]) matrix[rowIndex] = [];
    matrix[rowIndex][col] = value;
  });
  const table = matrix.filter((row) => row?.some(Boolean)).map((row) => row.map((cell) => cell || ''));
  if (!table.length) return { headers: [], rows: [] };
  const headers = table[0];
  const rows = table.slice(1).map((cols) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = cols[index] || '';
    });
    return item;
  });
  return { headers, rows };
}

export async function readTabularFile(file) {
  const name = String(file?.name || '').toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt')) return parseCsv(await file.text());
  if (!name.endsWith('.xlsx')) throw new Error('Upload a CSV or XLSX file.');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const sheetFile = zip.file('xl/worksheets/sheet1.xml');
  if (!sheetFile) throw new Error('The workbook has no first sheet.');
  const strings = sharedStrings(await zip.file('xl/sharedStrings.xml')?.async('string'));
  return parseSheet(await sheetFile.async('string'), strings);
}

export const CSV_SCHEMA = [
  { column: 'First Name', required: 'No', example: 'Helen', allowed: 'Any text' },
  { column: 'Last Name', required: 'No', example: 'Brooks', allowed: 'Any text' },
  { column: 'Email', required: 'Yes', example: 'helen@northside.example', allowed: 'A valid email address' },
  { column: 'Phone', required: 'No', example: '555-0142', allowed: 'Any text' },
  { column: 'Company', required: 'No', example: 'Northside Family', allowed: 'Any text' },
  { column: 'Consent Status', required: 'Yes', example: 'Consented', allowed: 'Consented, Unsubscribed, or Unknown' },
  { column: 'Lead Status', required: 'No', example: 'Qualified', allowed: 'New, Qualified, or Nurture' },
  { column: 'Source', required: 'No', example: 'Website', allowed: 'Website, Referral, Event, or Import' },
  { column: 'Tags', required: 'No', example: 'Demo|Website', allowed: 'Labels separated by |' },
];

export function sampleCsv() {
  const header = CSV_SCHEMA.map((column) => column.column).join(',');
  const example = CSV_SCHEMA.map((column) => column.example).join(',');
  return `${header}\n${example}\n`;
}

export const IMPORT_FIELDS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'consentStatus', label: 'Consent Status' },
  { key: 'leadStatus', label: 'Lead Status' },
  { key: 'source', label: 'Source' },
  { key: 'tags', label: 'Tags' },
];

export function guessMapping(headers) {
  const aliases = {
    firstName: ['first name', 'firstname', 'first'],
    lastName: ['last name', 'lastname', 'last'],
    email: ['email', 'email address', 'e-mail'],
    phone: ['phone', 'mobile', 'phone number'],
    company: ['company', 'organization', 'agency'],
    consentStatus: ['consent status', 'consent', 'marketing consent'],
    leadStatus: ['lead status', 'status'],
    source: ['source'],
    tags: ['tags', 'tag'],
  };
  const mapping = {};
  IMPORT_FIELDS.forEach((field) => {
    const match = headers.find((header) => aliases[field.key].includes(String(header).trim().toLowerCase()));
    mapping[field.key] = match || '';
  });
  return mapping;
}

export function applyMapping(rows, mapping) {
  return rows.map((row) => {
    const next = {};
    IMPORT_FIELDS.forEach((field) => {
      const header = mapping[field.key];
      const value = header ? String(row[header] || '').trim() : '';
      next[field.key] = field.key === 'tags'
        ? value.split(/[|;]/).map((tag) => tag.trim()).filter(Boolean)
        : value;
    });
    if (next.consentStatus) {
      const raw = next.consentStatus.toLowerCase();
      if (['yes', 'true', 'consented', 'opted in', 'opt-in'].includes(raw)) next.consentStatus = 'Consented';
      else if (['no', 'unsubscribed', 'opted out'].includes(raw)) next.consentStatus = 'Unsubscribed';
      else if (raw === 'unknown' || raw === '') next.consentStatus = 'Unknown';
    }
    return next;
  });
}
