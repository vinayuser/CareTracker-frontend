const REGISTRATION_KEY = 'caretracker_registration_data';

export const emptyRegistrationData = {
  agencyName: '',
  agencyType: '',
  yearEstablished: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  serviceAreas: [],
  description: '',
  fullName: '',
  userId: '',
  password: '',
};

export function getRegistrationData() {
  try {
    const raw = sessionStorage.getItem(REGISTRATION_KEY);
    return raw ? { ...emptyRegistrationData, ...JSON.parse(raw) } : { ...emptyRegistrationData };
  } catch {
    return { ...emptyRegistrationData };
  }
}

export function updateRegistrationData(partial) {
  const current = getRegistrationData();
  const next = { ...current, ...partial };
  sessionStorage.setItem(REGISTRATION_KEY, JSON.stringify(next));
  return next;
}

export function clearRegistrationData() {
  sessionStorage.removeItem(REGISTRATION_KEY);
}
