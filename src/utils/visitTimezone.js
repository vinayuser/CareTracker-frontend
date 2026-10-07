/** Shared visit time formatting in the schedule's IANA timezone (falls back to browser local). */

export const DEFAULT_TIMEZONE = 'America/New_York';

export const FALLBACK_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) — America/New_York' },
  { value: 'America/Chicago', label: 'Central Time (CT) — America/Chicago' },
  { value: 'America/Denver', label: 'Mountain Time (MT) — America/Denver' },
  { value: 'America/Phoenix', label: 'Arizona (MST) — America/Phoenix' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — America/Los_Angeles' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT) — America/Anchorage' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST) — Pacific/Honolulu' },
  { value: 'America/Puerto_Rico', label: 'Atlantic (AST) — America/Puerto_Rico' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Kolkata', label: 'India (IST) — Asia/Kolkata' },
  { value: 'Europe/London', label: 'UK (GMT/BST) — Europe/London' },
  { value: 'Europe/Paris', label: 'Central Europe (CET) — Europe/Paris' },
];

/** Prefer named abbreviations over GMT+offset strings browsers often return. */
const TIMEZONE_ABBR_BY_IANA = {
  UTC: 'UTC',
  'Etc/UTC': 'UTC',
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
  'America/New_York': 'ET',
  'America/Detroit': 'ET',
  'America/Toronto': 'ET',
  'America/Chicago': 'CT',
  'America/Denver': 'MT',
  'America/Phoenix': 'MST',
  'America/Los_Angeles': 'PT',
  'America/Vancouver': 'PT',
  'America/Anchorage': 'AKT',
  'Pacific/Honolulu': 'HST',
  'America/Puerto_Rico': 'AST',
  'Europe/London': 'UK',
  'Europe/Paris': 'CET',
  'Europe/Berlin': 'CET',
};

function abbrFromFallbackLabel(timeZone) {
  const row = FALLBACK_TIMEZONES.find((tz) => tz.value === timeZone);
  if (!row?.label) return '';
  const match = row.label.match(/\(([A-Z]{2,5}(?:\/[A-Z]{2,5})?)\)/);
  return match?.[1] || '';
}

function isGmtOffsetLabel(value) {
  return /^(GMT|UTC)[+-]\d/i.test(String(value || '').trim());
}

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
    return d.toLocaleTimeString('en-US', opts);
  } catch {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

export function formatVisitTimeRange(startIso, endIso, timeZone) {
  const start = formatVisitTime(startIso, timeZone);
  const end = formatVisitTime(endIso, timeZone);
  if (!start && !end) return '';
  return `${start} – ${end}`;
}

/**
 * Named timezone label for listings (IST, ET, PT…) — never raw GMT+5:30 offsets.
 */
export function formatTimezoneAbbr(iso, timeZone) {
  if (!timeZone) return '';

  const known = TIMEZONE_ABBR_BY_IANA[timeZone] || abbrFromFallbackLabel(timeZone);
  if (known) return known;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(iso ? new Date(iso) : new Date());
    const shortName = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    if (shortName && !isGmtOffsetLabel(shortName)) return shortName;

    const longParts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortGeneric',
    }).formatToParts(iso ? new Date(iso) : new Date());
    const generic = longParts.find((p) => p.type === 'timeZoneName')?.value || '';
    if (generic && !isGmtOffsetLabel(generic)) return generic;
  } catch {
    // ignore
  }

  // Last resort: city portion of IANA id (Kolkata, New_York → New York)
  const city = String(timeZone).split('/').pop()?.replace(/_/g, ' ') || '';
  return city;
}

/** Time range + named timezone for schedule cards/lists. */
export function formatVisitTimeWithZone(startIso, endIso, timeZone) {
  const range = formatVisitTimeRange(startIso, endIso, timeZone);
  if (!range) return '';
  const abbr = formatTimezoneAbbr(startIso || endIso, timeZone);
  return abbr ? `${range} ${abbr}` : range;
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
