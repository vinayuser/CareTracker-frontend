import {
  formatUsPhone,
  isValidEmail,
  isValidUsPhone,
} from './agencyInformationValidation';
import { LEAD_STAGES } from './leadForm';

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

/** US ZIP only — 5 digits or ZIP+4 (12345 or 12345-6789). */
export function isValidZipLocation(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return false;
  return /^\d{5}(-\d{4})?$/.test(raw);
}

/** Keep digits and at most one hyphen for ZIP+4 while typing. */
export function formatLeadZipInput(value = '') {
  const raw = String(value || '');
  const digits = digitsOnly(raw).slice(0, 9);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
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

function parseIsoDate(value = '') {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function ageFromDob(dob) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/** Latest DOB allowed for someone who is at least `minAge` today (YYYY-MM-DD). */
export function maxDobForMinAge(minAge = 18) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dobError(value, { required = false, minAge = 18 } = {}) {
  const raw = String(value || '').trim();
  if (!raw) return required ? 'Date of birth is required' : '';
  const dob = parseIsoDate(raw);
  if (!dob) return 'Enter a valid date of birth';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob >= today) return 'Date of birth must be in the past';

  if (ageFromDob(dob) < minAge) {
    return `Care recipient must be at least ${minAge} years old`;
  }
  return '';
}

/** New Lead / intake overview fields */
export function validateLeadForm(form = {}, { requireDob = true } = {}) {
  const basic = form.formData?.basicInfo || {};
  const recipient = form.formData?.careRecipient || {};
  const family = form.formData?.familyRep || {};
  const care = form.formData?.careSummary || {};
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
    errors['basicInfo.zipLocation'] = 'Zip code is required';
  } else if (!isValidZipLocation(basic.zipLocation)) {
    errors['basicInfo.zipLocation'] = 'Enter a valid ZIP code (e.g. 95124 or 95124-1234)';
  }

  if (!String(recipient.firstName || '').trim()) {
    errors['careRecipient.firstName'] = 'Care recipient first name is required';
  }
  if (!String(recipient.lastName || '').trim()) {
    errors['careRecipient.lastName'] = 'Care recipient last name is required';
  }

  const dobMsg = dobError(recipient.ageOrDob, { required: requireDob, minAge: 18 });
  if (dobMsg) errors['careRecipient.ageOrDob'] = dobMsg;

  if (!String(care.careTypeRequested || '').trim()) {
    errors['careSummary.careTypeRequested'] = 'Care type is required';
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

export function validateContactedStep(contact = {}) {
  const errors = {};
  if (!String(contact.contactMethod || '').trim()) {
    errors.contactMethod = 'Contact method is required';
  }
  if (!String(contact.contactedAt || '').trim()) {
    errors.contactedAt = 'Contact date & time is required';
  }
  if (!String(contact.spokeWith || '').trim()) {
    errors.spokeWith = 'Spoke with is required';
  }
  if (!String(contact.contactedBy || '').trim()) {
    errors.contactedBy = 'Contacted by is required';
  }
  if (!String(contact.notes || '').trim()) {
    errors.notes = 'Call outcome / notes are required';
  } else if (String(contact.notes).length > 500) {
    errors.notes = 'Notes must be 500 characters or less';
  }
  if (contact.callStatus === 'move_next' && !String(contact.assignTo || '').trim()) {
    errors.assignTo = 'Assign to is required';
  }
  if (contact.callStatus === 'needs_time' && !String(contact.followUpDate || '').trim()) {
    errors.followUpDate = 'Follow-up date is required';
  }
  const followUp = String(contact.followUpDate || '').trim();
  if (followUp) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    // Normalize YYYY-MM-DD from ISO if needed
    const followDay = followUp.includes('T') ? followUp.slice(0, 10) : followUp;
    if (followDay < todayStr) {
      errors.followUpDate = 'Next Follow-up Date cannot be earlier than today';
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAssessmentStep(form = {}) {
  const home = form.formData?.homeAssessment || {};
  const errors = {};
  if (!String(home.visitDate || '').trim()) errors.visitDate = 'Visit date is required';
  if (!String(home.visitTime || '').trim()) errors.visitTime = 'Visit time is required';
  if (!String(home.assessorName || '').trim()) errors.assessorName = 'Assessor name is required';
  if (!String(home.location || '').trim()) errors.location = 'Visit location is required';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProposalStep(form = {}) {
  const proposal = form.formData?.proposal || {};
  const errors = {};
  if (!String(proposal.sentDate || '').trim()) {
    errors.sentDate = 'Proposal sent date is required';
  }
  if (!String(proposal.notes || '').trim()) {
    errors.notes = 'Proposal notes are required';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateConvertStep(form = {}) {
  const recipient = form.formData?.careRecipient || {};
  const basic = form.formData?.basicInfo || {};
  const errors = {};
  const first = String(recipient.firstName || basic.firstName || '').trim();
  const last = String(recipient.lastName || basic.lastName || '').trim();
  if (!first) errors['careRecipient.firstName'] = 'Care recipient first name is required to convert';
  if (!last) errors['careRecipient.lastName'] = 'Care recipient last name is required to convert';
  const proposalCheck = validateProposalStep(form);
  Object.assign(errors, proposalCheck.errors);
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate the current pipeline step before advancing.
 * @returns {{ valid: boolean, errors: Record<string, string>, message?: string }}
 */
export function validateLeadStep(form = {}, step = 'New Lead') {
  switch (step) {
    case 'New Lead':
      return validateLeadForm(form, { requireDob: true });
    case 'Contacted':
      return validateContactedStep(form.formData?.contactLog || {});
    case 'Assessment Scheduled':
      return validateAssessmentStep(form);
    case 'Proposal Sent':
      return validateProposalStep(form);
    case 'Converted':
      return { valid: true, errors: {} };
    default:
      return validateLeadForm(form);
  }
}

export function canVisitLeadStep(savedStage, targetStep) {
  const savedIdx = Math.max(0, LEAD_STAGES.indexOf(savedStage || 'New Lead'));
  const targetIdx = LEAD_STAGES.indexOf(targetStep);
  if (targetIdx < 0) return false;
  // Can open current step and any completed step — not future steps
  return targetIdx <= savedIdx;
}

export function formatLeadPhone(value = '') {
  return formatUsPhone(value);
}

export { isValidEmail, isValidUsPhone };
