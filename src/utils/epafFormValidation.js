/** Validation + sanitize helpers for Form 1010 Employee Personal Action Form (EPAF). */

export const EPAF_MAX = {
  short: 40,
  medium: 100,
  long: 500,
};

const SHORT_FIELDS = new Set([
  'Last Name',
  'First Name',
  'Gender identified as',
  'Position',
  'W-4 Status',
  'Bank Name',
  'Reports To',
  'Resident of',
  'State',
  'Employee Name',
  'ESIPosition',
  'Immediate Supervisor',
  'If Terminated Who Was the Witness',
  'Completed By',
  'ManagerHR',
]);

const MEDIUM_FIELDS = new Set([
  'Mail',
  'ESIReason',
]);

function clamp(value, max) {
  return String(value ?? '').slice(0, max);
}

function sanitizeMoney(value) {
  const raw = String(value || '').replace(/[^\d.]/g, '');
  const firstDot = raw.indexOf('.');
  if (firstDot === -1) return raw.slice(0, 8);
  const whole = raw.slice(0, firstDot).slice(0, 8);
  const frac = raw.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${frac}`;
}

function sanitizeSsn(value) {
  let cleaned = String(value || '').replace(/\D/g, '').slice(0, 9);
  if (cleaned.length > 3 && cleaned.length <= 5) {
    cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length > 5) {
    cleaned = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
}

function parseIsoDate(value = '') {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isAtLeastAge(value, minAge) {
  const d = parseIsoDate(value);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setFullYear(cutoff.getFullYear() - minAge);
  return d <= cutoff;
}

function isValidSsn(value) {
  return /^\d{3}-\d{2}-\d{4}$/.test(String(value || '').trim());
}

function isValidZip(value) {
  return /^\d{5}$/.test(String(value || '').trim());
}

function hasMaritalStatus(data) {
  return !!(data.checkbox_married || data.checkbox_divorced || data.checkbox_single);
}

function hasPaycheckDelivery(data) {
  return !!(data.checkbox_PickupatOffice || data.checkbox_DirectDeposit);
}

function separationStarted(data) {
  return !!(
    data['Last Day Worked']
    || data.ESIPosition?.trim()
    || data['Immediate Supervisor']?.trim()
    || data.ESIReason?.trim()
    || data.checkbox_QuitWNotice
    || data.checkbox_QuitNONotice
    || data.checkbox_Terminated
    || data['checkbox_Job Abandonment']
    || data['Completed By']?.trim()
    || data.ManagerHR?.trim()
  );
}

/** Sanitize EPAF field values as the user types. */
export function sanitizeEpafField(field, value) {
  if (typeof value !== 'string') return value;
  if (field === 'ssn') return sanitizeSsn(value);
  if (field === 'Pay Rate') return sanitizeMoney(value);
  if (field === 'Routing') return String(value).replace(/\D/g, '').slice(0, 9);
  if (field === 'Account') return String(value).replace(/\D/g, '').slice(0, 17);
  if (field === 'zipcode') return String(value).replace(/\D/g, '').slice(0, 5);
  if (field === 'State' || field === 'Resident of') {
    return clamp(String(value).toUpperCase().replace(/[^A-Z]/g, ''), 2);
  }
  if (field === 'Hours Per Week' || field === 'Total Number of Hours Employee is Owed at Termination') {
    return String(value).replace(/[^\d.]/g, '').slice(0, 6);
  }
  if (SHORT_FIELDS.has(field)) return clamp(value, EPAF_MAX.short);
  if (MEDIUM_FIELDS.has(field)) return clamp(value, EPAF_MAX.medium);
  return value;
}

export function epafFieldMaxLength(field) {
  if (field === 'ssn') return 11;
  if (field === 'Pay Rate') return 11;
  if (field === 'Routing') return 9;
  if (field === 'Account') return 17;
  if (field === 'zipcode') return 5;
  if (field === 'State' || field === 'Resident of') return 2;
  if (SHORT_FIELDS.has(field)) return EPAF_MAX.short;
  if (MEDIUM_FIELDS.has(field)) return EPAF_MAX.medium;
  return undefined;
}

/**
 * Validate EPAF form. Returns { fieldErrors, firstSection }.
 * firstSection is the nav section id to jump to when invalid.
 */
export function validateEpafForm(data, { hasSignature = false } = {}) {
  const errors = {};
  let firstSection = null;

  const mark = (field, message, section) => {
    if (!errors[field]) {
      errors[field] = message;
      if (!firstSection) firstSection = section;
    }
  };

  // —— New hire (required for candidates) ——
  if (!data['First Name']?.trim()) mark('First Name', 'First name is required', 'newhire');
  if (!data['Last Name']?.trim()) mark('Last Name', 'Last name is required', 'newhire');
  if (!data.Mail?.trim()) mark('Mail', 'Mailing address is required', 'newhire');
  if (!data.State?.trim()) mark('State', 'State is required', 'newhire');
  else if (!/^[A-Z]{2}$/.test(data.State.trim())) mark('State', 'Use a 2-letter state code', 'newhire');

  if (!data.zipcode?.trim()) mark('zipcode', 'ZIP code is required', 'newhire');
  else if (!isValidZip(data.zipcode)) mark('zipcode', 'Enter a valid 5-digit ZIP', 'newhire');

  if (!data['Date of Birth']) mark('Date of Birth', 'Date of birth is required', 'newhire');
  else if (!isAtLeastAge(data['Date of Birth'], 18)) {
    mark('Date of Birth', 'Candidate must be at least 18 years old', 'newhire');
  }

  if (data['Gender identified as'] && !['Male', 'Female', 'Other'].includes(data['Gender identified as'])) {
    mark('Gender identified as', 'Select a gender', 'newhire');
  }

  if (!data.ssn?.trim()) mark('ssn', 'SSN is required', 'newhire');
  else if (!isValidSsn(data.ssn)) mark('ssn', 'Enter SSN as XXX-XX-XXXX', 'newhire');

  if (!hasMaritalStatus(data)) mark('maritalStatus', 'Select a marital status', 'newhire');

  if (!data['Date of Hire']) mark('Date of Hire', 'Date of hire is required', 'newhire');
  if (!data.Position?.trim()) mark('Position', 'Position is required', 'newhire');

  if (data['Pay Rate'] !== '' && data['Pay Rate'] != null && Number.isNaN(Number(data['Pay Rate']))) {
    mark('Pay Rate', 'Pay rate must be a number', 'newhire');
  }

  if (data['Hours Per Week'] !== '' && data['Hours Per Week'] != null) {
    const hours = Number(data['Hours Per Week']);
    if (Number.isNaN(hours)) mark('Hours Per Week', 'Hours must be a number', 'newhire');
    else if (hours < 0 || hours > 168) mark('Hours Per Week', 'Hours must be between 0 and 168', 'newhire');
  }

  if (!hasPaycheckDelivery(data)) {
    mark('paycheckDelivery', 'Select how paychecks are delivered', 'newhire');
  }

  if (data.checkbox_DirectDeposit) {
    if (!data['Bank Name']?.trim()) mark('Bank Name', 'Bank name is required for direct deposit', 'newhire');
    if (!data.Routing?.trim()) mark('Routing', 'Routing number is required', 'newhire');
    else if (!/^\d{9}$/.test(data.Routing)) mark('Routing', 'Routing number must be 9 digits', 'newhire');
    if (!data.Account?.trim()) mark('Account', 'Account number is required', 'newhire');
    else if (data.Account.length < 4) mark('Account', 'Enter a valid account number', 'newhire');
    if (!data.checkbox_checking && !data.checkbox_savings) {
      mark('accountType', 'Select checking or savings', 'newhire');
    }
  }

  // —— Separation (only if started) ——
  if (separationStarted(data)) {
    if (!data['Employee Name']?.trim()) mark('Employee Name', 'Employee name is required', 'separation');
    if (!data['Last Day Worked']) mark('Last Day Worked', 'Last day worked is required', 'separation');
    const hasCode = !!(
      data.checkbox_QuitWNotice
      || data.checkbox_QuitNONotice
      || data.checkbox_Terminated
      || data['checkbox_Job Abandonment']
    );
    if (!hasCode) mark('separationCode', 'Select a separation code', 'separation');
    if (!data.ESIReason?.trim()) mark('ESIReason', 'Reason for separation is required', 'separation');
    if (
      data['Total Number of Hours Employee is Owed at Termination'] !== ''
      && data['Total Number of Hours Employee is Owed at Termination'] != null
      && Number.isNaN(Number(data['Total Number of Hours Employee is Owed at Termination']))
    ) {
      mark(
        'Total Number of Hours Employee is Owed at Termination',
        'Hours owed must be a number',
        'separation',
      );
    }
  }

  // —— Signature ——
  if (!hasSignature) mark('Signature', 'Signature is required', 'signature');
  if (!data.signature_date) mark('signature_date', 'Signature date is required', 'signature');

  return { fieldErrors: errors, firstSection };
}
