/** Shared visit time formatting in the schedule's IANA timezone (falls back to browser local). */

export const DEFAULT_TIMEZONE = 'America/New_York';

export const FALLBACK_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) — America/New_York' },
  { value: 'America/Chicago', label: 'Central Time (CT) — America/Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) — America/Denver' },
  { value: 'America/Phoenix', label: 'Arizona (MST) — America/Phoenix' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — America/Los_Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time — America/Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time — Pacific/Honolulu' },
  { value: 'America/Puerto_Rico', label: 'Atlantic (Puerto Rico) — America/Puerto_Rico' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Kolkata', label: 'India (IST) — Asia/Kolkata' },
  { value: 'Europe/London', label: 'UK (GMT/BST) — Europe/London' },
  { value: 'Europe/Paris', label: 'Central Europe — Europe/Paris' },
];

export function detectBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function formatVisitTime(iso, timeZone) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const opts = { hour: 'numeric', minute: '2-digit' };
  if (timeZone) opts.timeZone = timeZone;
  try {
    return d.toLocaleTimeString([], opts);
  } catch {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}

export function formatVisitTimeRange(startIso, endIso, timeZone) {
  const start = formatVisitTime(startIso, timeZone);
  const end = formatVisitTime(endIso, timeZone);
  if (!start && !end) return '';
  return `${start} – ${end}`;
}

/** Short zone label e.g. EST / IST */
export function formatTimezoneAbbr(iso, timeZone) {
  if (!timeZone) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(iso ? new Date(iso) : new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

/** Convert UTC ISO → datetime-local value in a given IANA timezone */
export function toDateTimeLocalValue(iso, timeZone) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
  } catch {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
