import { ROLES } from '../constants/roles';

const HR_STAFF_KEY = 'caretracker_hr_staff_v1';

const SEED_STAFF = [
  {
    id: 'hr-seed-001',
    agencyName: 'BrightCare Home Health',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@brightcare.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1988-04-12',
    gender: 'Female',
    employeeId: 'HR-1001',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    hireDate: '2022-03-15',
    employmentType: 'Full-time',
    workLocation: 'Main Office',
    reportsTo: 'John Smith',
    streetAddress: '1200 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'United States',
    emergencyContactName: 'Carlos Rodriguez',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '(555) 987-6543',
    emergencyContactEmail: 'carlos.r@gmail.com',
    educationLevel: 'Master',
    yearsOfExperience: '8',
    certifications: 'SHRM-CP, PHR',
    specializations: 'Recruiting, Compliance, Onboarding',
    userId: 'emily.rodriguez@brightcare.com',
    status: 'Active',
    notes: 'Primary HR contact for caregiver hiring and credential tracking.',
    role: ROLES.HR,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
];

function readAll() {
  try {
    const raw = localStorage.getItem(HR_STAFF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to seed
  }
  writeAll(SEED_STAFF);
  return SEED_STAFF;
}

function writeAll(staff) {
  localStorage.setItem(HR_STAFF_KEY, JSON.stringify(staff));
}

function agencyKey(agencyName) {
  return agencyName?.trim() || 'BrightCare Home Health';
}

export function formatHrDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getHrStaffList(agencyName) {
  const key = agencyKey(agencyName);
  return readAll().filter((member) => member.agencyName === key);
}

export function getHrStaffById(id) {
  return readAll().find((member) => member.id === id) ?? null;
}

export function getHrStaffStats(agencyName) {
  const list = getHrStaffList(agencyName);
  return {
    total: list.length,
    active: list.filter((m) => m.status === 'Active').length,
    inactive: list.filter((m) => m.status === 'Inactive').length,
    pending: list.filter((m) => m.status === 'Pending').length,
  };
}

export function createHrStaff(agencyName, payload) {
  const all = readAll();
  const key = agencyKey(agencyName);
  const now = new Date().toISOString();

  const duplicate = all.find(
    (m) => m.agencyName === key && (m.email === payload.email || m.userId === payload.userId),
  );
  if (duplicate) {
    throw new Error('An HR account with this email or user ID already exists.');
  }

  const member = {
    id: `hr-${Date.now()}`,
    agencyName: key,
    role: ROLES.HR,
    createdAt: now,
    updatedAt: now,
    status: payload.status || 'Active',
    ...payload,
  };

  all.unshift(member);
  writeAll(all);
  return member;
}

export function updateHrStaff(id, updates) {
  const all = readAll();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) throw new Error('HR staff member not found.');

  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
  return all[index];
}

export function updateHrStaffStatus(id, status) {
  return updateHrStaff(id, { status });
}
