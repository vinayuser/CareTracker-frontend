import {
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';
import { formatLeadZipInput, isValidZipLocation } from './leadFormValidation';

export const EVV_MAX = { short: 40, medium: 100, long: 500, state: 2 };

export const todayIso = () => new Date().toISOString().slice(0, 10);

const PHONE_FIELDS = new Set([
  'phone', 'agencyPhone', 'mobileNumber', 'primaryPhone', 'alternatePhone',
]);
const EMAIL_FIELDS = new Set(['email']);
const ZIP_FIELDS = new Set(['zip']);
const STATE_FIELDS = new Set(['state']);
const SKIP_FIELDS = new Set([
  'clientSignature', 'caregiverSignature', 'isSelf', 'methods',
]);

function clamp(value, max) {
  return String(value ?? '').slice(0, max);
}

function hasInk(value) {
  return Boolean(value && String(value).startsWith('data:image'));
}

function parseIsoDate(value = '') {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isAtLeastAge(value, minAge = 18) {
  const d = parseIsoDate(value);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - minAge);
  return d <= cutoff;
}

export function sanitizeEvvField(field, value) {
  if (typeof value !== 'string') return value;
  if (SKIP_FIELDS.has(field) || /signature/i.test(field)) return value;
  if (value.startsWith('data:image')) return value;

  if (PHONE_FIELDS.has(field)) return formatUsPhone(value);
  if (ZIP_FIELDS.has(field)) return formatLeadZipInput(value);
  if (STATE_FIELDS.has(field)) {
    return clamp(value.replace(/[^a-zA-Z]/g, '').toUpperCase(), EVV_MAX.state);
  }
  if (EMAIL_FIELDS.has(field)) return clamp(value.trim(), EVV_MAX.medium);
  if (field === 'employeeId' || field === 'clientId') return clamp(value, EVV_MAX.short);
  return clamp(value, EVV_MAX.medium);
}

export function sanitizeEvvPatch(section, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch;
  const next = { ...patch };
  Object.keys(next).forEach((key) => {
    if (typeof next[key] === 'string') {
      next[key] = sanitizeEvvField(key, next[key]);
    }
  });
  return next;
}

/**
 * Validate EVV enrollment form for caregiver submit.
 * Returns { ok, fieldErrors, messages, firstStep }.
 */
export function validateEvvEnrollmentForm(form, { mode = 'caregiver' } = {}) {
  const d = form?.formData || {};
  const fieldErrors = {};
  const messages = [];
  let firstStep = null;

  const fail = (key, message, step) => {
    if (fieldErrors[key]) return;
    fieldErrors[key] = message;
    messages.push(message);
    if (!firstStep) firstStep = step;
  };

  const requirePhone = (key, value, label, step, required = true) => {
    const raw = String(value ?? '').trim();
    if (!raw) {
      if (required) fail(key, `${label} is required`, step);
      return;
    }
    if (!isValidUsPhone(raw)) fail(key, `Enter a valid US ${label.toLowerCase()}: (555) 123-4567`, step);
  };

  const requireEmail = (key, value, label, step, required = true) => {
    const raw = String(value ?? '').trim();
    if (!raw) {
      if (required) fail(key, `${label} is required`, step);
      return;
    }
    if (!isValidEmail(raw)) fail(key, `Enter a valid ${label.toLowerCase()}`, step);
  };

  const cg = d.caregiverInfo || {};
  if (!String(cg.fullName || '').trim()) fail('caregiverInfo.fullName', 'Caregiver full name is required', 1);
  requirePhone('caregiverInfo.phone', cg.phone, 'Phone', 1, true);
  requireEmail('caregiverInfo.email', cg.email, 'Email', 1, true);

  const zip = String(cg.zip || '').trim();
  if (zip && !isValidZipLocation(zip)) fail('caregiverInfo.zip', 'Enter a valid ZIP (e.g. 78701)', 1);

  const dob = String(cg.dob || '').trim();
  if (dob) {
    if (!parseIsoDate(dob)) fail('caregiverInfo.dob', 'Date of birth must be a valid date', 1);
    else if (!isAtLeastAge(dob, 18)) fail('caregiverInfo.dob', 'Date of birth: must be at least 18 years old', 1);
  }

  if (cg.relationship === 'Other' && !String(cg.relationshipOther || '').trim()) {
    fail('caregiverInfo.relationshipOther', 'Specify other relationship', 1);
  }

  if (mode !== 'caregiver') {
    const cl = d.clientInfo || {};
    if (!String(cl.clientFullName || '').trim()) fail('clientInfo.clientFullName', 'Client full name is required', 1);
    requirePhone('clientInfo.phone', cl.phone, 'Client phone', 1, false);
    requireEmail('clientInfo.email', cl.email, 'Client email', 1, false);
    const clientZip = String(cl.zip || '').trim();
    if (clientZip && !isValidZipLocation(clientZip)) fail('clientInfo.zip', 'Enter a valid ZIP (e.g. 78701)', 1);
  }

  const methods = Array.isArray(d.evvMethods?.methods) ? d.evvMethods.methods : [];
  if (methods.length === 0) fail('evvMethods.methods', 'Select at least one EVV method', 2);
  if (methods.includes('Other') && !String(d.evvMethods?.other || '').trim()) {
    fail('evvMethods.other', 'Describe the other EVV method', 2);
  }

  const usesMobile = methods.some((m) => String(m).toLowerCase().includes('mobile'));
  const usesLandline = methods.some((m) => {
    const lower = String(m).toLowerCase();
    return lower.includes('landline') || lower.includes('ivr');
  });

  if (usesMobile) {
    if (!String(d.mobileEnrollment?.smartphoneType || '').trim()) {
      fail('mobileEnrollment.smartphoneType', 'Select smartphone type', 2);
    }
    requirePhone('mobileEnrollment.mobileNumber', d.mobileEnrollment?.mobileNumber, 'Mobile number', 2, true);
    requireEmail('mobileEnrollment.email', d.mobileEnrollment?.email, 'App registration email', 2, true);
  }

  if (usesLandline) {
    requirePhone('landlineEnrollment.primaryPhone', d.landlineEnrollment?.primaryPhone, 'Primary phone for EVV', 2, true);
    if (!String(d.landlineEnrollment?.phoneType || '').trim()) {
      fail('landlineEnrollment.phoneType', 'Select phone type', 2);
    }
    requirePhone('landlineEnrollment.alternatePhone', d.landlineEnrollment?.alternatePhone, 'Alternate phone', 2, false);
  }

  if (mode === 'caregiver' || mode === 'full') {
    if (!hasInk(d.authorization?.caregiverSignature)) {
      fail('authorization.caregiverSignature', 'Caregiver signature is required', 2);
    }
    if (!String(d.authorization?.caregiverDate || '').trim()) {
      fail('authorization.caregiverDate', 'Signature date is required', 2);
    }
    if (!hasInk(d.trainingAck?.caregiverSignature)) {
      fail('trainingAck.caregiverSignature', 'Training acknowledgement signature is required', 2);
    }
    if (!String(d.trainingAck?.date || '').trim()) {
      fail('trainingAck.date', 'Training acknowledgement date is required', 2);
    }
  }

  return {
    ok: messages.length === 0,
    fieldErrors,
    messages,
    firstStep,
  };
}

export function formatEvvValidationMessage(messages = []) {
  if (!messages.length) return '';
  const shown = messages.slice(0, 6);
  const more = messages.length > 6 ? ` (+${messages.length - 6} more)` : '';
  return `${shown.join('. ')}.${more}`;
}

/** Prefill blank caregiver signature dates with today. */
export function withTodaySignatureDates(formData) {
  const today = todayIso();
  const auth = formData?.authorization || {};
  const training = formData?.trainingAck || {};
  return {
    ...formData,
    authorization: {
      ...auth,
      caregiverDate: auth.caregiverDate || today,
    },
    trainingAck: {
      ...training,
      date: training.date || today,
    },
  };
}
