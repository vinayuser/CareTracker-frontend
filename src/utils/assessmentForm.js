export const ASSESSMENT_TYPES = [
  'Initial Assessment', 'Reassessment', 'Hospital Discharge', 'Annual Review', 'Change in Condition',
];

export const ASSESSMENT_STATUSES = ['Enquiry', 'Quoted', 'Accepted', 'Declined'];

/** Age in full years from YYYY-MM-DD DOB (calendar date). */
export function ageFromDob(dob) {
  if (!dob) return '';
  const birth = new Date(`${dob}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : '';
}

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
    firstName: '', lastName: '', clientName: '', dob: '', age: '', gender: '', ssn: '', primaryLanguage: '', religion: '',
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
  medicalHistoryOther: '',
  allergies: { types: [], details: '' },
  medications: Array.from({ length: 6 }, emptyMed),
  adls: emptyAdls(),
  adlComments: '',
  iadls: {
    ...Object.fromEntries(IADL_ITEMS.filter((i) => i !== 'Financial Management').map((i) => [i, 'Independent'])),
    'Financial Management': 'Not Needed',
  },
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
  clientGoalsOther: '',
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
  assessorTitle: 'Care Assessment Specialist',
  assessorPhoto: '',
  assessmentDate: todayIso(),
  assessmentTypes: [],
  formData: buildEmptyFormData(),
};

/** Join first + last for list/search display */
export function joinClientName(firstName = '', lastName = '') {
  return `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
}

/** Normalize legacy single clientName into first/last when loading */
export function normalizeClientInfo(clientInfo = {}) {
  const empty = buildEmptyFormData().clientInfo;
  const ci = { ...empty, ...(clientInfo || {}) };
  let firstName = String(ci.firstName || '').trim();
  let lastName = String(ci.lastName || '').trim();
  if (!firstName && !lastName && ci.clientName) {
    const parts = String(ci.clientName).trim().split(/\s+/).filter(Boolean);
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  }
  const clientName = joinClientName(firstName, lastName) || String(ci.clientName || '').trim();
  return { ...ci, firstName, lastName, clientName };
}

export function assessmentToForm(assessment) {
  if (!assessment) return { ...EMPTY_ASSESSMENT, assessmentDate: todayIso(), formData: buildEmptyFormData() };
  const empty = buildEmptyFormData();
  const formData = { ...empty, ...(assessment.formData || {}) };
  formData.clientInfo = normalizeClientInfo(formData.clientInfo);
  // Lead-created assessments often store medications: [] — restore editable rows
  const savedMeds = Array.isArray(formData.medications) ? formData.medications : [];
  formData.medications = Array.from({ length: Math.max(6, savedMeds.length) }, (_, i) => ({
    ...emptyMed(),
    ...(savedMeds[i] || {}),
  }));
  return {
    assessorName: assessment.assessorName || '',
    assessorTitle: assessment.assessorTitle || 'Care Assessment Specialist',
    assessorPhoto: assessment.assessorPhoto || '',
    assessmentDate: assessment.assessmentDate || todayIso(),
    assessmentTypes: assessment.assessmentTypes || [],
    formData,
  };
}
