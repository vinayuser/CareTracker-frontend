export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  ADMIN_PREFIX: '/admin',
  AGENCY_PREFIX: '/agency',
  CAREGIVER_PREFIX: '/caregiver',

  // Super admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_AGENCIES: '/admin/agencies',
  ADMIN_INVITATIONS: '/admin/invitations',
  ADMIN_CREATE_INVITATION: '/admin/invitations/create',
  ADMIN_SUBSCRIPTION_PLANS: '/admin/subscription-plans',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',

  // Agency owner / HR portal
  AGENCY_DASHBOARD: '/agency/dashboard',
  AGENCY_CLIENTS: '/agency/clients',
  AGENCY_ASSESSMENTS: '/agency/assessments',
  AGENCY_CARE_PLANS: '/agency/care-plans',
  AGENCY_SERVICE_NOTES: '/agency/service-notes',
  AGENCY_MEDICATIONS: '/agency/medications',
  AGENCY_EMAR: '/agency/emar',
  AGENCY_SCHEDULE: '/agency/schedule',
  AGENCY_VISIT_CALENDAR: '/agency/visit-calendar',
  AGENCY_SHIFT_MANAGEMENT: '/agency/shift-management',
  AGENCY_TIME_ATTENDANCE: '/agency/time-attendance',
  AGENCY_CAREGIVERS: '/agency/caregivers',
  AGENCY_CAREGIVER_MATCHING: '/agency/caregiver-matching',
  AGENCY_TASKS: '/agency/tasks',
  AGENCY_INCIDENTS: '/agency/incidents',
  AGENCY_REPORTS: '/agency/reports',
  AGENCY_USERS: '/agency/users',
  AGENCY_ROLES: '/agency/roles',
  AGENCY_SETTINGS: '/agency/settings',
  AGENCY_BILLING: '/agency/billing',

  AGENCY_HR_STAFF: '/agency/hr/staff',
  AGENCY_HR_STAFF_DETAIL: '/agency/hr/staff/:id',
  AGENCY_HIRING_PIPELINE: '/agency/hr/hiring-pipeline',
  AGENCY_JOBS: '/agency/hr/jobs',
  AGENCY_JOBS_CREATE: '/agency/hr/jobs/create',
  AGENCY_JOBS_EDIT: '/agency/hr/jobs/:id/edit',
  AGENCY_CANDIDATES: '/agency/hr/candidates',

  // Caregiver portal
  CAREGIVER_DASHBOARD: '/caregiver/dashboard',
  CAREGIVER_JOBS: '/caregiver/jobs',
  CAREGIVER_CLOCK: '/caregiver/clock',
  CAREGIVER_LEAVES: '/caregiver/leaves',
  CAREGIVER_SUMMARY: '/caregiver/summary',
  CAREGIVER_PAYMENTS: '/caregiver/payments',

  // Agency registration
  REGISTRATION_ENTRY: '/register',
  REGISTRATION_AGENCY_INFO: '/register/agency-information',
  REGISTRATION_CREATE_ACCOUNT: '/register/create-account',
  REGISTRATION_CONFIRMATION: '/register/confirmation',
};

export const ADMIN_NAV_ITEMS = [
  { key: 'ADMIN_DASHBOARD', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'ADMIN_INVITATIONS', label: 'Invitations', icon: 'Mail' },
  { key: 'ADMIN_AGENCIES', label: 'Agencies', icon: 'Building2' },
  { key: 'ADMIN_SUBSCRIPTION_PLANS', label: 'Subscription Plans', icon: 'CreditCard' },
  { key: 'ADMIN_USERS', label: 'Users', icon: 'Users' },
  { key: 'ADMIN_REPORTS', label: 'Reports', icon: 'BarChart3' },
  { key: 'ADMIN_AUDIT_LOGS', label: 'Audit Logs', icon: 'FileText' },
  { key: 'ADMIN_SETTINGS', label: 'Settings', icon: 'Settings' },
];

export const REGISTRATION_STEPS = [
  { key: 'REGISTRATION_AGENCY_INFO', label: 'Agency Information', step: 1 },
  { key: 'REGISTRATION_CREATE_ACCOUNT', label: 'Create Account', step: 2 },
  { key: 'REGISTRATION_CONFIRMATION', label: 'Confirmation', step: 3 },
];
