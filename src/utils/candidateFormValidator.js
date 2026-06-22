export const EXPERIENCE_OPTIONS = ['Fresher', '1-3 years', '3-5 years', '5+ years'];

export const validateCandidateForm = (data) => {
  const errors = {};

  if (!data.firstName?.trim()) errors.firstName = 'First name is required';
  if (!data.lastName?.trim()) errors.lastName = 'Last name is required';

  if (!data.phone?.trim()) {
    errors.phone = 'Valid 10-digit phone number is required';
  } else if (!/^\d{10}$/.test(data.phone.trim())) {
    errors.phone = 'Valid 10-digit phone number is required';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(data.email.trim())) {
    errors.email = 'Invalid email address';
  }

  if (!data.location?.trim()) errors.location = 'Location is required';
  if (!data.country?.trim()) errors.country = 'Country is required';
  if (!data.designation?.trim()) errors.designation = 'Designation is required';
  if (!data.education?.trim()) errors.education = 'Education is required';
  if (!data.experience?.trim()) errors.experience = 'Work experience is required';

  if (data.currentCtc !== '' && data.currentCtc != null && Number.isNaN(Number(data.currentCtc))) {
    errors.currentCtc = 'Current CTC must be a number';
  }
  if (data.expectedCtc !== '' && data.expectedCtc != null && Number.isNaN(Number(data.expectedCtc))) {
    errors.expectedCtc = 'Expected CTC must be a number';
  }

  if (!data.jobId) errors.jobId = 'Select a job';

  return errors;
};

export const parseExperienceValue = (value) => {
  if (!value || value === 'Fresher') return 0;
  const parsed = parseFloat(value);
  if (!Number.isNaN(parsed)) return parsed;
  if (value.includes('1-3')) return 2;
  if (value.includes('3-5')) return 4;
  if (value.includes('5+')) return 5;
  return 0;
};
