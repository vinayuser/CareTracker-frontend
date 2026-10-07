import { formatUsPhone } from './hiringPdfFormValidation';

export const todayIso = () => new Date().toISOString().slice(0, 10);

const US_STATE_CODES = new Set([
  'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE',
  'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
  'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT',
  'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK',
  'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UM', 'UT',
  'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY',
]);

/** Convert yyyy-mm-dd to mm/dd/yyyy for PDF fields. */
export function isoToMmDdYyyy(value) {
  const raw = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-');
    return `${m}/${d}/${y}`;
  }
  return raw;
}

/**
 * Best-effort parse of a US location string into street / city / state / zip.
 * Handles formats like "123 Main St, Austin, TX 78701" or "Austin, TX".
 */
export function parseUsLocation(location) {
  const result = { street: '', city: '', state: '', zip: '' };
  const raw = String(location ?? '').trim();
  if (!raw) return result;

  const stateZipMatch = raw.match(/,\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/);
  if (stateZipMatch) {
    result.state = stateZipMatch[1].toUpperCase();
    result.zip = stateZipMatch[2];
    const withoutStateZip = raw.slice(0, stateZipMatch.index).trim();
    const parts = withoutStateZip.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      result.city = parts[parts.length - 1];
      result.street = parts.slice(0, -1).join(', ');
    } else if (parts.length === 1) {
      result.street = parts[0];
    }
    return result;
  }

  const stateOnlyMatch = raw.match(/,\s*([A-Za-z]{2})\s*$/);
  if (stateOnlyMatch && US_STATE_CODES.has(stateOnlyMatch[1].toUpperCase())) {
    result.state = stateOnlyMatch[1].toUpperCase();
    const withoutState = raw.slice(0, stateOnlyMatch.index).trim();
    const parts = withoutState.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      result.city = parts[parts.length - 1];
      result.street = parts.slice(0, -1).join(', ');
    } else if (parts.length === 1) {
      result.street = parts[0];
    }
    return result;
  }

  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    result.street = parts[0];
  } else if (parts.length === 2) {
    result.street = parts[0];
    result.city = parts[1];
  } else if (parts.length >= 3) {
    result.street = parts.slice(0, -2).join(', ');
    result.city = parts[parts.length - 2];
    const last = parts[parts.length - 1];
    const sz = last.match(/^([A-Za-z]{2})\s*(\d{5}(?:-\d{4})?)?$/);
    if (sz) {
      result.state = sz[1].toUpperCase();
      if (sz[2]) result.zip = sz[2];
    }
  }
  return result;
}

export function candidateFullName(candidate) {
  if (!candidate) return '';
  return `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
}

/** Shared candidate fields from portal document API. */
export function getCandidatePrefill(candidate) {
  if (!candidate) {
    return {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      designation: '',
      location: '',
      country: '',
      education: '',
      dateOfBirth: '',
      today: todayIso(),
    };
  }
  return {
    firstName: candidate.first_name || '',
    lastName: candidate.last_name || '',
    fullName: candidateFullName(candidate),
    email: candidate.email || '',
    phone: formatUsPhone(candidate.phone || ''),
    designation: candidate.designation || '',
    location: candidate.location || '',
    country: candidate.country || '',
    education: candidate.education || '',
    dateOfBirth: candidate.date_of_birth || '',
    today: todayIso(),
  };
}

/**
 * Merge empty defaults + saved draft + candidate prefill.
 * Prefill only fills keys that are still empty after saved draft.
 */
export function mergeFormWithCandidate(empty, savedFormData, prefillMap) {
  const saved = savedFormData && typeof savedFormData === 'object' ? savedFormData : {};
  const merged = { ...empty, ...saved };
  Object.entries(prefillMap || {}).forEach(([key, value]) => {
    const current = merged[key];
    const emptyVal = current == null || current === '' || current === false;
    if (emptyVal && value !== undefined && value !== null && value !== '') {
      merged[key] = value;
    }
  });
  return merged;
}

export const fieldInputOk =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
export const fieldInputErr =
  'w-full px-3 py-2 border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200';
