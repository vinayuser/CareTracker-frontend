import {
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

/** Soft check for zip/location — allow city/state text, but if digits-only require 5+ */
export function isValidZipLocation(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return false;
  if (raw.length < 3) return false;
  const digits = digitsOnly(raw);
  // Pure ZIP entry
  if (/^\d{5}(-\d{4})?$/.test(raw)) return true;
  // City / location text (may include ZIP)
  if (/[a-zA-Z]/.test(raw) && raw.length >= 3) return true;
  // Digits-only incomplete ZIP
  if (digits.length >= 5) return true;
  return false;
}

function phoneError(value, { required = false, label = 'Phone' } = {}) {
  const raw = String(value || '').trim();
  if (!raw) return required ? `${label} is required` : '';
  if (!isValidUsPhone(raw)) return `Enter a valid US phone: (555) 123-4567`;
  return '';
}

function emailError(value, { required = false } = {}) {
  const raw = String(value || '').trim();
  if (!raw) return required ? 'Email is required' : '';
  if (!isValidEmail(raw)) return 'Enter a valid email address';
  return '';
}

/**
 * Validate lead create/edit form data.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateLeadForm(form = {}) {
  const basic = form.formData?.basicInfo || {};
  const recipient = form.formData?.careRecipient || {};
  const family = form.formData?.familyRep || {};
  const errors = {};

  if (!String(basic.firstName || '').trim()) {
    errors['basicInfo.firstName'] = 'First name is required';
  }
  if (!String(basic.lastName || '').trim()) {
    errors['basicInfo.lastName'] = 'Last name is required';
  }

  const phoneMsg = phoneError(basic.phone, { required: true, label: 'Phone number' });
  if (phoneMsg) errors['basicInfo.phone'] = phoneMsg;

  const emailMsg = emailError(basic.email);
  if (emailMsg) errors['basicInfo.email'] = emailMsg;

  const altMsg = phoneError(basic.alternateNumber, { label: 'Alternate number' });
  if (altMsg) errors['basicInfo.alternateNumber'] = altMsg;

  if (!String(basic.inquiryDate || '').trim()) {
    errors['basicInfo.inquiryDate'] = 'Inquiry date is required';
  }

  const preferredStart = String(basic.preferredStartDate || '').trim();
  const inquiry = String(basic.inquiryDate || '').trim();
  if (preferredStart && inquiry && preferredStart < inquiry) {
    errors['basicInfo.preferredStartDate'] = 'Preferred start date cannot be before inquiry date';
  }

  if (!String(basic.zipLocation || '').trim()) {
    errors['basicInfo.zipLocation'] = 'Zip / location is required';
  } else if (!isValidZipLocation(basic.zipLocation)) {
    errors['basicInfo.zipLocation'] = 'Enter a city, state, and/or ZIP (e.g. San Jose, CA 95124)';
  }

  if (!String(recipient.firstName || '').trim()) {
    errors['careRecipient.firstName'] = 'Care recipient first name is required';
  }
  if (!String(recipient.lastName || '').trim()) {
    errors['careRecipient.lastName'] = 'Care recipient last name is required';
  }

  const familyPhoneMsg = phoneError(family.phone, { label: 'Family phone' });
  if (familyPhoneMsg) errors['familyRep.phone'] = familyPhoneMsg;

  const familyEmailMsg = emailError(family.email);
  if (familyEmailMsg) errors['familyRep.email'] = familyEmailMsg;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatLeadPhone(value = '') {
  return formatUsPhone(value);
}

export { isValidEmail, isValidUsPhone };
