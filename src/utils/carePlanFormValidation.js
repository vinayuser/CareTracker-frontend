import {
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';
import { formatLeadZipInput, isValidZipLocation } from './leadFormValidation';

export const CARE_PLAN_MAX = {
  short: 40,
  medium: 100,
  long: 500,
  state: 2,
};

const PHONE_KEYS = new Set([
  'phone', 'physicianPhone', 'emergencyPhone',
]);

const EMAIL_KEYS = new Set(['email']);

const ZIP_KEYS = new Set(['zip']);

const STATE_KEYS = new Set(['state']);

const SHORT_KEYS = new Set([
  'name', 'title', 'clientId', 'clientName', 'city',
  'primaryLanguage', 'gender', 'maritalStatus',
  'emergencyContact', 'emergencyRelationship',
  'physician', 'allergies',
  'preferredHospital', 'householdMembers', 'preferredPharmacy',
  'healthInsurance', 'policyId',
  'representativeName', 'frequencyOther', 'otherRisks',
  'responsibleStaff', 'frequency',
]);

const MEDIUM_KEYS = new Set([
  'address', 'otherText',
]);

const LONG_KEYS = new Set([
  'primaryDiagnosis', 'otherDiagnoses', 'specialInstructions',
  'culturalSpiritual', 'otherNotes', 'riskNotes', 'reasonForReview',
  'goalsOutcomes',
]);

const SKIP_KEYS = new Set([
  'photo', 'signature', 'clientPhoto',
]);

function clamp(value, max) {
  return String(value ?? '').slice(0, max);
}

function sanitizePolicyId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9\- ]/g, '').slice(0, CARE_PLAN_MAX.short);
}

/** Sanitize a single care-plan field value by key. */
export function sanitizeCarePlanField(field, value) {
  if (typeof value !== 'string') return value;
  if (SKIP_KEYS.has(field) || /signature|photo|logo|url/i.test(field)) return value;
  if (value.startsWith('data:image') || value.startsWith('/uploads/')) return value;

  if (PHONE_KEYS.has(field)) return formatUsPhone(value);
  if (ZIP_KEYS.has(field)) return formatLeadZipInput(value);
  if (STATE_KEYS.has(field)) {
    return clamp(value.replace(/[^a-zA-Z]/g, '').toUpperCase(), CARE_PLAN_MAX.state);
  }
  if (field === 'policyId') return sanitizePolicyId(value);
  if (SHORT_KEYS.has(field)) return clamp(value, CARE_PLAN_MAX.short);
  if (MEDIUM_KEYS.has(field) || EMAIL_KEYS.has(field)) return clamp(value, CARE_PLAN_MAX.medium);
  if (LONG_KEYS.has(field)) return clamp(value, CARE_PLAN_MAX.long);
  return clamp(value, CARE_PLAN_MAX.medium);
}

/** Sanitize an object patch for a formData section. */
export function sanitizeCarePlanPatch(section, patch) {
  if (Array.isArray(patch)) {
    if (section === 'clientGoals') {
      return patch.map((item) => (typeof item === 'string' ? clamp(item, CARE_PLAN_MAX.medium) : item));
    }
    if (section === 'careNeeds') {
      return patch.map((row) => {
        if (!row || typeof row !== 'object') return row;
        const next = { ...row };
        ['goalsOutcomes', 'frequency', 'responsibleStaff'].forEach((key) => {
          if (typeof next[key] === 'string') next[key] = sanitizeCarePlanField(key, next[key]);
        });
        if (next.interventions && typeof next.interventions === 'object') {
          const ints = { ...next.interventions };
          if (typeof ints.otherText === 'string') {
            ints.otherText = sanitizeCarePlanField('otherText', ints.otherText);
          }
          next.interventions = ints;
        }
        return next;
      });
    }
    return patch;
  }
  if (!patch || typeof patch !== 'object') return patch;

  const out = {};
  Object.entries(patch).forEach(([key, value]) => {
    if (typeof value === 'string') out[key] = sanitizeCarePlanField(key, value);
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // nested e.g. signatures[key], careNeed interventions already handled above
      const nested = {};
      Object.entries(value).forEach(([nk, nv]) => {
        nested[nk] = typeof nv === 'string' ? sanitizeCarePlanField(nk, nv) : nv;
      });
      out[key] = nested;
    } else {
      out[key] = value;
    }
  });
  return out;
}

function phoneError(value, label = 'Phone') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!isValidUsPhone(raw)) return `Enter a valid US ${label.toLowerCase()}: (555) 123-4567`;
  return '';
}

function emailError(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!isValidEmail(raw)) return 'Enter a valid email address';
  return '';
}

function zipError(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!isValidZipLocation(raw)) return 'Enter a valid ZIP (e.g. 78701 or 78701-1234)';
  return '';
}

/**
 * Validate care plan form. Returns flat error keys like `assessor.email`, `clientInfo.phone`.
 */
export function validateCarePlanForm(form = {}, { requireClient = true } = {}) {
  const errors = {};
  const d = form.formData || {};
  const assessor = d.assessor || {};
  const ci = d.clientInfo || {};
  const med = d.medicalInfo || {};

  if (requireClient && !form.clientId && !ci.clientId) {
    errors.clientId = 'Select a client';
  }

  const assessorPhone = phoneError(assessor.phone, 'Phone');
  if (assessorPhone) errors['assessor.phone'] = assessorPhone;
  const assessorEmail = emailError(assessor.email);
  if (assessorEmail) errors['assessor.email'] = assessorEmail;

  const ciPhone = phoneError(ci.phone, 'Phone');
  if (ciPhone) errors['clientInfo.phone'] = ciPhone;
  const ciEmergency = phoneError(ci.emergencyPhone, 'Emergency phone');
  if (ciEmergency) errors['clientInfo.emergencyPhone'] = ciEmergency;
  const ciEmail = emailError(ci.email);
  if (ciEmail) errors['clientInfo.email'] = ciEmail;
  const ciZip = zipError(ci.zip);
  if (ciZip) errors['clientInfo.zip'] = ciZip;

  const medPhone = phoneError(med.physicianPhone, 'Physician phone');
  if (medPhone) errors['medicalInfo.physicianPhone'] = medPhone;

  return errors;
}

export function carePlanFieldMaxLength(field) {
  if (STATE_KEYS.has(field)) return CARE_PLAN_MAX.state;
  if (ZIP_KEYS.has(field)) return 10;
  if (PHONE_KEYS.has(field)) return 14;
  if (SHORT_KEYS.has(field) || field === 'policyId') return CARE_PLAN_MAX.short;
  if (LONG_KEYS.has(field)) return CARE_PLAN_MAX.long;
  if (MEDIUM_KEYS.has(field) || EMAIL_KEYS.has(field)) return CARE_PLAN_MAX.medium;
  return CARE_PLAN_MAX.medium;
}
