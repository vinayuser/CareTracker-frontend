import { CLIENT_STATUSES } from '../constants/clientIntakeOptions';

export const todayIso = () => new Date().toISOString().split('T')[0];

export const EMPTY_CLIENT_FORM = {
  intakeDate: todayIso(),
  intakeId: '',
  firstName: '',
  lastName: '',
  preferredName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  ssnLast4: '',
  streetAddress: '',
  aptSuite: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  phone: '',
  phoneHome: '',
  email: '',
  preferredLanguage: '',
  ethnicity: '',
  race: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  alternateContactName: '',
  alternateContactRelationship: '',
  alternateContactPhone: '',
  physicianName: '',
  physicianPhone: '',
  lastVisitDate: '',
  pharmacyName: '',
  pharmacyPhone: '',
  preferredHospital: '',
  insuranceProvider: '',
  insuranceMemberId: '',
  insuranceGroupNumber: '',
  medicalConditions: '',
  primaryDiagnosis: '',
  allergies: '',
  currentMedications: '',
  specialDiet: '',
  mobility: '',
  livingArrangements: [],
  homeAccessibility: [],
  residenceType: '',
  assistiveDevices: [],
  hasPets: false,
  petsDescription: '',
  fallHistory: false,
  fallHistoryDescription: '',
  serviceTypes: [],
  mobilityAssistanceNeeded: false,
  mobilityAssistanceDescription: '',
  personalCareAssistanceNeeded: false,
  personalCareAssistanceDescription: '',
  careFrequency: '',
  preferredDays: [],
  preferredTimes: [],
  careNotes: '',
  paymentResponsibility: '',
  paymentResponsibilityOther: '',
  billingStreetAddress: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
  paymentMethods: [],
  authorizationSignature: '',
  authorizationDate: '',
  authorizationPrintedName: '',
  authorizationRelationship: '',
  intakeCompletedBy: '',
  intakeCompletedDate: '',
  assignedTo: '',
  admissionDate: '',
  carePlanStartDate: '',
  status: 'Pending',
  notes: '',
};

export function clientToForm(client) {
  if (!client) return { ...EMPTY_CLIENT_FORM, intakeDate: todayIso() };

  const form = { ...EMPTY_CLIENT_FORM };
  Object.keys(EMPTY_CLIENT_FORM).forEach((key) => {
    const value = client[key];
    if (Array.isArray(EMPTY_CLIENT_FORM[key])) {
      form[key] = Array.isArray(value) ? value : [];
    } else if (typeof EMPTY_CLIENT_FORM[key] === 'boolean') {
      form[key] = Boolean(value);
    } else {
      form[key] = value ?? EMPTY_CLIENT_FORM[key];
    }
  });

  if (!form.medicalConditions && client.primaryDiagnosis) {
    form.medicalConditions = client.primaryDiagnosis;
  }
  if (!form.livingArrangements.length && client.livingArrangement) {
    form.livingArrangements = client.livingArrangement.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return form;
}
