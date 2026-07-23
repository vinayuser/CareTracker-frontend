/** Platform date display: US MM/DD/YYYY */

const pad = (n) => String(n).padStart(2, '0');

export function parseToDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  if (!raw) return null;

  // MM/DD/YYYY or MM/DD/YYYY HH:mm
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
  if (us) {
    let hour = us[4] != null ? Number(us[4]) : 0;
    const minute = us[5] != null ? Number(us[5]) : 0;
    const ampm = (us[6] || '').toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    const d = new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]), hour, minute);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD or ISO
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const time = raw.includes('T') ? new Date(raw) : new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00`);
    return Number.isNaN(time.getTime()) ? null : time;
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** MM/DD/YYYY */
export function formatDateUS(value) {
  const d = parseToDate(value);
  if (!d) return '—';
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

/** MM/DD/YYYY, h:mm AM/PM */
export function formatDateTimeUS(value) {
  const d = parseToDate(value);
  if (!d) return '—';
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${formatDateUS(d)}, ${h}:${m} ${ampm}`;
}

/** YYYY-MM-DD for native date inputs / API */
export function toInputDate(value) {
  const d = parseToDate(value);
  if (!d) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** HH:mm for native time inputs */
export function toInputTime(value) {
  const d = parseToDate(value);
  if (!d) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function todayInputDate() {
  return toInputDate(new Date());
}

export function nowInputDateTimeLocal() {
  const d = new Date();
  return `${toInputDate(d)}T${toInputTime(d)}`;
}

/** Combine date (YYYY-MM-DD) + time (HH:mm) → ISO string */
export function combineDateAndTime(dateStr, timeStr = '09:00') {
  if (!dateStr) return null;
  const time = timeStr || '09:00';
  const d = new Date(`${toInputDate(dateStr)}T${time}:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
