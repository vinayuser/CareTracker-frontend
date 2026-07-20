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

export const formatPhoneInput = (value = '') => digitsOnly(value).slice(0, 15);

export const isValidPhone = (value = '') => {
  const digits = digitsOnly(value);
  return digits.length >= 10 && digits.length <= 15;
};

export const isValidDateInput = (value = '') => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim());

/** Step 1 required: intake date + at least one client phone (and DOB when editable). */
export function validateInsuranceIntakeStepOne(form, { clientInfoLocked = false } = {}) {
  const errors = {};
  const ci = form?.formData?.clientInfo || {};

  if (!isValidDateInput(form?.intakeDate)) {
    errors.intakeDate = 'Intake date is required';
  }

  if (!clientInfoLocked && !isValidDateInput(ci.dob)) {
    errors.dob = 'Date of birth is required';
  }

  // Phones are always editable — require a valid mobile or home number
  const hasPhone = isValidPhone(ci.phoneMobile) || isValidPhone(ci.phoneHome);
  if (!hasPhone) {
    errors.phoneMobile = 'Enter a valid phone number (at least 10 digits)';
  }
  if (ci.phoneHome && !isValidPhone(ci.phoneHome)) {
    errors.phoneHome = 'Enter a valid phone number (at least 10 digits)';
  }
  if (ci.phoneMobile && !isValidPhone(ci.phoneMobile)) {
    errors.phoneMobile = 'Enter a valid phone number (at least 10 digits)';
  }
  if (ci.emergencyPhone && !isValidPhone(ci.emergencyPhone)) {
    errors.emergencyPhone = 'Enter a valid phone number (at least 10 digits)';
  }

  return errors;
}

export function validateInsuranceIntakeStepTwo(form) {
  const errors = {};
  const auth = form?.formData?.authorization || {};
  const pri = form?.formData?.primaryInsurance || {};
  const rx = form?.formData?.prescriptionCoverage || {};
  const mcd = form?.formData?.medicaid || {};

  if (!isValidDateInput(auth.date)) {
    errors.authDate = 'Authorization date is required';
  }
  if (pri.insurancePhone && !isValidPhone(pri.insurancePhone)) {
    errors.insurancePhone = 'Enter a valid phone number (at least 10 digits)';
  }
  if (rx.phone && !isValidPhone(rx.phone)) {
    errors.rxPhone = 'Enter a valid phone number (at least 10 digits)';
  }
  if (mcd.caseWorkerPhone && !isValidPhone(mcd.caseWorkerPhone)) {
    errors.caseWorkerPhone = 'Enter a valid phone number (at least 10 digits)';
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
  merged.authorization.date = toDateInputValue(merged.authorization.date);
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
