export const EVV_ENROLLMENT_STATUSES = ['Pending', 'Submitted', 'Verified', 'Rejected'];

export const GENDERS = ['Male', 'Female', 'Other'];
export const RELATIONSHIPS = ['Self', 'Spouse', 'Parent', 'Child', 'Other'];
export const EVV_METHODS = [
  'Mobile App (Smartphone)',
  'Landline (Telephone)',
  'IVR (Interactive Voice Response)',
  'Web Portal (Computer / Tablet)',
  'Other',
];
export const SMARTPHONE_TYPES = ['iPhone (iOS)', 'Android'];
export const PHONE_TYPES = ['Home', 'Cell', 'Other'];

export const WIZARD_STEPS = [
  { id: 1, label: 'Client & Caregiver Info', description: 'Client, caregiver, and agency service details' },
  { id: 2, label: 'EVV Setup & Consent', description: 'Method preference, enrollment, authorization, and training' },
];

export const buildEmptyFormData = () => ({
  clientInfo: {
    clientFullName: '',
    dob: '',
    gender: '',
    address: '',
    aptSuite: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    preferredLanguage: '',
    clientId: '',
  },
  caregiverInfo: {
    isSelf: false,
    fullName: '',
    employeeId: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    aptSuite: '',
    city: '',
    state: '',
    zip: '',
    relationship: 'Self',
    relationshipOther: '',
  },
  serviceInfo: {
    agencyName: '',
    agencyPhone: '',
    evvVendor: '',
    medicaidProgram: '',
    assignedServices: '',
    planCode: '',
  },
  evvMethods: {
    methods: [],
    other: '',
  },
  mobileEnrollment: {
    smartphoneType: '',
    mobileNumber: '',
    email: '',
  },
  landlineEnrollment: {
    primaryPhone: '',
    phoneType: '',
    alternatePhone: '',
  },
  authorization: {
    clientSignature: '',
    clientDate: '',
    caregiverSignature: '',
    caregiverDate: '',
  },
  trainingAck: {
    caregiverSignature: '',
    date: '',
  },
  officeUse: {
    evvSystem: '',
    enrollmentDate: '',
    staffInitials: '',
    methodSetUpBy: '',
    verifiedBy: '',
    verificationDate: '',
    notes: '',
  },
});

export const toDateInputValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const evvEnrollmentToForm = (enrollment) => {
  const empty = buildEmptyFormData();
  const raw = enrollment?.formData || {};
  const formData = {
    ...empty,
    ...raw,
    clientInfo: {
      ...empty.clientInfo,
      ...(raw.clientInfo || {}),
      dob: toDateInputValue(raw.clientInfo?.dob ?? empty.clientInfo.dob),
    },
    caregiverInfo: {
      ...empty.caregiverInfo,
      ...(raw.caregiverInfo || {}),
      dob: toDateInputValue(raw.caregiverInfo?.dob ?? empty.caregiverInfo.dob),
    },
    serviceInfo: { ...empty.serviceInfo, ...(raw.serviceInfo || {}) },
    evvMethods: { ...empty.evvMethods, ...(raw.evvMethods || {}) },
    mobileEnrollment: { ...empty.mobileEnrollment, ...(raw.mobileEnrollment || {}) },
    landlineEnrollment: { ...empty.landlineEnrollment, ...(raw.landlineEnrollment || {}) },
    authorization: { ...empty.authorization, ...(raw.authorization || {}) },
    trainingAck: { ...empty.trainingAck, ...(raw.trainingAck || {}) },
    officeUse: { ...empty.officeUse, ...(raw.officeUse || {}) },
  };

  return {
    id: enrollment?.id || '',
    enrollmentCode: enrollment?.enrollmentCode || '',
    status: enrollment?.status || 'Pending',
    enrollmentDate: enrollment?.enrollmentDate || '',
    carePlanId: enrollment?.carePlanId || '',
    clientId: enrollment?.clientId || '',
    caregiverAccountId: enrollment?.caregiverAccountId || '',
    planCode: enrollment?.planCode || '',
    clientName: enrollment?.clientName || '',
    caregiverName: enrollment?.caregiverName || '',
    serviceAreas: enrollment?.serviceAreas || [],
    formData,
  };
};

export const toggleArrayValue = (arr = [], value) => {
  const list = [...arr];
  const idx = list.indexOf(value);
  if (idx === -1) list.push(value);
  else list.splice(idx, 1);
  return list;
};
