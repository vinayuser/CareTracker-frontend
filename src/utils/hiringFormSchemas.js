export const EMPLOYMENT_APPLICATION_DEFAULT = {
  personalInfo: {
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    dob: '',
    positionApplied: '',
  },
  workHistory: [{ employer: '', title: '', from: '', to: '', reasonLeaving: '' }],
  education: '',
  references: [{ name: '', phone: '', relationship: '' }],
  authorization: { signature: '', date: '' },
};

export const GENERIC_ACK_DEFAULT = {
  acknowledged: false,
  candidateName: '',
  notes: '',
  signature: '',
  date: '',
};

export const getFormSchema = (documentCode) => {
  if (documentCode === '1020') {
    return { type: 'employment_application', label: 'Employment Application' };
  }
  return { type: 'generic_acknowledgment', label: 'Form Acknowledgment' };
};
