import { formatUsPhone, isValidEmail, isValidUsPhone } from './agencyInformationValidation';
import { isValidZipLocation } from './leadFormValidation';

export const INSURANCE_INTAKE_STATUSES = ['Draft', 'Submitted', 'Verified'];

export const PRIMARY_INSURANCE_TYPES = [
  'Medicare',
  'Medicaid',
  'Private Insurance',
  'VA Benefits',
  'Long Term Care Insurance',
  'Other',
];

export const GENDERS = ['Male', 'Female', 'Other'];
export const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced'];
export const RELATIONSHIPS = ['Self', 'Spouse', 'Parent', 'Other'];
export const MEDICARE_TYPES = [
  'Original Medicare (Part A & B)',
  'Medicare Advantage (Part C)',
  'Part D Prescription Plan',
];
export const AUTH_STATUSES = ['Approved', 'Pending', 'Denied'];

export const REQUIRED_DOCUMENTS = [
  { key: 'insuranceCard', label: 'Insurance Card (Front & Back)', icon: 'CreditCard' },
  { key: 'photoId', label: 'Photo ID', icon: 'IdCard' },
  { key: 'medicareCard', label: 'Medicare Card (If Applicable)', icon: 'HeartPulse' },
  { key: 'medicaidCard', label: 'Medicaid Card (If Applicable)', icon: 'Users' },
  { key: 'prescriptionCard', label: 'Prescription Card (If Applicable)', icon: 'Pill' },
  { key: 'otherDocuments', label: 'Other Documents', icon: 'FileText' },
];

export const WIZARD_STEPS = [
  { id: 1, label: 'Client & Primary Insurance', description: 'Client information and primary insurance details' },
  { id: 2, label: 'Coverage & Authorization', description: 'Medicare, Medicaid, documents, and office use' },
];

export const buildEmptyFormData = () => ({
  clientInfo: {
    clientFullName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phoneHome: '',
    phoneMobile: '',
    email: '',
    maritalStatus: '',
    ssnLast4: '',
    preferredLanguage: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
  },
  primaryInsurance: {
    types: [],
    otherType: '',
    companyName: '',
    planName: '',
    memberId: '',
    groupNumber: '',
    policyHolderName: '',
    policyHolderRelationship: '',
    policyHolderRelationshipOther: '',
    policyHolderDob: '',
    effectiveDate: '',
    insurancePhone: '',
    claimsAddress: '',
  },
  secondaryInsurance: {
    companyName: '',
    memberId: '',
    groupNumber: '',
    policyHolderName: '',
    dob: '',
    relationship: '',
    relationshipOther: '',
  },
  prescriptionCoverage: {
    companyName: '',
    memberId: '',
    groupNumber: '',
    bin: '',
    pcn: '',
    phone: '',
    copayStructure: '',
  },
  medicare: {
    number: '',
    types: [],
    partAEffectiveDate: '',
    partBEffectiveDate: '',
    advantagePlanName: '',
    planIdNumber: '',
  },
  medicaid: {
    number: '',
    state: '',
    managedCarePlan: '',
    memberId: '',
    effectiveDate: '',
    caseWorkerName: '',
    caseWorkerPhone: '',
  },
  additionalCoverage: {
    vaBenefits: null,
    vaClaimNumber: '',
    longTermCare: null,
    ltcPolicyClaimNumber: '',
    ltcCompany: '',
  },
  authorization: {
    signature: '',
    printName: '',
    // Filled with today in insuranceIntakeToForm when empty
    date: '',
  },
  requiredDocuments: {
    insuranceCard: null,
    photoId: null,
    medicareCard: null,
    medicaidCard: null,
    prescriptionCard: null,
    otherDocuments: null,
  },
  officeUse: {
    verifiedBy: '',
    date: '',
    coverageConfirmed: null,
    notes: '',
    copay: '',
    deductible: '',
    coinsurance: '',
    authorizationRequired: null,
    authStatus: '',
    nextReviewDate: '',
  },
});

export const formatDisplayDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

export const toDateInputValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  // MM/DD/YYYY
  if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [mm, dd, yyyy] = value.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const todayDateInputValue = () => toDateInputValue(new Date());

export const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

/** Format as US phone while typing: (555) 123-4567 */
export const formatPhoneInput = (value = '') => formatUsPhone(value);

export const isValidPhone = (value = '') => isValidUsPhone(value);

export const isValidDateInput = (value = '') => {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const d = new Date(`${raw}T12:00:00`);
  return !Number.isNaN(d.getTime());
};

const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const requireText = (errors, key, value, label) => {
  if (!String(value || '').trim()) errors[key] = `${label} is required`;
};

const optionalPhone = (errors, key, value) => {
  const raw = String(value || '').trim();
  if (!raw) return;
  if (!isValidPhone(raw)) errors[key] = 'Enter a valid US phone: (555) 123-4567';
};

const optionalEmail = (errors, key, value) => {
  const raw = String(value || '').trim();
  if (!raw) return;
  if (!isValidEmail(raw)) errors[key] = 'Enter a valid email address';
};

const optionalDate = (errors, key, value, { notFuture = false, notPastBirth = false } = {}) => {
  const raw = String(value || '').trim();
  if (!raw) return;
  if (!isValidDateInput(raw)) {
    errors[key] = 'Enter a valid date';
    return;
  }
  if (notFuture && raw > todayIso()) errors[key] = 'Date cannot be in the future';
  if (notPastBirth && raw > todayIso()) errors[key] = 'Date of birth cannot be in the future';
};

const optionalZip = (errors, key, value) => {
  const raw = String(value || '').trim();
  if (!raw) return;
  if (!isValidZipLocation(raw)) errors[key] = 'Enter a valid ZIP (e.g. 78701)';
};

const optionalSsnLast4 = (errors, key, value) => {
  const raw = String(value || '').trim();
  if (!raw) return;
  if (!/^\d{4}$/.test(raw)) errors[key] = 'Enter the last 4 digits of the SSN';
};

const hasInk = (value) => Boolean(value && String(value).startsWith('data:image'));

/** Step 1: client info + primary insurance required fields and typed-field checks. */
export function validateInsuranceIntakeStepOne(form, { clientInfoLocked = false } = {}) {
  const errors = {};
  const ci = form?.formData?.clientInfo || {};
  const pri = form?.formData?.primaryInsurance || {};
  const sec = form?.formData?.secondaryInsurance || {};
  const rx = form?.formData?.prescriptionCoverage || {};

  if (!isValidDateInput(form?.intakeDate)) {
    errors.intakeDate = 'Intake date is required';
  } else if (form.intakeDate > todayIso()) {
    errors.intakeDate = 'Intake date cannot be in the future';
  }

  if (!clientInfoLocked) {
    requireText(errors, 'clientFullName', ci.clientFullName, 'Client full name');
    if (!isValidDateInput(ci.dob)) errors.dob = 'Date of birth is required';
    else optionalDate(errors, 'dob', ci.dob, { notPastBirth: true });
    requireText(errors, 'gender', ci.gender, 'Gender');
    requireText(errors, 'address', ci.address, 'Address');
    requireText(errors, 'city', ci.city, 'City');
    requireText(errors, 'state', ci.state, 'State');
    if (!String(ci.zip || '').trim()) errors.zip = 'ZIP is required';
    else optionalZip(errors, 'zip', ci.zip);
    if (!String(ci.email || '').trim()) errors.email = 'Email is required';
    else optionalEmail(errors, 'email', ci.email);
  } else {
    optionalDate(errors, 'dob', ci.dob, { notPastBirth: true });
    optionalZip(errors, 'zip', ci.zip);
    optionalEmail(errors, 'email', ci.email);
  }

  if (!String(ci.phoneMobile || '').trim()) {
    errors.phoneMobile = 'Mobile phone is required';
  } else if (!isValidPhone(ci.phoneMobile)) {
    errors.phoneMobile = 'Enter a valid US phone: (555) 123-4567';
  }
  optionalPhone(errors, 'phoneHome', ci.phoneHome);
  optionalPhone(errors, 'emergencyPhone', ci.emergencyPhone);
  optionalSsnLast4(errors, 'ssnLast4', ci.ssnLast4);

  if (!Array.isArray(pri.types) || pri.types.length === 0) {
    errors.insuranceTypes = 'Select at least one insurance type';
  }
  if (pri.types?.includes('Other')) {
    requireText(errors, 'otherType', pri.otherType, 'Other insurance type');
  }
  requireText(errors, 'companyName', pri.companyName, 'Insurance company name');
  requireText(errors, 'memberId', pri.memberId, 'Member ID / Policy #');
  requireText(errors, 'policyHolderRelationship', pri.policyHolderRelationship, 'Relationship to client');
  if (pri.policyHolderRelationship === 'Other') {
    requireText(errors, 'policyHolderRelationshipOther', pri.policyHolderRelationshipOther, 'Relationship');
  }
  optionalPhone(errors, 'insurancePhone', pri.insurancePhone);
  optionalDate(errors, 'policyHolderDob', pri.policyHolderDob, { notPastBirth: true });
  optionalDate(errors, 'effectiveDate', pri.effectiveDate);

  optionalDate(errors, 'secondaryDob', sec.dob, { notPastBirth: true });
  optionalPhone(errors, 'rxPhone', rx.phone);

  return errors;
}

export function validateInsuranceIntakeStepTwo(form) {
  const errors = {};
  const auth = form?.formData?.authorization || {};
  const pri = form?.formData?.primaryInsurance || {};
  const rx = form?.formData?.prescriptionCoverage || {};
  const med = form?.formData?.medicare || {};
  const mcd = form?.formData?.medicaid || {};
  const add = form?.formData?.additionalCoverage || {};
  const docs = form?.formData?.requiredDocuments || {};

  requireText(errors, 'authPrintName', auth.printName, 'Print name');
  if (!isValidDateInput(auth.date)) {
    errors.authDate = 'Authorization date is required';
  } else if (auth.date > todayIso()) {
    errors.authDate = 'Authorization date cannot be in the future';
  }
  if (!hasInk(auth.signature)) {
    errors.authSignature = 'Signature is required';
  }

  optionalPhone(errors, 'insurancePhone', pri.insurancePhone);
  optionalPhone(errors, 'rxPhone', rx.phone);
  optionalPhone(errors, 'caseWorkerPhone', mcd.caseWorkerPhone);
  optionalDate(errors, 'partAEffectiveDate', med.partAEffectiveDate);
  optionalDate(errors, 'partBEffectiveDate', med.partBEffectiveDate);
  optionalDate(errors, 'medicaidEffectiveDate', mcd.effectiveDate);

  if (add.vaBenefits === true) {
    requireText(errors, 'vaClaimNumber', add.vaClaimNumber, 'VA claim number');
  }
  if (add.longTermCare === true) {
    requireText(errors, 'ltcPolicyClaimNumber', add.ltcPolicyClaimNumber, 'Policy / claim number');
    requireText(errors, 'ltcCompany', add.ltcCompany, 'Insurance company');
  }

  const status = String(form?.status || 'Draft');
  if (status !== 'Draft') {
    if (!hasUploadedDocument(docs.insuranceCard)) {
      errors.docInsuranceCard = 'Insurance card is required';
    }
    if (!hasUploadedDocument(docs.photoId)) {
      errors.docPhotoId = 'Photo ID is required';
    }
  }

  return errors;
}

export function clientToInsurancePatch(client) {
  if (!client) return {};
  const types = client.insuranceProvider
    ? client.insuranceProvider.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const clientFullName = client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim();
  const dob = toDateInputValue(client.dateOfBirth || '');
  return {
    clientInfo: {
      clientFullName,
      dob,
      gender: client.gender || '',
      address: [client.streetAddress, client.aptSuite].filter(Boolean).join(' '),
      city: client.city || '',
      state: client.state || '',
      zip: client.zipCode || '',
      phoneHome: formatPhoneInput(client.phoneHome || ''),
      phoneMobile: formatPhoneInput(client.phone || ''),
      email: client.email || '',
      maritalStatus: client.maritalStatus || '',
      preferredLanguage: client.preferredLanguage || '',
      emergencyContactName: client.emergencyContactName || '',
      emergencyRelationship: client.emergencyContactRelationship || '',
      emergencyPhone: formatPhoneInput(client.emergencyContactPhone || ''),
    },
    primaryInsurance: {
      types,
      companyName: client.insuranceProvider || '',
      memberId: client.insuranceMemberId || '',
      groupNumber: client.insuranceGroupNumber || '',
      policyHolderName: clientFullName,
      policyHolderDob: dob,
      policyHolderRelationship: clientFullName ? 'Self' : '',
    },
  };
}

/** Prefill insurance intake from assessment form (address / contact already collected there). */
export function assessmentToInsurancePatch(assessment) {
  if (!assessment) return {};
  const fd = assessment.formData || {};
  const ci = fd.clientInfo || {};
  const contact = fd.contactInfo || {};
  const emergency = fd.emergencyInfo || {};
  const insurance = fd.insurance || {};
  const types = Array.isArray(insurance.types) ? insurance.types.filter(Boolean) : [];
  const clientFullName = ci.clientName || assessment.clientName || '';
  const dob = toDateInputValue(ci.dob || '');

  return {
    clientInfo: {
      clientFullName,
      dob,
      gender: ci.gender || '',
      address: contact.homeAddress || '',
      city: contact.city || '',
      state: contact.state || '',
      zip: contact.zip || '',
      phoneHome: formatPhoneInput(contact.homePhone || ''),
      phoneMobile: formatPhoneInput(contact.mobile || assessment.clientPhone || ''),
      email: contact.email || assessment.clientEmail || '',
      maritalStatus: ci.maritalStatus || '',
      preferredLanguage: ci.primaryLanguage || '',
      emergencyContactName: emergency.primaryName || '',
      emergencyRelationship: emergency.primaryRelationship || '',
      emergencyPhone: formatPhoneInput(emergency.primaryPhone || ''),
    },
    primaryInsurance: {
      types,
      companyName: types.length ? types.join(', ') : (insurance.otherType || ''),
      memberId: insurance.policyNumber || '',
      groupNumber: insurance.authorizationNumber || '',
      policyHolderName: clientFullName,
      policyHolderDob: dob,
      policyHolderRelationship: clientFullName ? 'Self' : '',
    },
  };
}

const filledEntries = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, v]) => {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim() !== '';
  }),
);

/** Client base + assessment overrides (assessment wins for address/contact/insurance when present). */
export function mergeInsurancePrefill(client, assessment) {
  const fromClient = clientToInsurancePatch(client);
  const fromAssessment = assessmentToInsurancePatch(assessment);
  return {
    clientInfo: {
      ...(fromClient.clientInfo || {}),
      ...filledEntries(fromAssessment.clientInfo),
    },
    primaryInsurance: {
      ...(fromClient.primaryInsurance || {}),
      ...filledEntries(fromAssessment.primaryInsurance),
    },
  };
}

function normalizeDocumentEntry(value) {
  if (!value || value === true || value === false) return null;
  if (typeof value !== 'object') return null;
  if (!value.path && !value.url) return null;
  return {
    path: value.path || '',
    originalName: value.originalName || '',
    mimeType: value.mimeType || '',
    size: value.size || 0,
    uploadedAt: value.uploadedAt || null,
    url: value.url || '',
  };
}

export function normalizeRequiredDocuments(docs = {}) {
  const empty = buildEmptyFormData().requiredDocuments;
  return Object.fromEntries(
    Object.keys(empty).map((key) => [key, normalizeDocumentEntry(docs?.[key])]),
  );
}

export function hasUploadedDocument(entry) {
  return Boolean(entry && (entry.path || entry.url || entry.originalName));
}

export function insuranceIntakeToForm(intake, client = null) {
  const empty = buildEmptyFormData();
  if (!intake) {
    const patch = client ? clientToInsurancePatch(client) : {};
    return {
      clientId: client?.id || '',
      intakeDate: todayDateInputValue(),
      status: 'Draft',
      formData: {
        ...empty,
        clientInfo: { ...empty.clientInfo, ...patch.clientInfo },
        primaryInsurance: { ...empty.primaryInsurance, ...patch.primaryInsurance },
      },
    };
  }
  const fd = intake.formData || {};
  const merged = {
    clientInfo: { ...empty.clientInfo, ...(fd.clientInfo || {}) },
    primaryInsurance: { ...empty.primaryInsurance, ...(fd.primaryInsurance || {}) },
    secondaryInsurance: { ...empty.secondaryInsurance, ...(fd.secondaryInsurance || {}) },
    prescriptionCoverage: { ...empty.prescriptionCoverage, ...(fd.prescriptionCoverage || {}) },
    medicare: { ...empty.medicare, ...(fd.medicare || {}) },
    medicaid: { ...empty.medicaid, ...(fd.medicaid || {}) },
    additionalCoverage: { ...empty.additionalCoverage, ...(fd.additionalCoverage || {}) },
    authorization: { ...empty.authorization, ...(fd.authorization || {}) },
    requiredDocuments: normalizeRequiredDocuments({
      ...empty.requiredDocuments,
      ...(fd.requiredDocuments || {}),
    }),
    officeUse: { ...empty.officeUse, ...(fd.officeUse || {}) },
  };

  merged.clientInfo.dob = toDateInputValue(merged.clientInfo.dob);
  merged.clientInfo.phoneHome = formatPhoneInput(merged.clientInfo.phoneHome);
  merged.clientInfo.phoneMobile = formatPhoneInput(merged.clientInfo.phoneMobile);
  merged.clientInfo.emergencyPhone = formatPhoneInput(merged.clientInfo.emergencyPhone);
  merged.primaryInsurance.policyHolderDob = toDateInputValue(merged.primaryInsurance.policyHolderDob);
  merged.primaryInsurance.effectiveDate = toDateInputValue(merged.primaryInsurance.effectiveDate);
  merged.primaryInsurance.insurancePhone = formatPhoneInput(merged.primaryInsurance.insurancePhone);
  merged.secondaryInsurance.dob = toDateInputValue(merged.secondaryInsurance.dob);
  merged.prescriptionCoverage.phone = formatPhoneInput(merged.prescriptionCoverage.phone);
  merged.medicare.partAEffectiveDate = toDateInputValue(merged.medicare.partAEffectiveDate);
  merged.medicare.partBEffectiveDate = toDateInputValue(merged.medicare.partBEffectiveDate);
  merged.medicaid.effectiveDate = toDateInputValue(merged.medicaid.effectiveDate);
  merged.medicaid.caseWorkerPhone = formatPhoneInput(merged.medicaid.caseWorkerPhone);
  merged.authorization.date = toDateInputValue(merged.authorization.date) || todayDateInputValue();
  merged.officeUse.date = toDateInputValue(merged.officeUse.date);
  merged.officeUse.nextReviewDate = toDateInputValue(merged.officeUse.nextReviewDate);

  if (client) {
    const patch = clientToInsurancePatch(client);
    merged.clientInfo = { ...merged.clientInfo, ...patch.clientInfo };
    const pri = merged.primaryInsurance;
    merged.primaryInsurance = {
      ...pri,
      ...(!pri.companyName ? {
        types: patch.primaryInsurance.types,
        companyName: patch.primaryInsurance.companyName,
        memberId: patch.primaryInsurance.memberId,
        groupNumber: patch.primaryInsurance.groupNumber,
      } : {}),
      policyHolderName: pri.policyHolderName || patch.primaryInsurance.policyHolderName,
      policyHolderDob: pri.policyHolderDob || patch.primaryInsurance.policyHolderDob,
      policyHolderRelationship: pri.policyHolderRelationship || patch.primaryInsurance.policyHolderRelationship,
    };
  }
  return {
    clientId: intake.clientId || '',
    intakeDate: toDateInputValue(intake.intakeDate) || todayDateInputValue(),
    status: intake.status || 'Draft',
    intakeCode: intake.intakeCode || '',
    formData: merged,
  };
}

export const EMPTY_INSURANCE_INTAKE_FORM = insuranceIntakeToForm(null);
