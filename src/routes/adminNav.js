export const ADMIN_NAV_GROUPS = [
  {
    items: [{ key: 'ADMIN_DASHBOARD', label: 'Dashboard', icon: 'LayoutDashboard' }],
  },
  {
    title: 'Agencies & Access',
    items: [
      { key: 'ADMIN_AGENCIES', label: 'Agencies', icon: 'Building2' },
      { key: 'ADMIN_INVITATIONS', label: 'Invitations', icon: 'Mail' },
      { key: 'ADMIN_USERS', label: 'Users', icon: 'Users' },
      { key: 'ADMIN_TEAM', label: 'Team', icon: 'UserCog' },
    ],
  },
  {
    title: 'Care Operations',
    items: [
      { key: 'ADMIN_CLIENTS', label: 'Clients', icon: 'HeartHandshake' },
      { key: 'ADMIN_CAREGIVERS', label: 'Caregivers', icon: 'UserCheck' },
      { key: 'ADMIN_SCHEDULES', label: 'Schedules', icon: 'CalendarClock' },
      { key: 'ADMIN_EVV_COMPLIANCE', label: 'EVV & Compliance', icon: 'ShieldCheck' },
      { key: 'ADMIN_MEDICAID', label: 'Medicaid', icon: 'Landmark' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { key: 'ADMIN_BILLING_CLAIMS', label: 'Billing & Claims', icon: 'Receipt' },
      { key: 'ADMIN_FINANCE', label: 'Finance', icon: 'Wallet' },
      { key: 'ADMIN_SUBSCRIPTION_PLANS', label: 'Subscriptions & Plans', icon: 'CreditCard' },
      { key: 'ADMIN_PAYMENTS', label: 'Payments', icon: 'Banknote' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { key: 'ADMIN_SOCIAL', label: 'Social & Community', icon: 'MessagesSquare' },
      { key: 'ADMIN_MARKETING', label: 'Marketing', icon: 'Megaphone' },
      { key: 'ADMIN_REFERRALS', label: 'Referrals', icon: 'Share2' },
      { key: 'ADMIN_CRM', label: 'CRM', icon: 'Contact' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { key: 'ADMIN_REPORTS', label: 'Reports', icon: 'BarChart3' },
      { key: 'ADMIN_AUDIT_LOGS', label: 'Audit Logs', icon: 'FileText' },
      { key: 'ADMIN_INTEGRATIONS', label: 'Integrations', icon: 'Puzzle' },
      { key: 'ADMIN_SUPPORT', label: 'Support Tickets', icon: 'Ticket' },
      { key: 'ADMIN_CONTENT', label: 'Content', icon: 'Newspaper' },
      { key: 'ADMIN_SETTINGS', label: 'Settings', icon: 'Settings' },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const ADMIN_MODULE_META = {
  'roles': {
    title: 'Roles & Permissions',
    description: 'Define platform roles and control what Super Admin, agency, caregiver, and client users can access.',
  },
  'clients': {
    title: 'Clients',
    description: 'View clients across all agencies, enrollment status, and care assignments.',
  },
  'caregivers': {
    title: 'Caregivers',
    description: 'Monitor caregiver accounts, credentials, and activity across the platform.',
  },
  'schedules': {
    title: 'Schedules',
    description: 'Platform-wide visit schedule overview and agency scheduling health.',
  },
  'evv-compliance': {
    title: 'EVV & Compliance',
    description: 'Track EVV enrollment, visit verification, exceptions, and compliance alerts across agencies.',
  },
  'medicaid': {
    title: 'Medicaid',
    description: 'Medicaid program connections, claim readiness, and payer configuration.',
  },
  'billing-claims': {
    title: 'Billing & Claims',
    description: 'Monitor claims processing, billing status, and payer submissions.',
  },
  'finance': {
    title: 'Finance',
    description: 'Platform revenue, payouts, collections, and financial health.',
  },
  'payments': {
    title: 'Payments',
    description: 'Subscription payments, failed charges, and payout history.',
  },
  'social': {
    title: 'Social & Community',
    description: 'Moderate community posts, reviews, and social engagement.',
  },
  'marketing': {
    title: 'Marketing',
    description: 'Campaigns, announcements, and platform marketing tools.',
  },
  'referrals': {
    title: 'Referrals',
    description: 'Referral partners, conversion tracking, and incentive programs.',
  },
  'crm': {
    title: 'CRM',
    description: 'Leads, agency prospects, and relationship management.',
  },
  'integrations': {
    title: 'Integrations',
    description: 'Connect EVV aggregators, billing systems, and third-party services.',
  },
  'support': {
    title: 'Support Tickets',
    description: 'Agency support requests, SLAs, and ticket assignment.',
  },
  'content': {
    title: 'Content',
    description: 'Help articles, announcements, and platform content.',
  },
};
