export const AGENCY_NAV_GROUPS = [
  {
    items: [{ key: 'AGENCY_DASHBOARD', label: 'Dashboard', icon: 'LayoutDashboard' }],
  },
  {
    title: 'Client Management',
    items: [
      { key: 'AGENCY_ASSESSMENTS', label: 'Assessments', icon: 'ClipboardList' },
      { key: 'AGENCY_CLIENTS', label: 'Clients', icon: 'Users' },
      { key: 'AGENCY_CARE_PLANS', label: 'Care Plans', icon: 'HeartHandshake' },
      { key: 'AGENCY_INSURANCE_INTAKE', label: 'Insurance Intake', icon: 'Shield' },
    ],
  },
  // EVV — temporarily hidden; re-enable later
  // {
  //   title: 'EVV',
  //   items: [
  //     {
  //       key: 'AGENCY_EVV_GROUP',
  //       label: 'EVV',
  //       icon: 'ShieldCheck',
  //       badge: 'Live',
  //       moduleKeys: [
  //         'AGENCY_EVV_DASHBOARD',
  //         'AGENCY_EVV_LOGS',
  //         'AGENCY_EVV_EXCEPTIONS',
  //         'AGENCY_EVV_UNVERIFIED',
  //         'AGENCY_EVV_ENROLLMENTS',
  //         'AGENCY_EVV_SETTINGS',
  //       ],
  //       children: [
  //         { key: 'AGENCY_EVV_DASHBOARD', label: 'EVV Dashboard' },
  //         { key: 'AGENCY_EVV_LOGS', label: 'EVV Logs' },
  //         { key: 'AGENCY_EVV_EXCEPTIONS', label: 'Exceptions' },
  //         { key: 'AGENCY_EVV_UNVERIFIED', label: 'Unverified Visits' },
  //         { key: 'AGENCY_EVV_ENROLLMENTS', label: 'Enrollments' },
  //         { key: 'AGENCY_EVV_SETTINGS', label: 'Settings' },
  //       ],
  //     },
  //   ],
  // },
  {
    title: 'Caregivers',
    items: [
      { key: 'AGENCY_CAREGIVERS', label: 'Caregivers', icon: 'UserCheck' },
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
];
