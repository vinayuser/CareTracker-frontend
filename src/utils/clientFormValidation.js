import {
  digitsOnly,
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';
import { formatLeadZipInput, isValidZipLocation } from './leadFormValidation';

export const CLIENT_MAX = {
  short: 40,
  medium: 100,
  long: 500,
  ssn: 4,
  state: 2,
};

const PHONE_FIELDS = new Set([
  'phone',
  'phoneHome',
  'emergencyContactPhone',
  'alternateContactPhone',
  'physicianPhone',
  'pharmacyPhone',
]);

const ZIP_FIELDS = new Set(['zipCode', 'billingZip']);

const SHORT_FIELDS = new Set([
  'firstName', 'lastName', 'preferredName', 'intakeId',
  'city', 'billingCity', 'aptSuite',
  'preferredLanguage', 'ethnicity', 'race',
  'emergencyContactName', 'alternateContactName',
  'physicianName', 'pharmacyName', 'preferredHospital',
  'insuranceProvider', 'authorizationPrintedName',
  'intakeCompletedBy', 'assignedTo',
  'paymentResponsibilityOther',
]);

const MEDIUM_FIELDS = new Set([
  'email', 'streetAddress', 'billingStreetAddress',
  'insuranceMemberId', 'insuranceGroupNumber',
]);

const SKIP_SANITIZE_FIELDS = new Set([
  'authorizationSignature',
  'profilePic',
]);

const LONG_FIELDS = new Set([
  'medicalConditions', 'allergies', 'currentMedications', 'specialDiet',
  'petsDescription', 'fallHistoryDescription',
  'mobilityAssistanceDescription', 'personalCareAssistanceDescription',
  'careNotes', 'notes',
]);

const POLICY_ID_FIELDS = new Set(['insuranceMemberId', 'insuranceGroupNumber', 'intakeId']);

function clamp(value, max) {
  return String(value ?? '').slice(0, max);
}

function sanitizePolicyId(value) {
  return String(value || '').replace(/[^a-zA-Z0-9\- ]/g, '').slice(0, CLIENT_MAX.short);
}

/** Sanitize a client intake field value by type before storing in form state. */
export function sanitizeClientField(field, value) {
  if (typeof value !== 'string') return value;
  if (SKIP_SANITIZE_FIELDS.has(field)) return value;

  if (PHONE_FIELDS.has(field)) return formatUsPhone(value);
  if (ZIP_FIELDS.has(field)) return formatLeadZipInput(value);
  if (field === 'ssnLast4') return digitsOnly(value).slice(0, CLIENT_MAX.ssn);
  if (field === 'state' || field === 'billingState') {
    return clamp(value.replace(/[^a-zA-Z]/g, '').toUpperCase(), CLIENT_MAX.state);
  }
  if (POLICY_ID_FIELDS.has(field)) return sanitizePolicyId(value);
  if (SHORT_FIELDS.has(field)) return clamp(value, CLIENT_MAX.short);
  if (MEDIUM_FIELDS.has(field)) return clamp(value, CLIENT_MAX.medium);
  if (LONG_FIELDS.has(field)) return clamp(value, CLIENT_MAX.long);
  return value;
}

export function clientFieldMaxLength(field) {
  if (field === 'ssnLast4') return CLIENT_MAX.ssn;
  if (field === 'state' || field === 'billingState') return CLIENT_MAX.state;
  if (ZIP_FIELDS.has(field)) return 10;
  if (PHONE_FIELDS.has(field)) return 14;
  if (SHORT_FIELDS.has(field) || POLICY_ID_FIELDS.has(field)) return CLIENT_MAX.short;
  if (MEDIUM_FIELDS.has(field)) return CLIENT_MAX.medium;
  if (LONG_FIELDS.has(field)) return CLIENT_MAX.long;
  return undefined;
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

function zipError(value, label = 'ZIP') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (!isValidZipLocation(raw)) return `Enter a valid ${label} (e.g. 78701 or 78701-1234)`;
  return '';
}

/** Step 1 required + typed field checks. */
export function validateClientStepOne(form = {}) {
  const errors = {};
  if (!String(form.firstName || '').trim()) errors.firstName = 'First name is required';
  if (!String(form.lastName || '').trim()) errors.lastName = 'Last name is required';

  const emailMsg = emailError(form.email);
  if (emailMsg) errors.email = emailMsg;

  const zipMsg = zipError(form.zipCode);
  if (zipMsg) errors.zipCode = zipMsg;

  const ssn = String(form.ssnLast4 || '').trim();
  if (ssn && !/^\d{4}$/.test(ssn)) errors.ssnLast4 = 'Enter the last 4 digits of SSN';

  [
    ['phone', 'Mobile phone'],
    ['phoneHome', 'Home phone'],
    ['emergencyContactPhone', 'Emergency phone'],
    ['alternateContactPhone', 'Alternate phone'],
    ['physicianPhone', 'Physician phone'],
    ['pharmacyPhone', 'Pharmacy phone'],
  ].forEach(([key, label]) => {
    const msg = phoneError(form[key], label);
    if (msg) errors[key] = msg;
  });

  return errors;
}

/** Full form checks before save (step 1 + billing zip). */
export function validateClientForm(form = {}) {
  const errors = validateClientStepOne(form);
  const billingZipMsg = zipError(form.billingZip, 'billing ZIP');
  if (billingZipMsg) errors.billingZip = billingZipMsg;
  return errors;
}

export { formatUsPhone, PHONE_FIELDS };
