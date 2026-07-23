const STORAGE_KEY = 'caretracker_agencies_v1';

export const AGENCY_STATUSES = ['Active', 'Pending', 'Inactive', 'Suspended'];

export const AGENCY_TABS = [
  { key: 'all', label: 'All Agencies' },
  { key: 'Active', label: 'Active' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Inactive', label: 'Inactive' },
  { key: 'Suspended', label: 'Suspended' },
];

export const DEFAULT_USAGE = {
  clients: 0,
  caregivers: 0,
  users: 0,
  branches: 0,
};

export const DEFAULT_AGENCIES = [
  {
    id: 'agency-1',
    name: 'Sunshine Home Care',
    legalName: 'Sunshine Home Care LLC',
    email: 'contact@sunshinehomecare.com',
    phone: '(555) 123-4567',
    city: 'Los Angeles',
    state: 'CA',
    ownerName: 'John Smith',
    status: 'Active',
    subscriptionPlanId: 'plan-1',
    usage: { clients: 32, caregivers: 18, users: 4, branches: 1 },
    registeredAt: '2024-05-01',
    iconColor: 'bg-violet-100 text-violet-600',
  },
  {
    id: 'agency-2',
    name: 'Happy Hearts Care',
    legalName: 'Happy Hearts Care Inc.',
    email: 'info@happyhearts.com',
    phone: '(555) 234-5678',
    city: 'San Diego',
    state: 'CA',
    ownerName: 'Maria Garcia',
    status: 'Active',
    subscriptionPlanId: 'plan-2',
    usage: { clients: 145, caregivers: 72, users: 12, branches: 2 },
    registeredAt: '2024-06-15',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'agency-3',
    name: 'Golden Years Services',
    legalName: 'Golden Years Services LLC',
    email: 'admin@goldenyears.com',
    phone: '(555) 345-6789',
    city: 'Phoenix',
    state: 'AZ',
    ownerName: 'Robert Chen',
    status: 'Active',
    subscriptionPlanId: 'plan-4',
    usage: { clients: 19, caregivers: 8, users: 2, branches: 1 },
    registeredAt: '2024-08-01',
    iconColor: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'agency-4',
    name: 'Comfort Care Agency',
    legalName: 'Comfort Care Agency Corp.',
    email: 'admin@comfortcare.com',
    phone: '(555) 456-7890',
    city: 'Houston',
    state: 'TX',
    ownerName: 'Lisa Johnson',
    status: 'Pending',
    subscriptionPlanId: 'plan-6',
    usage: { clients: 0, caregivers: 0, users: 1, branches: 0 },
    registeredAt: '2026-06-01',
    iconColor: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'agency-5',
    name: 'Premier Health Services',
    legalName: 'Premier Health Services Ltd.',
    email: 'register@premierhealth.com',
    phone: '(555) 567-8901',
    city: 'Chicago',
    state: 'IL',
    ownerName: 'David Williams',
    status: 'Active',
    subscriptionPlanId: 'plan-3',
    usage: { clients: 420, caregivers: 185, users: 28, branches: 4 },
    registeredAt: '2024-01-01',
    iconColor: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: 'agency-6',
    name: 'Harmony Home Health',
    legalName: 'Harmony Home Health LLC',
    email: 'hello@harmonyhome.com',
    phone: '(555) 678-9012',
    city: 'Denver',
    state: 'CO',
    ownerName: 'Sarah Miller',
    status: 'Active',
    subscriptionPlanId: 'plan-5',
    usage: { clients: 98, caregivers: 45, users: 8, branches: 2 },
    registeredAt: '2024-03-10',
    iconColor: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'agency-7',
    name: 'Bright Path Care',
    legalName: 'Bright Path Care Inc.',
    email: 'contact@brightpath.com',
    phone: '(555) 789-0123',
    city: 'Seattle',
    state: 'WA',
    ownerName: 'James Wilson',
    status: 'Pending',
    subscriptionPlanId: 'plan-7',
    usage: { clients: 0, caregivers: 0, users: 1, branches: 0 },
    registeredAt: '2026-06-10',
    iconColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'agency-8',
    name: 'Graceful Living Care',
    legalName: 'Graceful Living Care LLC',
    email: 'info@gracefulliving.com',
    phone: '(555) 890-1234',
    city: 'Miami',
    state: 'FL',
    ownerName: 'Emily Davis',
    status: 'Inactive',
    subscriptionPlanId: 'plan-8',
    usage: { clients: 12, caregivers: 5, users: 2, branches: 1 },
    registeredAt: '2023-01-01',
    iconColor: 'bg-gray-100 text-gray-500',
  },
];

const ICON_COLORS = [
  'bg-violet-100 text-violet-600',
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-indigo-100 text-indigo-600',
  'bg-cyan-100 text-cyan-600',
  'bg-amber-100 text-amber-600',
];

function normalizeAgency(agency) {
  return {
    ...agency,
    usage: { ...DEFAULT_USAGE, ...(agency.usage ?? {}) },
    iconColor: agency.iconColor ?? ICON_COLORS[0],
  };
}

function readAgencies() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map(normalizeAgency);
  } catch {
    // ignore
  }
  const defaults = DEFAULT_AGENCIES.map(normalizeAgency);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function writeAgencies(agencies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agencies.map(normalizeAgency)));
}

export function getAllAgencies() {
  return readAgencies();
}

export function getAgenciesByPlanId(planId) {
  return readAgencies().filter((agency) => agency.subscriptionPlanId === planId);
}

export function countAgenciesByPlanId(planId, agencies = readAgencies()) {
  return agencies.filter((agency) => agency.subscriptionPlanId === planId).length;
}

export function getAgencyById(id) {
  return readAgencies().find((a) => a.id === id) ?? null;
}

export function createAgency(data) {
  const agencies = readAgencies();
  const newAgency = normalizeAgency({
    id: `agency-${Date.now()}`,
    ...data,
    registeredAt: new Date().toISOString().split('T')[0],
    iconColor: data.iconColor ?? ICON_COLORS[agencies.length % ICON_COLORS.length],
  });
  agencies.push(newAgency);
  writeAgencies(agencies);
  return newAgency;
}

export function updateAgency(id, updates) {
  const agencies = readAgencies();
  const index = agencies.findIndex((a) => a.id === id);
  if (index === -1) return null;
  agencies[index] = normalizeAgency({ ...agencies[index], ...updates });
  writeAgencies(agencies);
  return agencies[index];
}

export function deleteAgency(id) {
  writeAgencies(readAgencies().filter((a) => a.id !== id));
}

export function getAgencyStats(agencies) {
  return {
    total: agencies.length,
    active: agencies.filter((a) => a.status === 'Active').length,
    pending: agencies.filter((a) => a.status === 'Pending').length,
    inactive: agencies.filter((a) => a.status === 'Inactive').length,
    suspended: agencies.filter((a) => a.status === 'Suspended').length,
  };
}

export function enrichAgencyWithPlan(agency, plans) {
  const plan = plans.find((p) => p.id === agency.subscriptionPlanId) ?? null;
  return { ...agency, plan };
}

export function agencyToFormState(agency) {
  return {
    name: agency.name,
    legalName: agency.legalName ?? '',
    email: agency.email,
    phone: agency.phone ?? '',
    city: agency.city ?? '',
    state: agency.state ?? '',
    ownerName: agency.ownerName ?? '',
    status: agency.status,
    subscriptionPlanId: agency.subscriptionPlanId ?? '',
  };
}

export function getEmptyAgencyFormState() {
  return {
    name: '',
    legalName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    ownerName: '',
    status: 'Pending',
    subscriptionPlanId: '',
  };
}

export function formStateToAgencyPayload(formData) {
  return {
    name: formData.name,
    legalName: formData.legalName,
    email: formData.email,
    phone: formData.phone,
    city: formData.city,
    state: formData.state,
    ownerName: formData.ownerName,
    status: formData.status,
    subscriptionPlanId: formData.subscriptionPlanId,
  };
}

export function formatAgencyDate(date) {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}
