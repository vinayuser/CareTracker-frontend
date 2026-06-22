export const AGENCY_NAV_GROUPS = [
  {
    items: [{ key: 'AGENCY_DASHBOARD', label: 'Dashboard', icon: 'LayoutDashboard' }],
  },
  {
    title: 'Client Management',
    items: [
      { key: 'AGENCY_CLIENTS', label: 'Clients', icon: 'Users' },
      { key: 'AGENCY_ASSESSMENTS', label: 'Assessments', icon: 'ClipboardList' },
      { key: 'AGENCY_CARE_PLANS', label: 'Care Plans', icon: 'HeartHandshake' },
      { key: 'AGENCY_SERVICE_NOTES', label: 'Service Notes', icon: 'FileText' },
      { key: 'AGENCY_MEDICATIONS', label: 'Medications', icon: 'Pill' },
      { key: 'AGENCY_EMAR', label: 'eMAR', icon: 'Tablets' },
    ],
  },
  {
    title: 'Scheduling',
    items: [
      { key: 'AGENCY_SCHEDULE', label: 'Schedule', icon: 'Calendar' },
      { key: 'AGENCY_VISIT_CALENDAR', label: 'Visit Calendar', icon: 'CalendarDays' },
      { key: 'AGENCY_SHIFT_MANAGEMENT', label: 'Shift Management', icon: 'Clock' },
      { key: 'AGENCY_TIME_ATTENDANCE', label: 'Time & Attendance', icon: 'Timer' },
    ],
  },
  {
    title: 'Caregivers',
    items: [
      { key: 'AGENCY_CAREGIVERS', label: 'Caregivers', icon: 'UserCheck' },
      { key: 'AGENCY_CAREGIVER_MATCHING', label: 'Caregiver Matching', icon: 'GitMerge' },
    ],
  },
  {
    title: 'Human Resources',
    items: [
      { key: 'AGENCY_HR_STAFF', label: 'HR Staff', icon: 'Briefcase' },
      { key: 'AGENCY_HIRING_PIPELINE', label: 'Hiring Pipeline', icon: 'GitBranch' },
      { key: 'AGENCY_JOBS', label: 'Jobs', icon: 'ClipboardList' },
      { key: 'AGENCY_CANDIDATES', label: 'Candidates', icon: 'Users' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { key: 'AGENCY_TASKS', label: 'Tasks', icon: 'CheckSquare' },
      { key: 'AGENCY_INCIDENTS', label: 'Incidents', icon: 'AlertTriangle' },
      { key: 'AGENCY_REPORTS', label: 'Reports', icon: 'BarChart3' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { key: 'AGENCY_USERS', label: 'Users', icon: 'UserCog' },
      { key: 'AGENCY_ROLES', label: 'Roles & Permissions', icon: 'Shield' },
      { key: 'AGENCY_SETTINGS', label: 'Settings', icon: 'Settings' },
      { key: 'AGENCY_BILLING', label: 'Billing & Invoices', icon: 'Receipt' },
    ],
  },
];
