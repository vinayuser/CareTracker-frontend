import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import agencyReducer from './slices/agencySlice';
import subscriptionPlanReducer from './slices/subscriptionPlanSlice';
import invitationReducer from './slices/invitationSlice';
import registrationReducer from './slices/registrationSlice';
import hrStaffReducer from './slices/hrStaffSlice';
import hiringPipelineReducer from './slices/hiringPipelineSlice';
import jobsReducer from './slices/jobsSlice';
import candidatesReducer from './slices/candidatesSlice';
import caregiversReducer from './slices/caregiversSlice';
import clientsReducer from './slices/clientsSlice';
import carePlansReducer from './slices/carePlansSlice';
import assessmentsReducer from './slices/assessmentsSlice';
import leadsReducer from './slices/leadsSlice';
import insuranceIntakesReducer from './slices/insuranceIntakesSlice';
import evvEnrollmentsReducer from './slices/evvEnrollmentsSlice';
import visitSchedulesReducer from './slices/visitSchedulesSlice';
import invoicesReducer from './slices/invoicesSlice';
import dashboardsReducer from './slices/dashboardsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    agencies: agencyReducer,
    subscriptionPlans: subscriptionPlanReducer,
    invitations: invitationReducer,
    registration: registrationReducer,
    hrStaff: hrStaffReducer,
    hiringPipeline: hiringPipelineReducer,
    jobs: jobsReducer,
    candidates: candidatesReducer,
    caregivers: caregiversReducer,
    clients: clientsReducer,
    carePlans: carePlansReducer,
    assessments: assessmentsReducer,
    leads: leadsReducer,
    insuranceIntakes: insuranceIntakesReducer,
    evvEnrollments: evvEnrollmentsReducer,
    visitSchedules: visitSchedulesReducer,
    invoices: invoicesReducer,
    dashboards: dashboardsReducer,
  },
});

export default store;
