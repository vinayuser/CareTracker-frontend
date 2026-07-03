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
    insuranceCard: false,
    photoId: false,
    medicareCard: false,
    medicaidCard: false,
    prescriptionCard: false,
    otherDocuments: false,
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

export function clientToInsurancePatch(client) {
  if (!client) return {};
  const types = client.insuranceProvider
    ? client.insuranceProvider.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    clientInfo: {
      clientFullName: client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      dob: client.dateOfBirth || '',
      gender: client.gender || '',
      address: [client.streetAddress, client.aptSuite].filter(Boolean).join(' '),
      city: client.city || '',
      state: client.state || '',
      zip: client.zipCode || '',
      phoneHome: client.phoneHome || '',
      phoneMobile: client.phone || '',
      email: client.email || '',
      maritalStatus: client.maritalStatus || '',
      preferredLanguage: client.preferredLanguage || '',
      emergencyContactName: client.emergencyContactName || '',
      emergencyRelationship: client.emergencyContactRelationship || '',
      emergencyPhone: client.emergencyContactPhone || '',
    },
    primaryInsurance: {
      types,
      companyName: client.insuranceProvider || '',
      memberId: client.insuranceMemberId || '',
      groupNumber: client.insuranceGroupNumber || '',
    },
  };
}

export function insuranceIntakeToForm(intake, client = null) {
  const empty = buildEmptyFormData();
  if (!intake) {
    const patch = client ? clientToInsurancePatch(client) : {};
    return {
      clientId: client?.id || '',
      intakeDate: formatDisplayDate(),
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
    requiredDocuments: { ...empty.requiredDocuments, ...(fd.requiredDocuments || {}) },
    officeUse: { ...empty.officeUse, ...(fd.officeUse || {}) },
  };
  if (client) {
    const patch = clientToInsurancePatch(client);
    merged.clientInfo = { ...merged.clientInfo, ...patch.clientInfo };
    if (!merged.primaryInsurance.companyName) {
      merged.primaryInsurance = { ...merged.primaryInsurance, ...patch.primaryInsurance };
    }
  }
  return {
    clientId: intake.clientId || '',
    intakeDate: intake.intakeDate || formatDisplayDate(),
    status: intake.status || 'Draft',
    intakeCode: intake.intakeCode || '',
    formData: merged,
  };
}

export const EMPTY_INSURANCE_INTAKE_FORM = insuranceIntakeToForm(null);
