/**
 * Client assessment packet — 15 Mastercare TX forms (document number order).
 * Fillable UI + print layouts. Quote / care-plan flow still uses synced clinical fields.
 */

/** Full registry (keep intact so we can re-enable forms later). */
const ASSESSMENT_PACKET_FORMS_ALL = [
  { code: '110', title: 'Physical Assessment & Information', short: 'Physical Assessment', description: 'Clinical assessment, ADLs, vitals, history' },
  { code: '324', title: 'What Personal Assistants May NOT Do', short: 'PA May Not Do', description: 'Scope of practice acknowledgement' },
  { code: '325', title: 'Participant Agreement Release', short: 'Participant Release', description: 'Property & household use release' },
  { code: '350', title: 'Client Handbook Acknowledgement', short: 'Handbook', description: 'Receipt of client handbook' },
  { code: '400', title: 'Care Instructions', short: 'Care Instructions', description: 'Task checklist & frequency' },
  { code: '410', title: 'Care Plan Acknowledgement', short: 'Care Plan Ack', description: 'Service plan acknowledgement' },
  { code: '610', title: 'Client Concerns & Grievance', short: 'Grievance', description: 'Grievance process acknowledgement' },
  { code: '790', title: 'Case Notes', short: 'Case Notes', description: 'Visit / case notes log' },
  { code: '800', title: 'Discrimination Notice', short: 'Nondiscrimination', description: 'Nondiscrimination notice acknowledgement' },
  { code: '1009', title: 'Consent for Homecare Services', short: 'Consent for Services', description: 'Services agreement & consents' },
  { code: '1081', title: 'Consent to Release / Obtain Information', short: 'Release of Info', description: 'HIPAA authorization to release/obtain' },
  { code: '1082', title: 'HIPAA Notice of Privacy', short: 'HIPAA Notice', description: 'Privacy practices acknowledgement' },
  { code: '1083', title: 'Assignment of Benefits', short: 'Assignment of Benefits', description: 'Insurance assignment & financial responsibility' },
  { code: '7000', title: 'Emergency Plan', short: 'Emergency Plan', description: 'Emergency contacts & priority level' },
  { code: '7050', title: 'Home Environment Safety Checklist', short: 'Home Safety', description: 'Y / N / R safety checklist' },
];

/**
 * Temporary: only these codes can be edited / saved.
 * Set to `null` (or `[]`) to enable all forms again.
 */
export const ASSESSMENT_PACKET_ENABLED_CODES = ['110', '324', '325', '350', '400', '410'];

/** Always the full packet list (UI shows all; editability is gated separately). */
export const ASSESSMENT_PACKET_FORMS = ASSESSMENT_PACKET_FORMS_ALL;

export const ASSESSMENT_PACKET_STEPS = ASSESSMENT_PACKET_FORMS.map((f, i) => ({
  id: i + 1,
  code: f.code,
  label: f.short,
  description: f.description,
  title: f.title,
}));

export function isPacketFormEditable(code) {
  if (!Array.isArray(ASSESSMENT_PACKET_ENABLED_CODES) || ASSESSMENT_PACKET_ENABLED_CODES.length === 0) {
    return true;
  }
  return ASSESSMENT_PACKET_ENABLED_CODES.includes(String(code));
}

/** Forms that count toward progress / must be completed (editable ones only while gated). */
export function getEditablePacketForms() {
  if (!Array.isArray(ASSESSMENT_PACKET_ENABLED_CODES) || ASSESSMENT_PACKET_ENABLED_CODES.length === 0) {
    return ASSESSMENT_PACKET_FORMS;
  }
  return ASSESSMENT_PACKET_FORMS.filter((f) => ASSESSMENT_PACKET_ENABLED_CODES.includes(f.code));
}

const emptySig = () => ({ signature: '', printedName: '', date: '', relationship: '' });
const emptyAgencySig = () => ({ signature: '', printedName: '', date: '' });

const CARE_INSTRUCTION_GROUPS = {
  assessment: [
    'Measure & record intake/output', 'Measure blood glucose', 'Measure pulse', 'Monitor & record BM',
    'Monitor & record food intake', 'Monitor blood pressure', 'Monitor respirations', 'Take temperature', 'Weigh client',
  ],
  activityComfort: [
    'Accompany on outings', 'Drive client – seat belt on', 'Encourage independence', 'Encourage verbalization',
    'Give companionship', 'Handle petty cash', 'Pick up mail', 'Provide diversional activities',
    'Provide emotional support', 'Reorient to time/place/person',
  ],
  elimination: [
    'Care for condom catheter', 'Care for indwelling catheter', 'Care for ostomy', 'Give digital stimulation',
    'Give enema', 'Insert suppository', 'Irrigate colostomy', 'Provide incontinence care', 'Provide perineal care',
    'Remove impaction', 'Toilet with bedpan', 'Toilet with commode', 'Toilet with urinal',
  ],
  personalCare: [
    'Assist with changing clothes', 'Care for dentures', 'Give back rub', 'Give bed bath', 'Give shampoo',
    'Give shower/tub bath', 'Groom hair', 'Provide foot care', 'Provide oral care', 'Provide skin care',
    'Shave client', 'Stand-by assist while bathing',
  ],
  medications: ['Count controlled drugs', 'Remind/assist with medications'],
  housekeeping: [
    'Change linens', 'Clean bathroom/kitchen', 'Clean dishes/counter tops', 'Deposit trash', 'Dust',
    'Empty, clean & disinfect commode', 'Feed pet', 'Make occupied bed', 'Make unoccupied bed',
    'Straighten bedroom', 'Straighten living room', 'Vacuum/sweep/mop', 'Wash, dry & fold laundry', 'Water plants',
  ],
  mobility: [
    'Assist with active/passive ROM', 'Assist with ambulating', 'Assist with walker/care', 'Encourage exercise',
    'Keep on bed rest', 'Transfer – max assist', 'Transfer – min/mod assist', 'Transfer – using Hoyer lift',
    'Transfer – using transfer board', 'Turn & position in bed', 'Use wheelchair',
  ],
  nutrition: [
    'Encourage fluids', 'Feed via G-tube', 'Feed via mouth', 'Limit fluids',
    'Plan, prepare & setup meals/snacks', 'Provide food supplement', 'Shop for groceries',
  ],
  specialty: [
    'Change wound dressing', 'Monitor oxygen use', 'Provide stay-awake monitoring',
    'Provide stay-over monitoring', 'Suction oral cavity',
  ],
  safety: [
    'Follow bleeding precautions', 'Follow falling precautions', 'Follow fragile skin precautions',
    'Follow swallowing precautions', 'Follow universal precautions', 'Supervise client safety',
  ],
  records: ['Do Shift Report', 'Read Additional Care Guidelines', 'Record PRN med assistance'],
};

export { CARE_INSTRUCTION_GROUPS };

const emptyCareTasks = () => {
  const tasks = {};
  Object.values(CARE_INSTRUCTION_GROUPS).flat().forEach((label) => {
    tasks[label] = { enabled: false, frequency: '' };
  });
  return tasks;
};

const SAFETY_ITEMS = [
  'Stairs or Steps – Lighting', 'Stairs or Steps – Inside the home', 'Stairs or Steps – Into home', 'Stairs or Steps – Handrails',
  'Carpets – Is it loose?', 'Carpets – Is it worn?', 'Carpets – Throw rugs',
  'Furniture – Are they unstable?', 'Furniture – Anything unusual?',
  'Bathroom – Lighting', 'Bathroom – Bathtub & shower areas', 'Bathroom – Water temperature', 'Bathroom – Grab bars',
  'Bathroom – Accessibility', 'Bathroom – Small electric appliances',
  'Bedroom – Lighting', 'Bedroom – Bedrails', 'Bedroom – Around the bed',
  'Kitchen – Lighting', 'Kitchen – Stove / range area', 'Kitchen – Telephone area', 'Kitchen – Electrical cords',
  'Kitchen – Stepstool', 'Kitchen – Floors',
  'Living/Family Room – Fireplace & chimney', 'Living/Family Room – Telephone area', 'Living/Family Room – Passageways',
  'Basement/Garage – Lighting', 'Basement/Garage – Fuse box / circuit breakers', 'Basement/Garage – Appliances and power tools',
  'Basement/Garage – Flammable/volatile liquids', 'Pets – Cats', 'Pets – Dogs', 'Pets – Other',
  'Fire Safety – Fire Extinguisher', 'Fire Safety – Rug runners & mats', 'Fire Safety – Cords',
  'Fire Safety – Telephone area', 'Fire Safety – Smoke detectors', 'Fire Safety – Electrical outlets/switches/bulbs',
  'Fire Safety – Flammable clothing/material', 'Fire Safety – Space heaters', 'Fire Safety – Wood-burning heaters',
  'Fire Safety – Emergency exit plan',
  'Home Equipment – Walker', 'Home Equipment – Wheelchair', 'Home Equipment – Commode', 'Home Equipment – Grab bars',
  'Home Equipment – Wheelchair ramp', 'Home Equipment – Cane', 'Home Equipment – Hospital bed',
  'Pests – Insects', 'Pests – Rodents',
  'Structural – Narrow doorways', 'Structural – Uneven floors', 'Structural – Walking surfaces', 'Structural – Accessibility',
  'Cords – Telephone cords', 'Cords – Electrical cords',
  'Personal Belongings – Safe place', 'Personal Belongings – Too accessible',
];

export { SAFETY_ITEMS };

const emptySafetyChecks = () => Object.fromEntries(SAFETY_ITEMS.map((k) => [k, '']));

const emptyMedRows = (n = 10) => Array.from({ length: n }, () => ({ name: '', dose: '', frequency: '' }));
const emptyDiagRows = (n = 10) => Array.from({ length: n }, () => '');
const emptyAllergyRows = (n = 3) => Array.from({ length: n }, () => ({ allergy: '', reaction: '' }));
const emptyCaseNotes = (n = 8) => Array.from({ length: n }, () => ({ date: '', time: '', notes: '' }));

export function buildEmptyPacketForm(code) {
  switch (code) {
    case '110':
      return {
        clientName: '', date: '', dob: '', codeStatus: '', sex: '',
        address: '', phone: '', cellPhone: '',
        emergencyContact: '', emergencyPhone: '', emergencyRelationship: '',
        primaryCaregiver: '', primaryCaregiverPhone: '', primaryCaregiverRelationship: '',
        primaryCarePhysician: '', pcpPhone: '', pcpAddress: '',
        pharmacy: '', pharmacyPhone: '', pharmacyAddress: '',
        sourceInfo: [], sourceOther: '',
        vitals: { temperature: '', bp: '', hr: '', respirations: '', o2sat: '' },
        specialDiet: '',
        diagnoses: emptyDiagRows(),
        medications: emptyMedRows(),
        allergicReactions: '',
        allergies: emptyAllergyRows(),
        pertinentInfoYesNo: '',
        pertinentInfoDetails: '',
        neuro: {
          loc: [], locOther: '', perrla: false, movesExtremities: false, paralysis: false,
          weakness: false, weaknessSide: '', abnormalGait: false, painScore: '',
        },
        skin: {
          items: [], edemaWhere: '', color: [],
        },
        cardiovascular: { items: [] },
        gastrointestinal: { items: [], tenderness: '', other: '' },
        genitourinary: { items: [], other: '' },
        respiratory: { items: [], o2Liters: '', abnormalSounds: '', copd: '', smoker: false },
        endocrine: { items: [], thyroid: '', other: '' },
        musculoskeletal: { items: [], other: '' },
        psychological: { items: [], other: '' },
        hospitalAdmissions: '',
        surgeries: '',
        ongoingProblems: '',
        eating: '',
        bathing: '',
        toileting: '',
        dressing: '',
        ambulation: '',
        ambulationDevice: '',
        equipment: [],
        dentures: [],
        equipmentOther: '',
        primaryLanguage: '',
        schooling: '',
        formerOccupation: '',
        hobbies: '',
        livesWith: '',
        livesWithOther: '',
        assessorSignature: '',
        assessorPrintName: '',
        assessorDate: '',
        // Quote seeding helpers collected on this form
        recommendedWeeklyHours: '',
        requestedServices: [],
        startOfCareDate: '',
        riskLevel: '',
        firstName: '',
        lastName: '',
        email: '',
        city: '',
        state: '',
        zip: '',
      };
    case '324':
      return { acknowledged: false, client: emptySig(), agency: emptyAgencySig() };
    case '325':
      return { printName: '', client: emptySig() };
    case '350':
      return { printName: '', client: emptySig(), agency: emptyAgencySig() };
    case '400':
      return { clientName: '', dob: '', tasks: emptyCareTasks() };
    case '410':
      return {
        printName: '', clientName: '', dob: '', comments: '',
        employee: emptyAgencySig(),
        client: emptySig(),
        agency: emptyAgencySig(),
      };
    case '610':
      return { acknowledged: false, client: emptySig() };
    case '790':
      return {
        clientId: '', clientName: '', clientDob: '',
        representativeName: '', representativeTitle: '',
        entries: emptyCaseNotes(),
      };
    case '800':
      return { acknowledged: false, client: emptySig() };
    case '1009':
      return {
        clientName: '', dob: '',
        nonMedical: [], privateDutyNursing: [],
        billingCycle: '',
        privateInsurancePays: false, copayEstimate: '',
        privatePay: false, privatePayCharges: '',
        otherPayment: '', otherPaymentAmount: '',
        depositHours: '', depositAmount: '',
        advancedDirective: '', advancedDirectiveHolder: '', advancedDirectiveRelationship: '',
        client: emptySig(),
        agency: emptyAgencySig(),
      };
    case '1081':
      return {
        clientName: '', dob: '',
        releaseObtain: [],
        entireMedicalRecords: false,
        includeMentalHealth: false, includeAlcoholDrug: false, includeCommunicable: false,
        medicalRecordsFrom: '', other: '',
        parties: ['', '', '', ''],
        client: emptySig(),
      };
    case '1082':
      return {
        clientName: '', dob: '',
        acknowledged: false,
        effectiveDate: '01/01/2016',
        client: emptySig(),
      };
    case '1083':
      return {
        firstName: '', lastName: '', dob: '', address: '', phone: '',
        insuranceCarrier: '', triWest: false, vaReferral: false,
        insuranceAddress: '', insurancePhone: '', policyNumber: '', claimNumber: '',
        clientPaysPercent: '', insurancePaysPercent: '',
        client: emptySig(),
        agency: emptyAgencySig(),
      };
    case '7000':
      return {
        date: '', reassessmentDate: '', clientName: '', dob: '',
        address: '', phone: '', cell: '', majorCrossroads: '',
        emergencyContact: '', emergencyPhone: '', emergencyRelationship: '', emergencyCell: '',
        physicians: [
          { name: '', phone: '' },
          { name: '', phone: '' },
          { name: '', phone: '' },
        ],
        hospital: '', hospitalPhone: '',
        pharmacy: '',
        evacuationPlan: 'As per Civil Defense and Red Cross Protocols',
        relocationName: '', relocationPhone: '',
        electricCompany: '', gasCompany: '',
        priorityLevel: '',
        client: emptySig(),
        agency: emptyAgencySig(),
      };
    case '7050':
      return {
        performedBy: '', date: '', clientName: '', address: '', telephone: '', emergencyContact: '',
        checks: emptySafetyChecks(),
        otherProblems: '', otherProblemsList: '',
        comments: '', adviceGiven: '',
        client: emptySig(),
        agency: emptyAgencySig(),
      };
    default:
      return {};
  }
}

export function buildEmptyPacketForms() {
  return Object.fromEntries(
    ASSESSMENT_PACKET_FORMS.map((f) => [f.code, buildEmptyPacketForm(f.code)]),
  );
}

/** Merge saved packet forms onto empty defaults (deep enough for nested objects). */
export function mergePacketForms(saved = {}) {
  const empty = buildEmptyPacketForms();
  const out = {};
  ASSESSMENT_PACKET_FORMS.forEach(({ code }) => {
    const base = empty[code];
    const incoming = saved[code] || {};
    out[code] = { ...base, ...incoming };
    if (code === '400') {
      out[code].tasks = { ...base.tasks, ...(incoming.tasks || {}) };
    }
    if (code === '7050') {
      out[code].checks = { ...base.checks, ...(incoming.checks || {}) };
    }
    if (code === '110') {
      out[code].vitals = { ...base.vitals, ...(incoming.vitals || {}) };
      out[code].neuro = { ...base.neuro, ...(incoming.neuro || {}) };
      out[code].medications = Array.from({ length: 10 }, (_, i) => ({
        ...base.medications[i],
        ...(incoming.medications?.[i] || {}),
      }));
      out[code].diagnoses = Array.from({ length: 10 }, (_, i) => incoming.diagnoses?.[i] ?? '');
      out[code].allergies = Array.from({ length: 3 }, (_, i) => ({
        ...base.allergies[i],
        ...(incoming.allergies?.[i] || {}),
      }));
    }
    if (code === '790') {
      out[code].entries = Array.from({ length: Math.max(8, (incoming.entries || []).length) }, (_, i) => ({
        date: '', time: '', notes: '',
        ...(incoming.entries?.[i] || {}),
      }));
    }
  });
  return out;
}

/**
 * Derive legacy clinical fields used by quote / client / care-plan seeding
 * from packet form 110 (+ optional 400 services).
 * Only overwrites clinical fields when form 110 has client identity data.
 */
export function syncClinicalFromPacket(formData = {}) {
  const forms = mergePacketForms(formData.forms || {});
  const f110 = forms['110'] || {};
  const f400 = forms['400'] || {};
  const firstName = String(f110.firstName || '').trim();
  const lastName = String(f110.lastName || '').trim();
  const clientName = [firstName, lastName].filter(Boolean).join(' ')
    || String(f110.clientName || '').trim();

  const hasPacketIdentity = Boolean(clientName || firstName || lastName || f110.dob || f110.address);
  if (!hasPacketIdentity) {
    return {
      ...formData,
      forms,
      packetVersion: formData.packetVersion || 1,
    };
  }

  const nameParts = clientName.split(/\s+/).filter(Boolean);
  const resolvedFirst = firstName || nameParts[0] || '';
  const resolvedLast = lastName || nameParts.slice(1).join(' ') || '';

  const enabledCareTasks = Object.entries(f400.tasks || {})
    .filter(([, v]) => v?.enabled)
    .map(([label]) => label);

  const requestedFrom110 = Array.isArray(f110.requestedServices) ? f110.requestedServices : [];
  const requestedServices = requestedFrom110.length
    ? requestedFrom110
    : (enabledCareTasks.length ? ['Personal Care', 'Companionship'] : (formData.requestedServices || []));

  return {
    ...formData,
    forms,
    packetVersion: 1,
    clientInfo: {
      ...(formData.clientInfo || {}),
      firstName: resolvedFirst,
      lastName: resolvedLast,
      clientName: clientName || [resolvedFirst, resolvedLast].filter(Boolean).join(' '),
      dob: f110.dob || formData.clientInfo?.dob || '',
      gender: f110.sex || formData.clientInfo?.gender || '',
      primaryLanguage: f110.primaryLanguage || formData.clientInfo?.primaryLanguage || '',
      primaryDiagnosis: (f110.diagnoses || []).filter(Boolean)[0] || formData.clientInfo?.primaryDiagnosis || '',
      secondaryDiagnoses: (f110.diagnoses || []).filter(Boolean).slice(1).join(', ') || formData.clientInfo?.secondaryDiagnoses || '',
    },
    contactInfo: {
      ...(formData.contactInfo || {}),
      homeAddress: f110.address || formData.contactInfo?.homeAddress || '',
      city: f110.city || formData.contactInfo?.city || '',
      state: f110.state || formData.contactInfo?.state || '',
      zip: f110.zip || formData.contactInfo?.zip || '',
      homePhone: f110.phone || formData.contactInfo?.homePhone || '',
      mobile: f110.cellPhone || f110.phone || formData.contactInfo?.mobile || '',
      email: f110.email || formData.contactInfo?.email || '',
    },
    emergencyInfo: {
      ...(formData.emergencyInfo || {}),
      primaryName: f110.emergencyContact || formData.emergencyInfo?.primaryName || '',
      primaryPhone: f110.emergencyPhone || formData.emergencyInfo?.primaryPhone || '',
      primaryRelationship: f110.emergencyRelationship || formData.emergencyInfo?.primaryRelationship || '',
    },
    physicianInfo: {
      ...(formData.physicianInfo || {}),
      primaryPhysician: f110.primaryCarePhysician || formData.physicianInfo?.primaryPhysician || '',
      primaryPhysicianPhone: f110.pcpPhone || formData.physicianInfo?.primaryPhysicianPhone || '',
      pharmacy: f110.pharmacy || formData.physicianInfo?.pharmacy || '',
      pharmacyPhone: f110.pharmacyPhone || formData.physicianInfo?.pharmacyPhone || '',
    },
    allergies: {
      types: f110.allergicReactions === 'YES'
        ? ['Medication']
        : (f110.allergicReactions === 'NO' ? ['None'] : (formData.allergies?.types || [])),
      details: (f110.allergies || [])
        .filter((a) => a.allergy)
        .map((a) => `${a.allergy}${a.reaction ? ` (${a.reaction})` : ''}`)
        .join('; ') || formData.allergies?.details || '',
    },
    medications: (f110.medications || []).some((m) => m.name)
      ? (f110.medications || [])
        .filter((m) => m.name)
        .map((m) => ({
          name: m.name,
          dosage: m.dose || '',
          frequency: m.frequency || '',
          purpose: '',
          selfManaged: false,
        }))
      : (formData.medications || []),
    coordinatorNotes: f110.pertinentInfoDetails || formData.coordinatorNotes || '',
    requestedServices,
    carePlanSummary: {
      ...(formData.carePlanSummary || {}),
      primaryNeeds: (f110.diagnoses || []).filter(Boolean).slice(0, 3).join(', ')
        || formData.carePlanSummary?.primaryNeeds
        || '',
      recommendedWeeklyHours: f110.recommendedWeeklyHours || formData.carePlanSummary?.recommendedWeeklyHours || '',
      startOfCareDate: f110.startOfCareDate || formData.carePlanSummary?.startOfCareDate || '',
      riskLevel: f110.riskLevel || formData.carePlanSummary?.riskLevel || '',
    },
  };
}

export function getPacketFormMeta(code) {
  return ASSESSMENT_PACKET_FORMS.find((f) => f.code === code) || null;
}

export function getPacketCodeByStep(step) {
  return ASSESSMENT_PACKET_STEPS[step - 1]?.code || '110';
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return false;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.every(isBlank);
  if (typeof value === 'object') return Object.values(value).every(isBlank);
  return false;
}

/** True when form has any user-entered content beyond empty defaults. */
export function isPacketFormStarted(code, data = {}) {
  const empty = buildEmptyPacketForm(code);
  const keys = new Set([...Object.keys(empty), ...Object.keys(data || {})]);
  for (const key of keys) {
    const current = data?.[key];
    const baseline = empty[key];
    if (typeof current === 'boolean') {
      if (current !== Boolean(baseline)) return true;
      continue;
    }
    if (Array.isArray(current) || (current && typeof current === 'object')) {
      if (JSON.stringify(current) !== JSON.stringify(baseline ?? (Array.isArray(current) ? [] : {}))) {
        // Ignore fully blank nested structures that match empty shape length
        if (!isBlank(current) && JSON.stringify(current) !== JSON.stringify(baseline)) return true;
      }
      continue;
    }
    if (!isBlank(current) && String(current) !== String(baseline ?? '')) return true;
  }
  return false;
}

/**
 * @returns {'not_started' | 'in_progress' | 'saved'}
 * Prefer explicit formMeta from last save; otherwise infer from content.
 */
export function getPacketFormStatus(code, formData = {}) {
  const meta = formData?.formMeta?.[code];
  if (meta?.status === 'saved' || meta?.status === 'complete') return 'saved';
  if (isPacketFormStarted(code, formData?.forms?.[code])) return 'in_progress';
  return 'not_started';
}

export function getPacketProgress(formData = {}) {
  const forms = mergePacketForms(formData?.forms || {});
  const editable = getEditablePacketForms();
  let saved = 0;
  let started = 0;
  editable.forEach(({ code }) => {
    const status = getPacketFormStatus(code, { ...formData, forms });
    if (status === 'saved') saved += 1;
    else if (status === 'in_progress') started += 1;
  });
  return {
    total: editable.length,
    saved,
    started,
    remaining: editable.length - saved,
    packetTotal: ASSESSMENT_PACKET_FORMS.length,
  };
}

