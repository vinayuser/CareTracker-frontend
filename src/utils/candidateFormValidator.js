import {
  digitsOnly,
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';
import { getImageUploadError } from './imageUploadValidation';

export const EXPERIENCE_OPTIONS = ['Fresher', '1-3 years', '3-5 years', '5+ years'];

export const CANDIDATE_MAX = {
  short: 40,
  medium: 100,
  long: 500,
};

const SHORT_FIELDS = new Set([
  'firstName', 'lastName', 'location', 'designation', 'education',
]);

const MEDIUM_FIELDS = new Set(['email', 'summary', 'skills']);

function clamp(value, max) {
  return String(value ?? '').slice(0, max);
}

function sanitizeMoney(value) {
  const raw = String(value || '').replace(/[^\d.]/g, '');
  const firstDot = raw.indexOf('.');
  if (firstDot === -1) return raw.slice(0, 12);
  const whole = raw.slice(0, firstDot).slice(0, 12);
  const frac = raw.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${frac}`;
}

/** Sanitize candidate field values as the user types. */
export function sanitizeCandidateField(field, value) {
  if (typeof value !== 'string') return value;
  if (field === 'phone') return formatUsPhone(value);
  if (field === 'currentCtc' || field === 'expectedCtc') return sanitizeMoney(value);
  if (SHORT_FIELDS.has(field)) return clamp(value, CANDIDATE_MAX.short);
  if (MEDIUM_FIELDS.has(field)) return clamp(value, CANDIDATE_MAX.medium);
  return value;
}

export function candidateFieldMaxLength(field) {
  if (field === 'phone') return 14;
  if (field === 'currentCtc' || field === 'expectedCtc') return 15;
  if (SHORT_FIELDS.has(field)) return CANDIDATE_MAX.short;
  if (MEDIUM_FIELDS.has(field)) return CANDIDATE_MAX.medium;
  return undefined;
}

function parseIsoDate(value = '') {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export const validateCandidateForm = (data) => {
  const errors = {};

  if (!data.firstName?.trim()) errors.firstName = 'First name is required';
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required';

  if (!data.phone?.trim()) {
    errors.phone = 'Phone is required';
  } else if (!isValidUsPhone(data.phone)) {
    errors.phone = 'Enter a valid US phone: (555) 123-4567';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.location?.trim()) errors.location = 'Location is required';
  if (!data.country?.trim()) errors.country = 'Country is required';
  if (!data.designation?.trim()) errors.designation = 'Designation is required';
  if (!data.education?.trim()) errors.education = 'Education is required';
  if (!data.experience?.trim()) errors.experience = 'Work experience is required';

  if (data.currentCtc !== '' && data.currentCtc != null && Number.isNaN(Number(data.currentCtc))) {
    errors.currentCtc = 'Current CTC must be a number';
  }
  if (data.expectedCtc !== '' && data.expectedCtc != null && Number.isNaN(Number(data.expectedCtc))) {
    errors.expectedCtc = 'Expected CTC must be a number';
  }

  if (data.dateOfBirth) {
    const dob = parseIsoDate(data.dateOfBirth);
    if (!dob) {
      errors.dateOfBirth = 'Enter a valid date of birth';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) errors.dateOfBirth = 'Date of birth must be in the past';
    }
  }

  if (!data.jobId) errors.jobId = 'Select a job';

  if (data.profilePic) {
    const picError = getImageUploadError(data.profilePic);
    if (picError) errors.profilePic = picError;
  }

  if (data.resume) {
    const name = String(data.resume.name || '').toLowerCase();
    if (!name.endsWith('.pdf') && data.resume.type !== 'application/pdf') {
      errors.resume = 'Resume must be a PDF file';
    } else if (data.resume.size > 10 * 1024 * 1024) {
      errors.resume = 'Resume must be 10 MB or smaller';
    }
  }

  return errors;
};

export const parseExperienceValue = (value) => {
  if (!value || value === 'Fresher') return 0;
  const parsed = parseFloat(value);
  if (!Number.isNaN(parsed)) return parsed;
  if (value.includes('1-3')) return 2;
  if (value.includes('3-5')) return 4;
  if (value.includes('5+')) return 5;
  return 0;
};

export { formatUsPhone, digitsOnly };
