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
  clientId: null,
  client: null,
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

/** Map linked Client record (or formData snapshot) into Form 110 identity fields. */
export function clientRecordToForm110Fields(client, formData = {}) {
  const ci = formData.clientInfo || {};
  const contact = formData.contactInfo || {};
  const c = client || {};
  const firstName = String(c.firstName || ci.firstName || '').trim();
  const lastName = String(c.lastName || ci.lastName || '').trim();
  const clientName = joinClientName(firstName, lastName)
    || String(c.fullName || ci.clientName || '').trim();
  const street = [c.streetAddress, c.aptSuite].filter(Boolean).join(', ');
  return {
    firstName,
    lastName,
    clientName,
    dob: c.dateOfBirth || ci.dob || '',
    sex: c.gender || ci.gender || '',
    address: street || contact.homeAddress || '',
    phone: c.phoneHome || c.phone || contact.homePhone || '',
    cellPhone: c.phone || contact.mobile || '',
    email: c.email || contact.email || '',
    city: c.city || contact.city || '',
    state: c.state || contact.state || '',
    zip: c.zipCode || contact.zip || '',
  };
}

/** Apply client identity onto Form 110 (always overwrite identity keys from client source). */
export function applyClientIdentityToForm110(formData = {}, client = null, assessmentDate = '', assessorName = '') {
  const forms = { ...(formData.forms || {}) };
  const f110 = { ...(forms['110'] || {}) };
  const identity = clientRecordToForm110Fields(client, formData);
  forms['110'] = {
    ...f110,
    ...identity,
    date: f110.date || assessmentDate || todayIso(),
    assessorPrintName: f110.assessorPrintName || assessorName || '',
    assessorDate: f110.assessorDate || assessmentDate || todayIso(),
  };
  return {
    ...formData,
    forms,
    clientInfo: normalizeClientInfo({
      ...(formData.clientInfo || {}),
      firstName: identity.firstName,
      lastName: identity.lastName,
      clientName: identity.clientName,
      dob: identity.dob,
      gender: identity.sex || formData.clientInfo?.gender || '',
    }),
    contactInfo: {
      ...(formData.contactInfo || {}),
      homeAddress: identity.address || formData.contactInfo?.homeAddress || '',
      city: identity.city || formData.contactInfo?.city || '',
      state: identity.state || formData.contactInfo?.state || '',
      zip: identity.zip || formData.contactInfo?.zip || '',
      homePhone: identity.phone || formData.contactInfo?.homePhone || '',
      mobile: identity.cellPhone || formData.contactInfo?.mobile || '',
      email: identity.email || formData.contactInfo?.email || '',
    },
  };
}

export function assessmentToForm(assessment) {
  if (!assessment) return { ...EMPTY_ASSESSMENT, assessmentDate: todayIso(), formData: buildEmptyFormData() };
  const empty = buildEmptyFormData();
  let formData = { ...empty, ...(assessment.formData || {}) };
  formData.forms = mergePacketForms(formData.forms || {});
  formData = syncClinicalFromPacket(formData);
  formData.clientInfo = normalizeClientInfo(formData.clientInfo);

  const assessorName = assessment.assessorName || '';
  const assessmentDate = assessment.assessmentDate || todayIso();

  // Prefer linked client record; otherwise keep formData / Form 110 snapshot.
  // Also seed assessor print name / date on Form 110 when blank.
  formData = applyClientIdentityToForm110(
    formData,
    assessment.client || null,
    assessmentDate,
    assessorName,
  );

  const savedMeds = Array.isArray(formData.medications) ? formData.medications : [];
  formData.medications = Array.from({ length: Math.max(6, savedMeds.length) }, (_, i) => ({
    ...emptyMed(),
    ...(savedMeds[i] || {}),
  }));
  return {
    assessorName,
    assessorTitle: assessment.assessorTitle || 'Care Assessment Specialist',
    assessorPhoto: assessment.assessorPhoto || '',
    assessmentDate,
    assessmentTypes: assessment.assessmentTypes || [],
    clientId: assessment.clientId || assessment.client?.id || null,
    client: assessment.client || null,
    clientPhoto: assessment.clientPhoto || assessment.client?.profilePic || assessment.client?.photo || '',
    formData,
  };
}
