/**
 * Shared validation for candidate hiring PDF forms (pipeline documents).
 * Returns { fieldErrors, messages, firstSection }.
 */
import {
  digitsOnly,
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';

export const HIRING_MAX = { short: 40, medium: 100, long: 500 };

export function clampText(value, max = HIRING_MAX.short) {
  return String(value ?? '').slice(0, max);
}

export function sanitizeSsn(value) {
  let cleaned = digitsOnly(value).slice(0, 9);
  if (cleaned.length > 3 && cleaned.length <= 5) {
    cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length > 5) {
    cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
}

export function isValidSsn(value) {
  return /^\d{3}-\d{2}-\d{4}$/.test(String(value || '').trim());
}

export function isValidZip(value) {
  return /^\d{5}(-\d{4})?$/.test(String(value || '').trim());
}

export function sanitizeZip(value) {
  return digitsOnly(value).slice(0, 5);
}

export { formatUsPhone, isValidUsPhone, isValidEmail, digitsOnly };

function parseIsoDate(value = '') {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isAtLeastAge(value, minAge = 18) {
  const d = parseIsoDate(value);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - minAge);
  return d <= cutoff;
}

export function maxDobIso(minAge = 18) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().slice(0, 10);
}

function createValidator() {
  const fieldErrors = {};
  let firstSection = null;
  const messages = [];

  const mark = (field, message, section) => {
    if (!fieldErrors[field]) {
      fieldErrors[field] = message;
      messages.push(message);
      if (!firstSection && section) firstSection = section;
    }
  };

  const requireText = (data, field, label, section) => {
    if (!String(data?.[field] ?? '').trim()) mark(field, `${label} is required`, section);
  };

  const requireEmail = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (!raw) mark(field, `${label} is required`, section);
    else if (!isValidEmail(raw)) mark(field, `Enter a valid ${label.toLowerCase()}`, section);
  };

  const requirePhone = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (!raw) mark(field, `${label} is required`, section);
    else if (!isValidUsPhone(raw)) mark(field, `Enter a valid US ${label.toLowerCase()}: (555) 123-4567`, section);
  };

  const optionalPhone = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (raw && !isValidUsPhone(raw)) {
      mark(field, `Enter a valid US ${label.toLowerCase()}: (555) 123-4567`, section);
    }
  };

  const requireSsn = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (!raw) mark(field, `${label} is required`, section);
    else if (!isValidSsn(raw)) mark(field, `${label} must be XXX-XX-XXXX`, section);
  };

  const requireDob18 = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (!raw) mark(field, `${label} is required`, section);
    else if (!isAtLeastAge(raw, 18)) mark(field, `${label}: must be at least 18 years old`, section);
  };

  const requireZip = (data, field, label, section) => {
    const raw = String(data?.[field] ?? '').trim();
    if (!raw) mark(field, `${label} is required`, section);
    else if (!isValidZip(raw)) mark(field, `Enter a valid 5-digit ${label.toLowerCase()}`, section);
  };

  const requireSignature = (hasSignature, field, label, section) => {
    if (!hasSignature) mark(field, `${label} is required`, section);
  };

  const requireTrue = (data, field, label, section) => {
    if (!data?.[field]) mark(field, label, section);
  };

  return {
    fieldErrors,
    messages,
    get firstSection() { return firstSection; },
    mark,
    requireText,
    requireEmail,
    requirePhone,
    optionalPhone,
    requireSsn,
    requireDob18,
    requireZip,
    requireSignature,
    requireTrue,
    result() {
      return { fieldErrors, messages, firstSection };
    },
  };
}

/** Employment Application 1020 */
export function validate1020(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Name', 'Full name', 'personal');
  v.requireText(data, 'Date', 'Application date', 'personal');
  v.requireText(data, 'Address', 'Address', 'personal');
  v.requireText(data, 'City', 'City', 'personal');

  const state = String(data.State || '').trim().toUpperCase();
  if (!state) v.mark('State', 'State is required', 'personal');
  else if (!/^[A-Z]{2}$/.test(state)) v.mark('State', 'Use a 2-letter state code', 'personal');

  v.requireZip(data, 'Zip', 'ZIP', 'personal');
  v.requireEmail(data, 'Email Address', 'Email', 'personal');
  v.requirePhone(data, 'Phone', 'Phone', 'personal');
  v.requireText(data, 'Position', 'Position applied for', 'position');

  const hours = String(data['How many hours can you work weekly'] || '').trim();
  if (hours) {
    const n = Number(hours);
    if (Number.isNaN(n) || n < 1 || n > 168) {
      v.mark('How many hours can you work weekly', 'Hours per week must be between 1 and 168', 'position');
    }
  }

  ['Prof Telephone_1', 'Prof Telephone_2', 'Prof Telephone_3', 'PHONE NUMBER', 'PHONE NUMBER_2', 'PHONE NUMBER_3']
    .forEach((field) => v.optionalPhone(data, field, 'Phone', field.startsWith('Prof') ? 'references' : 'employment'));

  v.requireSignature(hasSignature, 'Signature1_es_:signer:signature', 'Signature', 'signature');
  v.requireText(data, 'Date_2', 'Signature date', 'signature');
  return v.result();
}

/** Equal Opportunity 1021 */
export function validate1021(data) {
  const v = createValidator();
  v.requireText(data, 'Position Applied For', 'Position applied for', 'personal');
  v.requireText(data, 'Date of Application', 'Date of application', 'personal');
  v.requireText(data, 'First Name', 'First name', 'personal');
  v.requireText(data, 'Last Name', 'Last name', 'personal');
  v.requireDob18(data, 'Date of Birth', 'Date of birth', 'personal');
  v.requireText(data, 'City', 'City', 'personal');
  const state = String(data.State || '').trim().toUpperCase();
  if (!state) v.mark('State', 'State is required', 'personal');
  else if (!/^[A-Z]{2}$/.test(state)) v.mark('State', 'Use a 2-letter state code', 'personal');
  v.requireZip(data, 'Zip', 'ZIP', 'personal');
  return v.result();
}

/** Skills Checklist 1050 */
export function validate1050(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Print Name', 'Print name', 'signature');
  v.requireText(data, 'Date', 'Date', 'signature');
  v.requireSignature(hasSignature, 'Signature131_es_:signer:signature', 'Signature', 'signature');
  return v.result();
}

/** Request for Reference 1060 */
export function validate1060(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Employee Name', 'Employee name', 'main');
  v.requireDob18(data, 'Date of Birth', 'Date of birth', 'main');
  v.requireText(data, 'Date', 'Date', 'main');
  v.optionalPhone(data, 'Phone Number', 'Phone', 'main');
  v.requireSignature(hasSignature, 'Signature202_es_:signer:signature', 'Signature', 'main');
  return v.result();
}

/** Background Check 1070 */
export function validate1070(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Last First Middle', 'Full name', 'personal');
  v.requireSsn(data, 'Social Security', 'SSN', 'personal');
  v.requireDob18(data, 'DOB', 'Date of birth', 'personal');
  v.requirePhone(data, 'Phone', 'Phone', 'personal');
  v.requireText(data, 'Street', 'Current street address', 'address');
  v.requireText(data, 'CityStateZip', 'City / state / ZIP', 'address');
  v.requireText(data, 'Date', 'Date', 'authorization');
  v.requireText(data, 'Print Name', 'Print name', 'authorization');
  v.requireSignature(hasSignature, 'Signature103_es_:signer:signature', 'Signature', 'authorization');
  return v.result();
}

/** Care Availability 1204 */
export function validate1204(data) {
  const v = createValidator();
  v.requireText(data, 'Name', 'Name', 'personal');
  v.requireText(data, 'Position', 'Position', 'personal');
  v.requireText(data, 'Address', 'Address', 'personal');
  v.requirePhone(data, 'Cell Phone', 'Cell phone', 'personal');
  v.optionalPhone(data, 'Home Phone', 'Home phone', 'personal');
  v.requireEmail(data, 'Email', 'Email', 'personal');
  return v.result();
}

/** Handbook Acknowledgment 1201 */
export function validate1201(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireTrue(data, 'acknowledged', 'Please acknowledge the handbook before submitting', 'acknowledgement');
  v.requireText(data, 'Print Name', 'Print name', 'signature');
  v.requireText(data, 'Position with Company', 'Position', 'signature');
  v.requireText(data, 'Date', 'Date', 'signature');
  v.requireSignature(hasSignature, 'Signature30_es_:signer:signature', 'Signature', 'signature');
  return v.result();
}

/** Orientation Acknowledgements 1202 */
export function validate1202(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireTrue(data, 'orientation_acknowledged', 'Please acknowledge orientation materials before submitting', 'acknowledgement');
  v.requireText(data, 'Printed Name', 'Printed name', 'signature');
  v.requireText(data, 'Position with Company', 'Position', 'signature');
  v.requireText(data, 'Todays Date', "Today's date", 'signature');
  v.requireSignature(hasSignature, 'Signature31_es_:signer:signature', 'Signature', 'signature');
  return v.result();
}

/** Orientation Curriculum 1203 */
export function validate1203(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Print Name', 'Print name', 'signature');
  v.requireText(data, 'Position with Company', 'Position', 'signature');
  v.requireText(data, 'Date', 'Date', 'signature');
  v.requireSignature(hasSignature, 'Signature1_es_:signer:signature', 'Signature', 'signature');
  return v.result();
}

/** Abuse Neglect Policy 1220 */
export function validate1220(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'I', 'Employee name', 'policy');
  v.requireText(data, 'Date', 'Date', 'signature');
  v.requireSignature(hasSignature, 'Signature107_es_:signer:signature', 'Signature', 'signature');
  return v.result();
}

/** Care Associate Schedule 1530 */
export function validate1530(data, { hasCareAssociateSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Care Associate Print Name', 'Care associate name', 'policy');
  v.requireText(data, 'Date', 'Date', 'signature');
  v.requireSignature(hasCareAssociateSignature, 'Signature41_es_:signer:signature', 'Care associate signature', 'signature');
  return v.result();
}

/** Emergency Contact 1600 */
export function validate1600(data) {
  const v = createValidator();
  v.requireText(data, 'First Name', 'First name', 'personal');
  v.requireText(data, 'Last Name', 'Last name', 'personal');
  v.requireText(data, 'Address', 'Address', 'personal');
  v.requirePhone(data, 'Cellular Phone', 'Cellular phone', 'personal');
  v.optionalPhone(data, 'Home Phone', 'Home phone', 'personal');
  v.requireEmail(data, 'Email Address', 'Email', 'personal');
  v.requireText(data, 'Emergency Contact Name', 'Emergency contact name', 'emergency1');
  v.requireText(data, 'Relationship', 'Relationship', 'emergency1');
  v.requirePhone(data, 'Phone Numbers', 'Emergency contact phone', 'emergency1');
  v.optionalPhone(data, 'Phone Numbers_2', 'Emergency contact 2 phone', 'emergency2');
  v.optionalPhone(data, 'Phone Numbers_3', 'Emergency contact 3 phone', 'emergency3');
  return v.result();
}

/** Hepatitis B Consent 1720 */
export function validate1720(data, { hasSignature = false, consentChoice = '' } = {}) {
  const v = createValidator();
  const choice = consentChoice
    || (data['I elect to receive the Hepatitis B vaccine'] && 'consent')
    || (data['I decline the Hepatitis B Vaccine and understand I can receive it at any time in the future'] && 'decline')
    || (data['I have received the Hepatitis B Vaccine Series'] && 'alreadyVaccinated')
    || '';
  if (!choice) {
    v.mark('consentChoice', 'Select consent, declination, or already vaccinated', 'consent');
  }
  if (choice === 'alreadyVaccinated') {
    if (!String(data.Dates1 ?? '').trim() && !String(data.Dates2 ?? '').trim() && !String(data.Dates3 ?? '').trim()) {
      v.mark('Dates1', 'Enter at least one vaccination date if already vaccinated', 'consent');
    }
  }
  if (choice === 'decline') {
    v.requireText(data, 'Date_2', 'Date', 'declination');
    v.requireSignature(hasSignature, 'Signature125_es_:signer:signature', 'Signature', 'declination');
  } else if (choice) {
    v.requireText(data, 'Date', 'Date', 'consent');
    v.requireSignature(hasSignature, 'Signature124_es_:signer:signature', 'Signature', 'consent');
  }
  return v.result();
}

/** Pre-Employment Drug Consent 1740 */
export function validate1740(data, { hasApplicantSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Print Name', 'Applicant print name', 'main');
  v.requireText(data, 'Date', 'Date', 'main');
  v.requireSignature(hasApplicantSignature, 'Signature134_es_:signer:signature', 'Applicant signature', 'main');
  return v.result();
}

/** ID Badge Agreement 2900 */
export function validate2900(data, { hasEmployeeSignature = false } = {}) {
  const v = createValidator();
  const name = String(data.EmployeeNameBlank || data['Employee Name'] || '').trim();
  if (!name) v.mark('Employee Name', 'Employee name is required', 'issuance');
  v.requireText(data, 'Date', 'Date', 'issuance');
  v.requireSignature(hasEmployeeSignature, 'Signature136_es_:signer:signature', 'Employee signature', 'issuance');
  return v.result();
}

/** NDA / Noncompete 4000 */
export function validate4000(data, { hasEmployeeSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'Employee', 'Employee name', 'employee');
  v.requireText(data, 'Employee Address', 'Employee address', 'employee');
  v.requireText(data, 'Effective Date', 'Effective date', 'employee');
  v.requireText(data, 'Date', 'Date', 'employee');
  v.requireSignature(hasEmployeeSignature, 'Signature146_es_:signer:signature', 'Employee signature', 'employee');
  return v.result();
}

/** I-9 */
export function validateI9(data, { hasSignature = false } = {}) {
  const section = 'section1';
  const v = createValidator();
  v.requireText(data, 'Last Name (Family Name)', 'Last name', section);
  v.requireText(data, 'First Name (Given Name)', 'First name', section);
  v.requireText(data, 'Address Street Number and Name', 'Address', section);
  v.requireText(data, 'City or Town', 'City', section);
  v.requireText(data, 'State', 'State', section);
  v.requireZip(data, 'ZIP Code', 'ZIP', section);
  v.requireDob18(data, 'Date of Birth mmddyyyy', 'Date of birth', section);
  v.requireSsn(data, 'US Social Security Number', 'SSN', section);
  v.optionalPhone(data, 'Telephone Number', 'phone', section);
  const email = String(data['Employees E-mail Address'] ?? '').trim();
  if (email && !isValidEmail(email)) {
    v.mark('Employees E-mail Address', 'Enter a valid email address', section);
  }
  if (!(data.CB_1 || data.CB_2 || data.CB_3 || data.CB_4)) {
    v.mark('citizenship', 'Select a citizenship / immigration status', section);
  }
  if (data.CB_3 && !String(data['3 A lawful permanent resident Enter USCIS or ANumber'] ?? '').trim()) {
    v.mark(
      '3 A lawful permanent resident Enter USCIS or ANumber',
      'USCIS A-Number is required for lawful permanent residents',
      section,
    );
  }
  if (data.CB_4) {
    const hasDoc = [
      'USCIS ANumber',
      'Form I94 Admission Number',
      'Foreign Passport Number and Country of IssuanceRow1',
    ].some((field) => String(data[field] ?? '').trim());
    if (!hasDoc) {
      v.mark(
        'USCIS ANumber',
        'Provide at least one document number (A-Number, I-94, or passport)',
        section,
      );
    }
    if (!String(data['Exp Date mmddyyyy'] ?? '').trim()) {
      v.mark('Exp Date mmddyyyy', 'Work authorization expiration date is required', section);
    }
  }
  v.requireText(data, "Today's Date mmddyyy", "Today's date", section);
  v.requireSignature(hasSignature, 'Signature of Employee', 'Employee signature', section);
  return v.result();
}

/** W-4 2023 */
export function validateW4(data, { hasSignature = false } = {}) {
  const v = createValidator();
  v.requireText(data, 'text_ First name and middle initial', 'First name', 'personal');
  v.requireText(data, 'text_last name', 'Last name', 'personal');
  v.requireSsn(data, 'text_social security number', 'SSN', 'personal');
  v.requireText(data, 'text_address', 'Address', 'personal');
  v.requireText(data, 'text_City or town', 'City or town', 'personal');
  if (!(data.checkbox_single || data.checkbox_married || data['checkbox_head of household'])) {
    v.mark('filingStatus', 'Select a filing status', 'personal');
  }
  v.requireText(data, "text_employer's signature date", 'Signature date', 'signature');
  v.requireSignature(hasSignature, 'Signature', 'Employee signature', 'signature');
  return v.result();
}

const VALIDATORS = {
  '1020': validate1020,
  '1021': validate1021,
  '1050': validate1050,
  '1060': validate1060,
  '1070': validate1070,
  '1201': validate1201,
  '1202': validate1202,
  '1203': validate1203,
  '1204': validate1204,
  '1220': validate1220,
  '1530': validate1530,
  '1600': validate1600,
  '1720': validate1720,
  '1740': validate1740,
  '2900': validate2900,
  '4000': validate4000,
  'I-9': validateI9,
  'W-4': validateW4,
};

/**
 * Run validation for a hiring PDF form code.
 * @returns {{ ok: boolean, fieldErrors: object, messages: string[], firstSection: string|null }}
 */
export function validateHiringPdfForm(documentCode, formData, options = {}) {
  const fn = VALIDATORS[documentCode];
  if (!fn) {
    return { ok: true, fieldErrors: {}, messages: [], firstSection: null };
  }
  const result = fn(formData, options);
  return {
    ok: result.messages.length === 0,
    ...result,
  };
}

/** Format validation errors for StatusModal. */
export function formatHiringValidationMessage(messages = []) {
  if (!messages.length) return '';
  const shown = messages.slice(0, 6);
  const more = messages.length > 6 ? ` (+${messages.length - 6} more)` : '';
  return `${shown.join('. ')}.${more}`;
}
