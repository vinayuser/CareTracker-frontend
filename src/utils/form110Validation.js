import { formatUsPhone, isValidEmail, isValidUsPhone } from './agencyInformationValidation';

const PHONE_FIELDS = [
  { key: 'phone', label: 'Phone', required: false },
  { key: 'cellPhone', label: 'Cell phone', required: false },
  { key: 'emergencyPhone', label: 'Emergency contact phone', required: false },
  { key: 'primaryCaregiverPhone', label: 'Primary caregiver phone', required: false },
  { key: 'pcpPhone', label: 'PCP phone', required: false },
  { key: 'pharmacyPhone', label: 'Pharmacy phone', required: false },
];

const emptyAllergyRows = () => ([
  { allergy: '', reaction: '' },
  { allergy: '', reaction: '' },
  { allergy: '', reaction: '' },
]);

/** Optional phone: empty OK; otherwise must be valid US (555) 123-4567 */
export function phoneFieldError(value, { required = false, label = 'Phone' } = {}) {
  const raw = String(value || '').trim();
  if (!raw) {
    return required ? `${label} is required` : '';
  }
  if (!isValidUsPhone(raw)) {
    return `Enter a valid US phone number: (555) 123-4567`;
  }
  return '';
}

export function validateForm110(data = {}) {
  const f = data || {};
  const errors = {};

  const first = String(f.firstName || '').trim()
    || String(f.clientName || '').trim().split(/\s+/)[0]
    || '';
  const last = String(f.lastName || '').trim()
    || String(f.clientName || '').trim().split(/\s+/).slice(1).join(' ')
    || '';

  if (!first) errors.firstName = 'First name is required';
  if (!last) errors.lastName = 'Last name is required';

  const email = String(f.email || '').trim();
  if (email && !isValidEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  const zip = String(f.zip || '').trim();
  if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) {
    errors.zip = 'Enter a valid US ZIP code (e.g. 78701)';
  }

  PHONE_FIELDS.forEach(({ key, label, required }) => {
    const message = phoneFieldError(f[key], { required, label });
    if (message) errors[key] = message;
  });

  // At least one contact phone is useful on physical assessment
  const hasAnyPhone = ['phone', 'cellPhone'].some((key) => String(f[key] || '').trim());
  if (!hasAnyPhone) {
    errors.phone = 'Enter a home or cell phone number';
  }

  if (f.allergicReactions === 'YES') {
    const rows = Array.isArray(f.allergies) ? f.allergies : [];
    const hasAllergy = rows.some((row) => String(row?.allergy || '').trim());
    if (!hasAllergy) {
      errors.allergies = 'List at least one allergy, or select No for allergic reactions';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function applyForm110PhoneFormat(key, value) {
  if (!PHONE_FIELDS.some((f) => f.key === key)) return value;
  return formatUsPhone(value);
}

export function clearAllergiesWhenNo(allergicReactions) {
  if (allergicReactions !== 'NO') return null;
  return { allergicReactions: 'NO', allergies: emptyAllergyRows() };
}

export { PHONE_FIELDS, formatUsPhone, emptyAllergyRows };
