export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  AGENCY_OWNER: 'AGENCY_OWNER',
  HR: 'HR',
  CAREGIVER: 'CAREGIVER',
  CLIENT: 'CLIENT',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.AGENCY_OWNER]: 'Agency Owner',
  [ROLES.HR]: 'HR Manager',
  [ROLES.CAREGIVER]: 'Caregiver',
  [ROLES.CLIENT]: 'Client',
};

export function normalizeRole(role) {
  if (!role) return null;
  const value = String(role).toUpperCase().replace(/\s+/g, '_');
  if (value === 'SUPER_ADMIN' || value === 'ADMIN') return ROLES.SUPER_ADMIN;
  if (value === 'AGENCY_OWNER' || value === 'OWNER') return ROLES.AGENCY_OWNER;
  if (value === 'HR' || value === 'HR_MANAGER') return ROLES.HR;
  if (value === 'CAREGIVER') return ROLES.CAREGIVER;
  if (value === 'CLIENT') return ROLES.CLIENT;
  return value;
}
