const API_ROUTES = {
  LOGIN: '/auth/login',
  ADMIN: {
    AGENCY: {
      LIST: '/admin/agencies',
      CREATE: '/admin/agencies',
      UPDATE: '/admin/agencies',
      DELETE: '/admin/agencies',
    },
    SUBSCRIPTION_PLAN: {
      LIST: '/admin/subscription-plans',
      ACTIVE: '/subscription-plans/active',
      CREATE: '/admin/subscription-plans',
      UPDATE: '/admin/subscription-plans',
      DELETE: '/admin/subscription-plans',
    },
    INVITATION: {
      STATS: '/admin/invitations/stats',
      LIST: '/admin/invitations',
      CREATE: '/admin/invitations',
      RESEND: '/admin/invitations',
      VALIDATE: '/invitations/validate',
    },
  },
  AGENCY: {
    HR_STAFF: {
      STATS: '/agency/hr-staff/stats',
      LIST: '/agency/hr-staff',
      CREATE: '/agency/hr-staff',
      UPDATE: '/agency/hr-staff',
      STATUS: '/agency/hr-staff',
    },
    HIRING_PIPELINE: {
      GET: '/agency/hiring-pipeline',
      DOCUMENTS: '/agency/hiring-pipeline/documents',
      SAVE: '/agency/hiring-pipeline',
      STAGES: '/agency/hiring-pipeline/stages',
    },
    JOBS: {
      LIST: '/agency/jobs',
      CREATE: '/agency/jobs',
      UPDATE: '/agency/jobs',
      DELETE: '/agency/jobs',
      GENERATE_AI: '/agency/jobs/generate-ai',
      COMPLETE_HIRING: '/agency/jobs',
      REOPEN_HIRING: '/agency/jobs',
    },
    JOB_APPLICATIONS: {
      STATS: '/agency/job-applications/stats',
      LIST: '/agency/job-applications',
      CREATE: '/agency/job-applications',
      SET_STAGE: '/agency/job-applications',
      NEXT_STAGE: '/agency/job-applications',
      PREVIOUS_STAGE: '/agency/job-applications',
      REJECT: '/agency/job-applications',
      UNDO_HIRE: '/agency/job-applications',
      COMPLETE_HIRE: '/agency/job-applications',
      HIRED: '/agency/job-applications/hired',
      REJECTED: '/agency/job-applications/job',
      BY_STAGE: '/agency/job-applications/job',
    },
    CAREGIVERS: {
      STATS: '/agency/caregivers/stats',
      LIST: '/agency/caregivers',
    },
    CLIENTS: {
      OPTIONS: '/agency/clients/options',
      STATS: '/agency/clients/stats',
      LIST: '/agency/clients',
    },
    CARE_PLANS: {
      OPTIONS: '/agency/care-plans/options',
      STATS: '/agency/care-plans/stats',
      LIST: '/agency/care-plans',
    },
  },
  REGISTRATION: {
    CHECK_USER_ID: '/registration/check-user-id',
    ACCOUNT: '/registration/account',
    SUBMIT: '/registration/submit',
    PAYMENT: '/registration/payment',
  },
};

export default API_ROUTES;
