const STORAGE_KEY = 'caretracker_subscription_plans_v3';

export const PLAN_STATUSES = ['Active', 'Scheduled', 'Inactive', 'Expired'];

export const PLAN_TABS = [
  { key: 'all', label: 'All Plans' },
  { key: 'Active', label: 'Active' },
  { key: 'Scheduled', label: 'Scheduled' },
  { key: 'Inactive', label: 'Inactive' },
  { key: 'Expired', label: 'Expired' },
];

export const PLAN_FEATURE_OPTIONS = [
  'Client Management',
  'Care Plan Management',
  'Scheduling & Appointments',
  'Billing & Invoicing',
  'Reports & Analytics',
  'Mobile App Access',
  'Custom Branding',
];

export const MOCK_AGENCIES = [
  { id: 'agency-1', name: 'Sunshine Home Care' },
  { id: 'agency-2', name: 'Happy Hearts Care' },
  { id: 'agency-3', name: 'Golden Years Services' },
  { id: 'agency-4', name: 'Comfort Care Agency' },
  { id: 'agency-5', name: 'Premier Health Services' },
  { id: 'agency-6', name: 'Harmony Home Health' },
  { id: 'agency-7', name: 'Bright Path Care' },
  { id: 'agency-8', name: 'Graceful Living Care' },
];

export const DEFAULT_DURATION = {
  type: 'ongoing',
  dueDate: null,
  value: 12,
  unit: 'months',
};

export const DEFAULT_LIMITS = {
  maxClients: 0,
  maxCaregivers: 0,
  maxUsers: 0,
  maxBranches: 0,
};

export const DEFAULT_PLANS = [
  {
    id: 'plan-1',
    name: 'Basic Plan',
    description: 'Standard features for small teams',
    iconColor: 'bg-violet-100 text-violet-600',
    price: 99,
    billingCycle: 'monthly',
    status: 'Active',
    startDate: '2024-05-01',
    endDate: '2025-05-01',
    limits: { maxClients: 50, maxCaregivers: 25, maxUsers: 5, maxBranches: 1 },
    assignedAgencies: [{ id: 'agency-1', name: 'Sunshine Home Care' }],
    duration: { type: 'dueDate', dueDate: '2025-05-01', value: 12, unit: 'months' },
    selectedFeatures: ['Client Management', 'Scheduling & Appointments'],
    customFeatures: [],
    features: ['Client Management', 'Scheduling & Appointments'],
    isActive: true,
    createdAt: '2024-05-01',
  },
  {
    id: 'plan-2',
    name: 'Pro Plan',
    description: 'Advanced features for growing agencies',
    iconColor: 'bg-blue-100 text-blue-600',
    price: 199,
    billingCycle: 'monthly',
    status: 'Active',
    startDate: '2024-06-15',
    endDate: '2025-06-15',
    limits: { maxClients: 200, maxCaregivers: 100, maxUsers: 15, maxBranches: 3 },
    assignedAgencies: [{ id: 'agency-2', name: 'Happy Hearts Care' }],
    duration: { type: 'dueDate', dueDate: '2025-06-15', value: 12, unit: 'months' },
    selectedFeatures: ['Client Management', 'Care Plan Management', 'Reports & Analytics'],
    customFeatures: [],
    features: ['Client Management', 'Care Plan Management', 'Reports & Analytics'],
    isActive: true,
    createdAt: '2024-06-15',
  },
  {
    id: 'plan-3',
    name: 'Enterprise Plan',
    description: 'All features for large organizations',
    iconColor: 'bg-indigo-100 text-indigo-600',
    price: 1999,
    billingCycle: 'yearly',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    limits: { maxClients: null, maxCaregivers: null, maxUsers: null, maxBranches: null },
    assignedAgencies: [{ id: 'agency-5', name: 'Premier Health Services' }],
    duration: { type: 'dueDate', dueDate: '2025-01-01', value: 12, unit: 'months' },
    selectedFeatures: PLAN_FEATURE_OPTIONS,
    customFeatures: [],
    features: [...PLAN_FEATURE_OPTIONS],
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'plan-4',
    name: 'Starter Plan',
    description: 'Essential features to get started',
    iconColor: 'bg-emerald-100 text-emerald-600',
    price: 49,
    billingCycle: 'monthly',
    status: 'Active',
    startDate: '2024-08-01',
    endDate: '2025-08-01',
    limits: { maxClients: 25, maxCaregivers: 10, maxUsers: 3, maxBranches: 1 },
    assignedAgencies: [{ id: 'agency-3', name: 'Golden Years Services' }],
    duration: { type: 'dueDate', dueDate: '2025-08-01', value: 12, unit: 'months' },
    selectedFeatures: ['Client Management', 'Mobile App Access'],
    customFeatures: [],
    features: ['Client Management', 'Mobile App Access'],
    isActive: true,
    createdAt: '2024-08-01',
  },
  {
    id: 'plan-5',
    name: 'Growth Plan',
    description: 'Scale your agency with powerful tools',
    iconColor: 'bg-cyan-100 text-cyan-600',
    price: 149,
    billingCycle: 'monthly',
    status: 'Active',
    startDate: '2024-03-10',
    endDate: '2025-03-10',
    limits: { maxClients: 150, maxCaregivers: 75, maxUsers: 10, maxBranches: 2 },
    assignedAgencies: [{ id: 'agency-6', name: 'Harmony Home Health' }],
    duration: { type: 'dueDate', dueDate: '2025-03-10', value: 12, unit: 'months' },
    selectedFeatures: ['Scheduling & Appointments', 'Billing & Invoicing', 'Reports & Analytics'],
    customFeatures: [],
    features: ['Scheduling & Appointments', 'Billing & Invoicing', 'Reports & Analytics'],
    isActive: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'plan-6',
    name: 'Premium Plan',
    description: 'Premium support and advanced analytics',
    iconColor: 'bg-amber-100 text-amber-600',
    price: 299,
    billingCycle: 'monthly',
    status: 'Scheduled',
    startDate: '2026-07-01',
    endDate: '2027-07-01',
    limits: { maxClients: 300, maxCaregivers: 150, maxUsers: 20, maxBranches: 5 },
    assignedAgencies: [{ id: 'agency-4', name: 'Comfort Care Agency' }],
    duration: { type: 'dueDate', dueDate: '2027-07-01', value: 12, unit: 'months' },
    selectedFeatures: ['Client Management', 'Care Plan Management', 'Custom Branding'],
    customFeatures: [],
    features: ['Client Management', 'Care Plan Management', 'Custom Branding'],
    isActive: true,
    createdAt: '2026-06-01',
  },
  {
    id: 'plan-7',
    name: 'Team Plan',
    description: 'Collaboration tools for mid-size teams',
    iconColor: 'bg-orange-100 text-orange-600',
    price: 129,
    billingCycle: 'monthly',
    status: 'Scheduled',
    startDate: '2026-08-15',
    endDate: '2027-08-15',
    limits: { maxClients: 100, maxCaregivers: 50, maxUsers: 8, maxBranches: 2 },
    assignedAgencies: [{ id: 'agency-7', name: 'Bright Path Care' }],
    duration: { type: 'dueDate', dueDate: '2027-08-15', value: 12, unit: 'months' },
    selectedFeatures: ['Scheduling & Appointments', 'Mobile App Access'],
    customFeatures: [],
    features: ['Scheduling & Appointments', 'Mobile App Access'],
    isActive: true,
    createdAt: '2026-06-10',
  },
  {
    id: 'plan-8',
    name: 'Legacy Plan',
    description: 'Previous generation plan (deprecated)',
    iconColor: 'bg-gray-100 text-gray-500',
    price: 79,
    billingCycle: 'monthly',
    status: 'Inactive',
    startDate: '2023-01-01',
    endDate: null,
    limits: { maxClients: 30, maxCaregivers: 15, maxUsers: 3, maxBranches: 1 },
    assignedAgencies: [{ id: 'agency-8', name: 'Graceful Living Care' }],
    duration: { type: 'ongoing', dueDate: null, value: 12, unit: 'months' },
    selectedFeatures: ['Client Management'],
    customFeatures: [],
    features: ['Client Management'],
    isActive: false,
    createdAt: '2023-01-01',
  },
];

export const LIMIT_FIELDS = [
  { key: 'maxClients', label: 'Clients', singular: 'client' },
  { key: 'maxCaregivers', label: 'Caregivers', singular: 'caregiver' },
  { key: 'maxUsers', label: 'Admin Users', singular: 'user' },
  { key: 'maxBranches', label: 'Branches', singular: 'branch' },
];

const ICON_COLORS = [
  'bg-violet-100 text-violet-600',
  'bg-blue-100 text-blue-600',
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-cyan-100 text-cyan-600',
  'bg-amber-100 text-amber-600',
];

export function computeEndDate(formData) {
  if (formData.durationType === 'dueDate') return formData.dueDate || null;
  if (formData.durationType === 'limited' && formData.startDate) {
    const start = new Date(formData.startDate);
    const addMonths =
      formData.durationUnit === 'years'
        ? Number(formData.durationValue) * 12
        : Number(formData.durationValue);
    start.setMonth(start.getMonth() + addMonths);
    return start.toISOString().split('T')[0];
  }
  return null;
}

export function deriveStatus({ isActive, startDate, endDate }) {
  if (!isActive) return 'Inactive';
  const today = new Date().toISOString().split('T')[0];
  if (startDate && startDate > today) return 'Scheduled';
  if (endDate && endDate < today) return 'Expired';
  return 'Active';
}

function normalizePlan(plan) {
  const defaultMatch = DEFAULT_PLANS.find((d) => d.id === plan.id);
  const limits = plan.limits ?? defaultMatch?.limits ?? {
    maxClients: 50,
    maxCaregivers: 25,
    maxUsers: 5,
    maxBranches: 1,
  };

  const selectedFeatures = plan.selectedFeatures ?? plan.features ?? defaultMatch?.selectedFeatures ?? [];
  const customFeatures = plan.customFeatures ?? defaultMatch?.customFeatures ?? [];
  const startDate = plan.startDate ?? defaultMatch?.startDate ?? plan.createdAt ?? null;
  const endDate = plan.endDate ?? computeEndDate({
    durationType: plan.duration?.type ?? 'ongoing',
    dueDate: plan.duration?.dueDate ?? '',
    startDate,
    durationValue: plan.duration?.value ?? 12,
    durationUnit: plan.duration?.unit ?? 'months',
  });

  const normalized = {
    ...plan,
    limits: { ...DEFAULT_LIMITS, ...limits },
    assignedAgencies: plan.assignedAgencies ?? [],
    duration: { ...DEFAULT_DURATION, ...(plan.duration ?? defaultMatch?.duration ?? {}) },
    selectedFeatures,
    customFeatures,
    features: plan.features ?? [...selectedFeatures, ...customFeatures],
    isActive: plan.isActive ?? true,
    startDate,
    endDate,
    iconColor: plan.iconColor ?? defaultMatch?.iconColor ?? ICON_COLORS[0],
  };

  normalized.status = plan.status ?? deriveStatus(normalized);
  return normalized;
}

function readPlans() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map(normalizePlan);
  } catch {
    // ignore parse errors
  }
  const defaults = DEFAULT_PLANS.map(normalizePlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function writePlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.map(normalizePlan)));
}

export function isUnlimited(value) {
  return value === null || value === undefined || value === -1;
}

export function formatLimit(value, singular) {
  if (isUnlimited(value)) return `Unlimited ${singular}s`;
  return `Up to ${value} ${value === 1 ? singular : `${singular}s`}`;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatBillingCycle(cycle) {
  return cycle === 'yearly' ? 'Annually' : 'Monthly';
}

export function formatPlanDate(date) {
  if (!date) return '—';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function getPrimaryAgencyName(plan) {
  if (plan.assignedAgencies?.length > 0) return plan.assignedAgencies[0].name;
  return '—';
}

export function getPlanStats(plans) {
  return {
    total: plans.length,
    active: plans.filter((p) => p.status === 'Active').length,
    scheduled: plans.filter((p) => p.status === 'Scheduled').length,
    inactive: plans.filter((p) => p.status === 'Inactive').length,
    expired: plans.filter((p) => p.status === 'Expired').length,
  };
}

export function getAllPlans() {
  return readPlans();
}

export function getActivePlans() {
  return readPlans().filter((plan) => plan.status === 'Active');
}

export function getPlanById(id) {
  return readPlans().find((plan) => plan.id === id) ?? null;
}

export function createPlan(planData) {
  const plans = readPlans();
  const endDate = planData.endDate ?? computeEndDate({
    durationType: planData.duration?.type,
    dueDate: planData.duration?.dueDate ?? '',
    startDate: planData.startDate,
    durationValue: planData.duration?.value ?? 12,
    durationUnit: planData.duration?.unit ?? 'months',
  });
  const newPlan = normalizePlan({
    id: `plan-${Date.now()}`,
    ...planData,
    endDate,
    iconColor: planData.iconColor ?? ICON_COLORS[plans.length % ICON_COLORS.length],
    isActive: planData.isActive ?? true,
    createdAt: new Date().toISOString().split('T')[0],
  });
  newPlan.status = deriveStatus(newPlan);
  plans.push(newPlan);
  writePlans(plans);
  return newPlan;
}

export function updatePlan(id, updates) {
  const plans = readPlans();
  const index = plans.findIndex((plan) => plan.id === id);
  if (index === -1) return null;
  const merged = { ...plans[index], ...updates };
  if (updates.duration || updates.startDate) {
    merged.endDate = updates.endDate ?? computeEndDate({
      durationType: merged.duration?.type,
      dueDate: merged.duration?.dueDate ?? '',
      startDate: merged.startDate,
      durationValue: merged.duration?.value ?? 12,
      durationUnit: merged.duration?.unit ?? 'months',
    });
  }
  plans[index] = normalizePlan(merged);
  plans[index].status = deriveStatus(plans[index]);
  writePlans(plans);
  return plans[index];
}

export function deletePlan(id) {
  const plans = readPlans().filter((plan) => plan.id !== id);
  writePlans(plans);
}

export const INVITE_PLAN_KEY = 'caretracker_invite_plan';

export function setInvitePlan(planId) {
  sessionStorage.setItem(INVITE_PLAN_KEY, planId);
}

export function getInvitePlan() {
  const planId = sessionStorage.getItem(INVITE_PLAN_KEY);
  return planId ? getPlanById(planId) : null;
}

export function parseLimitInput(value, unlimited) {
  if (unlimited) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function limitsToFormState(limits = DEFAULT_LIMITS) {
  return LIMIT_FIELDS.reduce((acc, { key }) => {
    const value = limits[key];
    acc[key] = isUnlimited(value) ? '' : String(value);
    acc[`${key}Unlimited`] = isUnlimited(value);
    return acc;
  }, {});
}

export function formStateToLimits(formData) {
  return LIMIT_FIELDS.reduce((acc, { key }) => {
    acc[key] = parseLimitInput(formData[key], formData[`${key}Unlimited`]);
    return acc;
  }, {});
}

export function planToFormState(plan) {
  return {
    name: plan.name,
    description: plan.description,
    price: String(plan.price),
    billingCycle: plan.billingCycle,
    startDate: plan.startDate ?? '',
    durationType: plan.duration?.type ?? 'ongoing',
    dueDate: plan.duration?.dueDate ?? plan.endDate ?? '',
    durationValue: String(plan.duration?.value ?? 12),
    durationUnit: plan.duration?.unit ?? 'months',
    isActive: plan.isActive ?? true,
    selectedFeatures: plan.selectedFeatures ?? plan.features ?? [],
    customFeatures: plan.customFeatures ?? [],
    customFeatureInput: '',
    ...limitsToFormState(plan.limits),
  };
}

export function formStateToPlanPayload(formData) {
  const allFeatures = [...formData.selectedFeatures, ...formData.customFeatures];
  const endDate = computeEndDate(formData);
  const startDate = formData.startDate || new Date().toISOString().split('T')[0];
  const isActive = formData.isActive;
  const status = deriveStatus({ isActive, startDate, endDate });

  return {
    name: formData.name,
    description: formData.description,
    price: Number(formData.price),
    billingCycle: formData.billingCycle,
    limits: formStateToLimits(formData),
    startDate,
    endDate,
    status,
    duration: {
      type: formData.durationType,
      dueDate: formData.durationType === 'dueDate' ? formData.dueDate : null,
      value: formData.durationType === 'limited' ? Number(formData.durationValue) : null,
      unit: formData.durationUnit,
    },
    selectedFeatures: formData.selectedFeatures,
    customFeatures: formData.customFeatures,
    features: allFeatures,
    isActive,
  };
}

export function getEmptyPlanFormState() {
  return {
    name: '',
    description: '',
    price: '',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    durationType: 'dueDate',
    dueDate: '',
    durationValue: '12',
    durationUnit: 'months',
    isActive: true,
    selectedFeatures: [],
    customFeatures: [],
    customFeatureInput: '',
    ...limitsToFormState({
      maxClients: 50,
      maxCaregivers: 25,
      maxUsers: 5,
      maxBranches: 1,
    }),
  };
}
