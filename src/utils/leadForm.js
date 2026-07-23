export const LEAD_STAGES = [
  'New Lead',
  'Contacted',
  'Assessment Scheduled',
  'Proposal Sent',
  'Converted',
];

export const LEAD_PRIORITIES = ['Hot', 'High', 'Medium', 'Low'];

export const PREFERRED_CONTACT_METHODS = ['Phone', 'Email', 'SMS', 'WhatsApp', 'In Person'];

export const LEAD_SOURCES = [
  'Website Inquiry',
  'Phone Call',
  'Referral',
  'Walk-in',
  'Social Media',
  'Advertisement',
  'Hospital Discharge',
  'Other',
];

export const CAMPAIGNS = [
  'Summer Care Campaign',
  'Fall Wellness Outreach',
  'Hospital Partnership',
  'Community Event',
  'None / Organic',
];

export const RELATIONSHIPS = [
  'Self',
  'Son – Family Member',
  'Daughter – Family Member',
  'Spouse / Partner',
  'Sibling',
  'Friend',
  'Legal Guardian',
  'Power of Attorney',
  'Case Manager',
  'Other',
];

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const MEDICAL_CONDITION_OPTIONS = [
  'Arthritis',
  'Mild Dementia',
  'High BP',
  'Diabetes',
  'Heart Disease',
  'Stroke History',
  'COPD',
  "Parkinson's",
  'Depression',
  'Mobility Issues',
  'Other',
];

export const CARE_TYPES = [
  'In-Home Care',
  'Personal Care',
  'Companion Care',
  'Respite Care',
  'Live-in Care',
  'Skilled Nursing Support',
];

export const CARE_REQUIRED_FOR = [
  'Self',
  'Parent',
  'Spouse',
  'Relative',
  'Friend',
  'Other',
];

export const PRIMARY_NEEDS = [
  'Personal Care',
  'Meal Support',
  'Mobility Assistance',
  'Companionship',
  'Medication Reminders',
  'Transportation',
  'Housekeeping',
  'Bathing / Hygiene',
];

export const CARE_SCHEDULES = [
  'Daily',
  '5 Days / Week',
  '3 Days / Week',
  'Weekends Only',
  'As Needed',
  'Live-in',
];

export const PREFERRED_TIMES = [
  'Morning (6:00 AM – 12:00 PM)',
  'Afternoon (12:00 PM – 5:00 PM)',
  'Evening (5:00 PM – 9:00 PM)',
  '9:00 AM – 1:00 PM',
  'Flexible',
  'Overnight',
];

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const buildEmptyLeadFormData = () => ({
  basicInfo: {
    fullName: '',
    relationship: '',
    phone: '',
    email: '',
    alternateNumber: '',
    preferredContactMethod: 'Phone',
    leadSource: 'Website Inquiry',
    campaign: 'None / Organic',
    inquiryDate: todayIso(),
    preferredStartDate: '',
    zipLocation: '',
  },
  careRecipient: {
    name: '',
    ageOrDob: '',
    gender: '',
    medicalConditions: [],
    doctorClinic: '',
    allergies: '',
  },
  familyRep: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    sameAsLeadAddress: false,
  },
  careSummary: {
    careTypeRequested: 'In-Home Care',
    careRequiredFor: 'Parent',
    primaryNeeds: [],
    careSchedule: '5 Days / Week',
    preferredTime: '9:00 AM – 1:00 PM',
    specialConditions: '',
    careNotes: '',
  },
  statusInfo: {
    stage: 'New Lead',
    priority: 'High',
    nextAction: 'Schedule Home Assessment',
  },
  internalNotes: '',
});

export const leadToForm = (lead) => {
  const empty = buildEmptyLeadFormData();
  if (!lead) {
    return {
      leadCode: '',
      stage: 'New Lead',
      priority: 'High',
      nextAction: 'Schedule Home Assessment',
      notes: '',
      assignedToName: '',
      clientId: null,
      assessmentId: null,
      createdAt: null,
      formData: empty,
    };
  }
  const fd = lead.formData || {};
  return {
    leadCode: lead.leadCode || '',
    stage: lead.stage || fd.statusInfo?.stage || 'New Lead',
    priority: lead.priority || fd.statusInfo?.priority || 'Medium',
    nextAction: lead.nextAction ?? fd.statusInfo?.nextAction ?? '',
    notes: lead.notes ?? fd.internalNotes ?? '',
    assignedToName: lead.assignedToName || '',
    clientId: lead.clientId || null,
    assessmentId: lead.assessmentId || null,
    createdAt: lead.createdAt || null,
    formData: {
      basicInfo: { ...empty.basicInfo, ...(fd.basicInfo || {}) },
      careRecipient: {
        ...empty.careRecipient,
        ...(fd.careRecipient || {}),
        medicalConditions: Array.isArray(fd.careRecipient?.medicalConditions)
          ? fd.careRecipient.medicalConditions
          : [],
      },
      familyRep: { ...empty.familyRep, ...(fd.familyRep || {}) },
      careSummary: {
        ...empty.careSummary,
        ...(fd.careSummary || {}),
        primaryNeeds: Array.isArray(fd.careSummary?.primaryNeeds)
          ? fd.careSummary.primaryNeeds
          : [],
      },
      statusInfo: {
        ...empty.statusInfo,
        ...(fd.statusInfo || {}),
        stage: lead.stage || fd.statusInfo?.stage || 'New Lead',
        priority: lead.priority || fd.statusInfo?.priority || 'Medium',
        nextAction: lead.nextAction ?? fd.statusInfo?.nextAction ?? '',
      },
      internalNotes: fd.internalNotes ?? lead.notes ?? '',
      contactLog: fd.contactLog || null,
      homeAssessment: fd.homeAssessment || null,
      activities: Array.isArray(fd.activities) ? fd.activities : [],
      disqualified: Boolean(fd.disqualified || fd.contactLog?.disqualified),
    },
  };
};

export const formToPayload = (form) => {
  const fd = {
    ...form.formData,
    statusInfo: {
      ...(form.formData.statusInfo || {}),
      stage: form.stage || form.formData.statusInfo?.stage || 'New Lead',
      priority: form.priority || form.formData.statusInfo?.priority || 'Medium',
      nextAction: form.nextAction ?? form.formData.statusInfo?.nextAction ?? '',
    },
    internalNotes: form.notes ?? form.formData.internalNotes ?? '',
  };
  return {
    stage: fd.statusInfo.stage,
    priority: fd.statusInfo.priority,
    nextAction: fd.statusInfo.nextAction,
    notes: fd.internalNotes,
    assignedToName: form.assignedToName || '',
    formData: fd,
  };
};

/** Prefill assessment form state from a lead */
export const leadToAssessmentPrefill = (lead) => {
  const fd = lead?.formData || {};
  const basic = fd.basicInfo || {};
  const recipient = fd.careRecipient || {};
  const care = fd.careSummary || {};
  const conditions = Array.isArray(recipient.medicalConditions)
    ? recipient.medicalConditions.join(', ')
    : '';
  return {
    clientName: recipient.name || basic.fullName || lead?.fullName || '',
    clientPhone: basic.phone || lead?.phone || '',
    clientEmail: basic.email || lead?.email || '',
    primaryDiagnosis: conditions,
    allergies: recipient.allergies || '',
    physicianName: recipient.doctorClinic || '',
    careNotes: care.careNotes || '',
    leadId: lead?.id || null,
    leadCode: lead?.leadCode || '',
    clientId: lead?.clientId || null,
  };
};
