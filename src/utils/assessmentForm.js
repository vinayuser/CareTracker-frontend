export const ASSESSMENT_TYPES = [
  'Initial Assessment', 'Reassessment', 'Hospital Discharge', 'Annual Review', 'Change in Condition',
];

export const ASSESSMENT_STATUSES = ['Enquiry', 'Quoted', 'Accepted', 'Declined'];

export const ASSESSMENT_STEPS = [
  { id: 1, label: 'Intake & Medical', description: 'Client info, contacts, medical history, medications' },
  { id: 2, label: 'Functional & Care Plan', description: 'ADLs, mobility, goals, services, schedule, signatures' },
];

export const GENDERS = ['Male', 'Female', 'Other'];
export const MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Divorced'];
export const CONTACT_METHODS = ['Phone', 'Text', 'Email'];
export const INSURANCE_TYPES = ['Medicare', 'Medicaid', 'VA', 'Private Insurance', 'Long Term Care', 'Private Pay'];
export const MEDICAL_HISTORY_ITEMS = [
  'Diabetes', 'Stroke', 'Dementia', "Alzheimer's", "Parkinson's", 'COPD', 'CHF', 'Cancer',
  'Arthritis', 'Hypertension', 'Kidney Disease', 'Liver Disease', 'Anxiety', 'Depression',
  'Fall History', 'Seizures', 'Vision Impairment', 'Hearing Impairment',
];
export const ALLERGY_TYPES = ['Medication', 'Food', 'Environmental', 'Latex', 'None'];
export const ADL_ITEMS = ['Bathing', 'Dressing', 'Grooming', 'Toileting', 'Transfers', 'Walking', 'Feeding', 'Continence'];
export const ADL_SCORES = ['0', '1', '2', '3', '4'];
export const ADL_SCORE_LABELS = { 0: 'Independent', 1: 'Supervision', 2: 'Limited', 3: 'Extensive', 4: 'Total' };
export const IADL_ITEMS = ['Shopping', 'Meal Preparation', 'Laundry', 'Transportation', 'Housekeeping', 'Financial Management'];
export const AMBULATION_TYPES = ['Independently', 'Cane', 'Walker', 'Wheelchair', 'Bedbound'];
export const TRANSFER_TYPES = ['None', 'One Person', 'Two Person', 'Hoyer Lift'];
export const ORIENTATION_LEVELS = ['x1', 'x2', 'x3', 'x4'];
export const MEMORY_LEVELS = ['Good', 'Fair', 'Poor'];
export const DECISION_LEVELS = ['Independent', 'Needs Assistance'];
export const DIET_TYPES = ['Regular', 'Diabetic', 'Low Sodium', 'Renal', 'Pureed', 'Thickened Liquids'];
export const HOME_SAFETY_ITEMS = [
  'Smoke Detectors', 'Trip Hazards', 'Fire Extinguisher', 'Emergency Exit Plan',
  'Grab Bars', 'Pets', 'Working Telephone',
];
export const CLIENT_GOALS = [
  'Remain at Home', 'Prevent Falls', 'Medication Compliance', 'Increase Mobility',
  'Improve Nutrition', 'Socialization', 'Reduce Hospitalizations',
];
export const REQUESTED_SERVICES = [
  'Personal Care', 'Bathing', 'Dressing', 'Grooming', 'Toileting', 'Meal Preparation',
  'Laundry', 'Light Housekeeping', 'Shopping', 'Transportation', 'Medication Reminder',
  'Companionship', 'Dementia Care', 'Respite Care', 'Overnight Care', 'Live-In Care',
];
export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const RISK_LEVELS = ['Low', 'Moderate', 'High'];

const emptyMed = () => ({ name: '', dosage: '', frequency: '', purpose: '', selfManaged: false });
const emptyAdls = () => Object.fromEntries(ADL_ITEMS.map((i) => [i, '']));

export const buildEmptyFormData = () => ({
  clientInfo: {
    clientName: '', dob: '', age: '', gender: '', ssn: '', primaryLanguage: '', religion: '',
    height: '', weight: '', interpreterNeeded: false, maritalStatus: '',
    primaryDiagnosis: '', secondaryDiagnoses: '',
  },
  contactInfo: {
    homeAddress: '', city: '', state: '', zip: '', homePhone: '', mobile: '', email: '',
    preferredContactMethods: [],
  },
  responsibleParty: {
    name: '', relationship: '', phone: '', email: '',
    powerOfAttorney: false, medicalPoa: false, guardian: false,
  },
  physicianInfo: {
    primaryPhysician: '', primaryPhysicianPhone: '', specialists: '',
    preferredHospital: '', pharmacy: '', pharmacyPhone: '',
  },
  insurance: { types: [], policyNumber: '', authorizationNumber: '', hoursAuthorized: '', startDate: '' },
  emergencyInfo: {
    primaryName: '', primaryRelationship: '', primaryPhone: '',
    backupName: '', backupRelationship: '', backupPhone: '',
  },
  medicalHistory: [],
  allergies: { types: [], details: '' },
  medications: Array.from({ length: 6 }, emptyMed),
  adls: emptyAdls(),
  adlComments: '',
  iadls: Object.fromEntries(IADL_ITEMS.map((i) => [i, 'Independent'])),
  medicationReminder: 'Not Needed',
  mobility: { ambulation: [], transferAssistance: [], fallHistory: false, fallCount: '' },
  cognitiveStatus: {
    orientation: '', memory: '', decisionMaking: '', confusion: false, wandering: false, behaviorConcerns: '',
  },
  homeSafety: Object.fromEntries(HOME_SAFETY_ITEMS.map((i) => [i, false])),
  nutrition: { dietTypes: [], weightLoss: false, mealAssistance: false, fluidRestrictions: false },
  painAssessment: { painToday: false, painScore: '', location: '', painMedication: '' },
  mentalHealth: { depression: false, anxiety: false, behavioralConcerns: '' },
  clientGoals: [],
  requestedServices: [],
  schedule: { daysNeeded: [], preferredStart: '', preferredEnd: '' },
  coordinatorNotes: '',
  carePlanSummary: {
    primaryNeeds: '', recommendedWeeklyHours: '', startOfCareDate: '', riskLevel: '',
  },
  signatures: {
    clientSignature: '', clientDate: '',
    responsiblePartySignature: '', responsiblePartyDate: '',
    coordinatorSignature: '', coordinatorDate: '',
    rnSignature: '', rnDate: '',
  },
});

export const todayIso = () => new Date().toISOString().split('T')[0];

export const EMPTY_ASSESSMENT = {
  assessorName: '',
  assessmentDate: todayIso(),
  assessmentTypes: [],
  formData: buildEmptyFormData(),
};

export function assessmentToForm(assessment) {
  if (!assessment) return { ...EMPTY_ASSESSMENT, assessmentDate: todayIso(), formData: buildEmptyFormData() };
  return {
    assessorName: assessment.assessorName || '',
    assessmentDate: assessment.assessmentDate || todayIso(),
    assessmentTypes: assessment.assessmentTypes || [],
    formData: { ...buildEmptyFormData(), ...assessment.formData },
  };
}
