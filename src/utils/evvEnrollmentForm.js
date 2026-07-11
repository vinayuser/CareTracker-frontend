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

export const evvEnrollmentToForm = (enrollment) => ({
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
  formData: {
    ...buildEmptyFormData(),
    ...(enrollment?.formData || {}),
  },
});

export const toggleArrayValue = (arr = [], value) => {
  const list = [...arr];
  const idx = list.indexOf(value);
  if (idx === -1) list.push(value);
  else list.splice(idx, 1);
  return list;
};
