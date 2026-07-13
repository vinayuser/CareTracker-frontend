export const GENDERS = ['Male', 'Female', 'Other'];
export const RISK_LEVELS = ['Low', 'Medium', 'High'];
export const REVIEW_FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Other'];

export const WIZARD_STEPS = [
  { id: 1, label: 'Client & Medical Info', description: 'Client details, medical info, goals, and supplementary items' },
  { id: 2, label: 'Care Needs & Signatures', description: 'Interventions, risk assessment, review, and signatures' },
];

export const CARE_NEED_AREAS = [
  {
    key: 'personalCare',
    label: 'Personal Care',
    icon: 'User',
    interventions: [
      { key: 'assistBathing', label: 'Assist with bathing/hygiene' },
      { key: 'assistDressing', label: 'Assist with dressing' },
      { key: 'oralCare', label: 'Oral care' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'nutrition',
    label: 'Nutrition',
    icon: 'Utensils',
    interventions: [
      { key: 'mealPreparation', label: 'Meal preparation' },
      { key: 'feedingAssistance', label: 'Feeding assistance' },
      { key: 'hydrationSupport', label: 'Hydration support' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'mobility',
    label: 'Mobility',
    icon: 'Footprints',
    interventions: [
      { key: 'transferAssistance', label: 'Transfer assistance' },
      { key: 'ambulation', label: 'Ambulation / Walking' },
      { key: 'rangeOfMotion', label: 'Range of motion exercises' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'medications',
    label: 'Medications',
    icon: 'Pill',
    interventions: [
      { key: 'medicationReminder', label: 'Medication reminder' },
      { key: 'medicationAdministration', label: 'Medication administration' },
      { key: 'monitorSideEffects', label: 'Monitor side effects' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'householdSupport',
    label: 'Household Support',
    icon: 'Home',
    interventions: [
      { key: 'lightHousekeeping', label: 'Light housekeeping' },
      { key: 'laundry', label: 'Laundry' },
      { key: 'errandsShopping', label: 'Errands / Shopping' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'emotionalWellbeing',
    label: 'Emotional Well-Being',
    icon: 'Heart',
    interventions: [
      { key: 'companionship', label: 'Companionship' },
      { key: 'emotionalSupport', label: 'Emotional support' },
      { key: 'engageActivities', label: 'Engage in activities' },
      { key: 'other', label: 'Other' },
    ],
  },
  {
    key: 'otherNeeds',
    label: 'Other Needs',
    icon: 'ClipboardList',
    interventions: [{ key: 'custom', label: 'Other' }],
  },
];

const emptyInterventions = (area) => {
  const base = {};
  area.interventions.forEach((i) => { base[i.key] = false; });
  base.otherText = '';
  return base;
};

export const buildEmptyCareNeed = (area) => ({
  areaKey: area.key,
  areaLabel: area.label,
  icon: area.icon,
  goalsOutcomes: '',
  interventions: emptyInterventions(area),
  frequency: '',
  responsibleStaff: '',
  responsibleStaffId: '',
  scheduleDays: [],
  startTime: '',
  endTime: '',
  graceMinutes: 15,
});

export const buildEmptyFormData = () => ({
  assessor: { name: '', title: '', phone: '', email: '', dateAssessed: '', photo: '' },
  clientInfo: {
    clientName: '', dob: '', address: '', city: '', state: '', zip: '',
    phone: '', email: '', primaryLanguage: '',
    clientId: '', gender: '', maritalStatus: '',
    emergencyContact: '', emergencyRelationship: '', emergencyPhone: '',
  },
  medicalInfo: {
    primaryDiagnosis: '', otherDiagnoses: '', allergies: '',
    physician: '', physicianPhone: '', specialInstructions: '',
  },
  clientGoals: ['', '', '', '', ''],
  supplementary: {
    advanceDirectives: null, dnrPolst: null, preferredHospital: '',
    householdMembers: '', preferredPharmacy: '', transportationNeeds: null,
    interpreterNeeded: null, healthInsurance: '', policyId: '',
    culturalSpiritual: '', otherNotes: '',
  },
  careNeeds: CARE_NEED_AREAS.map(buildEmptyCareNeed),
  riskAssessment: {
    fallRisk: '', skinRisk: '', elopementRisk: '', otherRisks: '', riskNotes: '',
  },
  carePlanReview: {
    frequencies: [], frequencyOther: '', nextReviewDate: '', reasonForReview: '',
  },
  authorization: { representativeName: '', signature: '', date: '' },
  signatures: {
    clientRep: { name: '', signature: '', date: '' },
    agencyStaff: { name: '', signature: '', date: '' },
    supervisor: { name: '', signature: '', date: '' },
  },
});

export const todayIso = () => new Date().toISOString().split('T')[0];

export const formatDisplayDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

export function clientToFormPatch(client) {
  if (!client) return {};
  return {
    clientInfo: {
      clientName: client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      dob: client.dateOfBirth || '',
      address: [client.streetAddress, client.aptSuite].filter(Boolean).join(' '),
      city: client.city || '',
      state: client.state || '',
      zip: client.zipCode || '',
      phone: client.phone || client.phoneHome || '',
      email: client.email || '',
      primaryLanguage: client.primaryLanguage || '',
      clientId: client.clientCode || '',
      gender: client.gender || '',
      maritalStatus: client.maritalStatus || '',
      emergencyContact: client.emergencyContactName || '',
      emergencyRelationship: client.emergencyContactRelationship || '',
      emergencyPhone: client.emergencyContactPhone || '',
    },
    medicalInfo: {
      primaryDiagnosis: client.primaryDiagnosis || client.medicalConditions || '',
      allergies: client.allergies || '',
      physician: client.physicianName || '',
      physicianPhone: client.physicianPhone || '',
    },
    supplementary: {
      preferredHospital: client.preferredHospital || '',
      preferredPharmacy: client.pharmacyName || '',
      interpreterNeeded: client.interpreterNeeded ?? null,
      healthInsurance: client.insuranceProvider || '',
      policyId: client.insuranceMemberId || '',
    },
  };
}

/** Merge patch into base; non-empty patch values win so assessment/client data fills blanks and updates. */
const mergeFilled = (base = {}, patch = {}) => {
  const out = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    out[key] = value;
  });
  return out;
};

export function carePlanToForm(plan, client = null) {
  const empty = buildEmptyFormData();
  if (!plan) {
    const patch = client ? clientToFormPatch(client) : {};
    return {
      clientId: '',
      version: '1.0',
      effectiveDate: formatDisplayDate(),
      reviewDate: formatDisplayDate(new Date(Date.now() + 30 * 86400000)),
      status: 'Active',
      formData: {
        ...empty,
        clientInfo: mergeFilled(empty.clientInfo, patch.clientInfo),
        medicalInfo: mergeFilled(empty.medicalInfo, patch.medicalInfo),
        supplementary: mergeFilled(empty.supplementary, patch.supplementary),
      },
    };
  }
  const fd = plan.formData || {};
  const merged = {
    ...empty,
    ...fd,
    clientInfo: { ...empty.clientInfo, ...(fd.clientInfo || {}) },
    medicalInfo: { ...empty.medicalInfo, ...(fd.medicalInfo || {}) },
    supplementary: { ...empty.supplementary, ...(fd.supplementary || {}) },
  };
  if (client) {
    const patch = clientToFormPatch(client);
    merged.clientInfo = mergeFilled(merged.clientInfo, patch.clientInfo);
    merged.medicalInfo = mergeFilled(merged.medicalInfo, patch.medicalInfo);
    merged.supplementary = mergeFilled(merged.supplementary, patch.supplementary);
  }
  return {
    clientId: plan.clientId || '',
    version: plan.version || '1.0',
    effectiveDate: plan.effectiveDate || formatDisplayDate(),
    reviewDate: plan.reviewDate || formatDisplayDate(new Date(Date.now() + 30 * 86400000)),
    status: plan.status || 'Active',
    planCode: plan.planCode || '',
    formData: merged,
  };
}

export const EMPTY_CARE_PLAN_FORM = carePlanToForm(null);
