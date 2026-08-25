import {
  buildEmptyPacketForms,
  mergePacketForms,
  syncClinicalFromPacket,
} from './assessmentPacket';

export const ASSESSMENT_TYPES = [
  'Initial Assessment', 'Reassessment', 'Hospital Discharge', 'Annual Review', 'Change in Condition',
];

export const ASSESSMENT_STATUSES = ['Enquiry', 'Quoted', 'Accepted', 'Declined'];

/** Keys used when syncing clinical snapshot for quote / client / care-plan. */
const ADL_ITEMS = ['Bathing', 'Dressing', 'Grooming', 'Toileting', 'Transfers', 'Walking', 'Feeding', 'Continence'];
const IADL_ITEMS = ['Shopping', 'Meal Preparation', 'Laundry', 'Transportation', 'Housekeeping', 'Financial Management'];
const HOME_SAFETY_ITEMS = [
  'Smoke Detectors', 'Trip Hazards', 'Fire Extinguisher', 'Emergency Exit Plan',
  'Grab Bars', 'Pets', 'Working Telephone',
];

const emptyMed = () => ({ name: '', dosage: '', frequency: '', purpose: '', selfManaged: false });
const emptyAdls = () => Object.fromEntries(ADL_ITEMS.map((i) => [i, '']));

/** Clinical snapshot + 15-form assessment packet */
export const buildEmptyFormData = () => {
  const clinical = {
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
  };

  return syncClinicalFromPacket({
    ...clinical,
    packetVersion: 1,
    forms: buildEmptyPacketForms(),
  });
};

export const todayIso = () => new Date().toISOString().split('T')[0];

export const EMPTY_ASSESSMENT = {
  assessorName: '',
  assessorTitle: 'Care Assessment Specialist',
  assessorPhoto: '',
  assessmentDate: todayIso(),
  assessmentTypes: [],
  clientPhoto: '',
  formData: buildEmptyFormData(),
};

export function joinClientName(firstName = '', lastName = '') {
  return `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
}

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
  let formData = { ...empty, ...(assessment.formData || {}) };
  formData.forms = mergePacketForms(formData.forms || {});
  formData = syncClinicalFromPacket(formData);
  formData.clientInfo = normalizeClientInfo(formData.clientInfo);

  const f110 = formData.forms['110'] || {};
  if (!f110.clientName && formData.clientInfo?.clientName) {
    formData.forms['110'] = {
      ...f110,
      firstName: f110.firstName || formData.clientInfo.firstName || '',
      lastName: f110.lastName || formData.clientInfo.lastName || '',
      clientName: f110.clientName || formData.clientInfo.clientName || '',
      dob: f110.dob || formData.clientInfo.dob || '',
      sex: f110.sex || formData.clientInfo.gender || '',
      address: f110.address || formData.contactInfo?.homeAddress || '',
      phone: f110.phone || formData.contactInfo?.homePhone || '',
      cellPhone: f110.cellPhone || formData.contactInfo?.mobile || '',
      email: f110.email || formData.contactInfo?.email || '',
      city: f110.city || formData.contactInfo?.city || '',
      state: f110.state || formData.contactInfo?.state || '',
      zip: f110.zip || formData.contactInfo?.zip || '',
      date: f110.date || assessment.assessmentDate || todayIso(),
    };
  }

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
    clientPhoto: assessment.clientPhoto || assessment.client?.profilePic || assessment.client?.photo || '',
    formData,
  };
}
