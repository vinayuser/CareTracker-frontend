import { ROUTES } from '../../routes/routes';

const SHOTS = {
  dashboard: '/marketing/agency-dashboard.png',
  evv: '/marketing/evv-dashboard.png',
  assessments: '/marketing/assessments.png',
};

/**
 * Each topic gets its own layout so pages do not feel copy-pasted.
 *
 * Layouts:
 * - featureGrid
 * - pricing
 * - demoWalkthrough
 * - intakeSteps
 * - zigzag
 * - messaging
 * - softStory
 * - analyticsBoard
 * - alternatingRows
 * - notesWorkspace
 * - alertsFeed
 * - liveOps
 */
export const FOOTER_TOPIC_PAGES = [
  {
    path: ROUTES.PRODUCT_FEATURES,
    contentKey: 'product_features',
    category: 'Product',
    categoryPath: ROUTES.MARKETING_PRODUCT,
    shortLabel: 'Features',
    eyebrow: 'Product Features',
    headline: 'Everything your agency needs, in one platform.',
    summary: 'Scheduling, EVV, care plans, caregiver tools, and reporting—built for daily home care work.',
    layout: 'featureGrid',
    shot: SHOTS.dashboard,
    theme: 'sky',
  },
  {
    path: ROUTES.PRODUCT_PRICING,
    contentKey: 'product_pricing',
    category: 'Product',
    categoryPath: ROUTES.MARKETING_PRODUCT,
    shortLabel: 'Pricing',
    eyebrow: 'Pricing',
    headline: 'Simple plans that grow with your agency.',
    summary: 'Get caregiver, scheduling, EVV, and care tools without unnecessary complexity.',
    layout: 'pricing',
    shot: SHOTS.dashboard,
    theme: 'emerald',
  },
  {
    path: ROUTES.PRODUCT_REQUEST_DEMO,
    contentKey: 'product_demo',
    category: 'Product',
    categoryPath: ROUTES.MARKETING_PRODUCT,
    shortLabel: 'Request a Demo',
    eyebrow: 'Live Demo',
    headline: 'See Caretraqer working for your agency.',
    summary: 'Walk through caregiver management, scheduling, EVV, care plans, and the mobile app with our team.',
    layout: 'demoWalkthrough',
    shot: SHOTS.assessments,
    theme: 'violet',
    showDemoButton: true,
  },
  {
    path: ROUTES.CRM_CLIENT_INTAKE,
    contentKey: 'crm_client_intake',
    category: 'CRM',
    categoryPath: ROUTES.MARKETING_CRM,
    shortLabel: 'Client Intake',
    eyebrow: 'Client Intake',
    headline: 'Onboard clients with less paperwork.',
    summary: 'Collect personal details, care needs, documents, and intake status in one organized flow.',
    layout: 'intakeSteps',
    mock: 'form',
    theme: 'sky',
  },
  {
    path: ROUTES.CRM_MARKETING_TOOLS,
    contentKey: 'crm_marketing_tools',
    category: 'CRM',
    categoryPath: ROUTES.MARKETING_CRM,
    shortLabel: 'Marketing Tools',
    eyebrow: 'Marketing',
    headline: 'Grow inquiries and track what works.',
    summary: 'Connect campaigns, lead sources, and follow-ups so your team converts more opportunities.',
    layout: 'zigzag',
    shot: SHOTS.dashboard,
    theme: 'orange',
  },
  {
    path: ROUTES.CRM_EMAIL_SMS,
    contentKey: 'crm_email_sms',
    category: 'CRM',
    categoryPath: ROUTES.MARKETING_CRM,
    shortLabel: 'Email & SMS',
    eyebrow: 'Messaging',
    headline: 'Keep clients and caregivers in the loop.',
    summary: 'Send updates, reminders, and announcements without losing the conversation trail.',
    layout: 'messaging',
    mock: 'table',
    theme: 'teal',
  },
  {
    path: ROUTES.CRM_PATIENT_ENGAGEMENT,
    contentKey: 'crm_patient_engagement',
    category: 'CRM',
    categoryPath: ROUTES.MARKETING_CRM,
    shortLabel: 'Patient Engagement',
    eyebrow: 'Patient Engagement',
    headline: 'Stronger relationships with patients and families.',
    summary: 'Improve communication, share the right updates, and keep care feeling personal.',
    layout: 'softStory',
    shot: SHOTS.assessments,
    theme: 'rose',
  },
  {
    path: ROUTES.CRM_ANALYTICS_REPORTS,
    contentKey: 'crm_analytics_reports',
    category: 'CRM',
    categoryPath: ROUTES.MARKETING_CRM,
    shortLabel: 'Analytics & Reports',
    eyebrow: 'Analytics',
    headline: 'Make clearer decisions with organized reports.',
    summary: 'Monitor leads, operations, EVV activity, and performance from one reporting view.',
    layout: 'analyticsBoard',
    shot: SHOTS.dashboard,
    theme: 'indigo',
  },
  {
    path: ROUTES.EVV_VISIT_VERIFICATION,
    contentKey: 'evv_visit_verification',
    category: 'EVV',
    categoryPath: ROUTES.MARKETING_EVV,
    shortLabel: 'Visit Verification',
    eyebrow: 'Visit Verification',
    headline: 'Verify every visit with confidence.',
    summary: 'Review caregiver check-ins, visit details, and verification status in a structured EVV workflow.',
    layout: 'alternatingRows',
    shot: SHOTS.evv,
    theme: 'rose',
  },
  {
    path: ROUTES.EVV_CARE_NOTES,
    contentKey: 'evv_care_notes',
    category: 'EVV',
    categoryPath: ROUTES.MARKETING_EVV,
    shortLabel: 'Care Notes',
    eyebrow: 'Care Notes',
    headline: 'Capture what happened on every visit.',
    summary: 'Document observations, completed tasks, and visit updates so care stays continuous.',
    layout: 'notesWorkspace',
    mock: 'form',
    theme: 'amber',
  },
  {
    path: ROUTES.EVV_MISSED_VISIT_ALERTS,
    contentKey: 'evv_missed_visit_alerts',
    category: 'EVV',
    categoryPath: ROUTES.MARKETING_EVV,
    shortLabel: 'Missed Visit Alerts',
    eyebrow: 'Missed Visit Alerts',
    headline: 'Catch missed visits before they become problems.',
    summary: 'Get timely alerts when expected check-ins are missing so your team can follow up quickly.',
    layout: 'alertsFeed',
    mock: 'table',
    theme: 'orange',
  },
  {
    path: ROUTES.EVV_COMPLIANCE,
    contentKey: 'evv_compliance',
    category: 'EVV',
    categoryPath: ROUTES.MARKETING_EVV,
    shortLabel: 'EVV Compliance',
    eyebrow: 'EVV Compliance',
    headline: 'Stay organized for EVV requirements.',
    summary: 'Keep visit times, locations, and service records together for monitoring and documentation.',
    layout: 'alternatingRows',
    shot: SHOTS.evv,
    theme: 'emerald',
  },
  {
    path: ROUTES.EVV_REAL_TIME_MONITORING,
    contentKey: 'evv_realtime_monitoring',
    category: 'EVV',
    categoryPath: ROUTES.MARKETING_EVV,
    shortLabel: 'Real-Time Monitoring',
    eyebrow: 'Real-Time Monitoring',
    headline: 'See today’s care activity as it happens.',
    summary: 'Monitor visit status, attendance, and schedule progress from one operations view.',
    layout: 'liveOps',
    mock: 'map',
    theme: 'sky',
  },
];

export function findFooterTopicPage(pathname = '') {
  return FOOTER_TOPIC_PAGES.find((page) => page.path === pathname) || null;
}
