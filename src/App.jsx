import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from './routes/routes';
import { ROLES } from './constants/roles';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import PublicRoute from './components/auth/PublicRoute';
import { fetchCurrentUser } from './redux/slices/authSlice';
import AdminLayout from './components/layout/AdminLayout';
import AgencyLayout from './components/layout/agency/AgencyLayout';
import CaregiverLayout from './components/layout/caregiver/CaregiverLayout';
import RegistrationLayout from './components/layout/RegistrationLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import Agencies from './pages/admin/Agencies';
import Invitations from './pages/admin/Invitations';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import Profile from './pages/Profile';
import AgencyDashboard from './pages/agency/Dashboard';
import AgencyModulePage from './pages/agency/AgencyModulePage';
import Schedules from './pages/agency/schedule/Schedules';
import HrStaff from './pages/agency/hr/HrStaff';
import HrStaffDetail from './pages/agency/hr/HrStaffDetail';
import HiringPipeline from './pages/agency/hr/HiringPipeline';
import Jobs from './pages/agency/hiring/Jobs';
import CreateJob from './pages/agency/hiring/CreateJob';
import EditJob from './pages/agency/hiring/EditJob';
import Candidates from './pages/agency/hiring/Candidates';
import Caregivers from './pages/agency/caregivers/Caregivers';
import Clients from './pages/agency/clients/Clients';
import ClientIntake from './pages/agency/clients/ClientIntake';
import Leads from './pages/agency/leads/Leads';
import LeadFormPage from './pages/agency/leads/LeadFormPage';
import Assessments from './pages/agency/assessments/Assessments';
import ClientAssessmentForm from './pages/agency/assessments/ClientAssessmentForm';
import AssessmentPrintPage from './pages/agency/assessments/AssessmentPrintPage';
import CarePlans from './pages/agency/care-plans/CarePlans';
import GenerateCarePlan from './pages/agency/care-plans/GenerateCarePlan';
import CarePlanPrintPage from './pages/agency/care-plans/CarePlanPrintPage';
import InsuranceIntakes from './pages/agency/insurance-intake/InsuranceIntakes';
import ClientInsuranceIntakeForm from './pages/agency/insurance-intake/ClientInsuranceIntakeForm';
import InsuranceIntakePrintPage from './pages/agency/insurance-intake/InsuranceIntakePrintPage';
import EvvEnrollments from './pages/agency/evv-enrollment/EvvEnrollments';
import EvvEnrollmentReview from './pages/agency/evv-enrollment/EvvEnrollmentReview';
import EvvEnrollmentPrintPage from './pages/agency/evv-enrollment/EvvEnrollmentPrintPage';
import EvvDashboard from './pages/agency/evv/EvvDashboard';
import EvvLogs from './pages/agency/evv/EvvLogs';
import EvvExceptions from './pages/agency/evv/EvvExceptions';
import EvvUnverified from './pages/agency/evv/EvvUnverified';
import EvvSettings from './pages/agency/evv/EvvSettings';
import ClientInvoices from './pages/agency/billing/ClientInvoices';
import CaregiverDashboard from './pages/caregiver/Dashboard';
import CaregiverJobs from './pages/caregiver/Jobs';
import CaregiverVisitLogs from './pages/caregiver/VisitLogs';
import CaregiverClock from './pages/caregiver/Clock';
import CaregiverLeaves from './pages/caregiver/Leaves';
import CaregiverSummary from './pages/caregiver/Summary';
import CaregiverPayments from './pages/caregiver/Payments';
import CaregiverEvvEnrollments from './pages/caregiver/EvvEnrollments';
import CaregiverEvvEnrollmentForm from './pages/caregiver/EvvEnrollmentForm';
import CaregiverModulePage from './pages/caregiver/CaregiverModulePage';
import RegisterEntry from './pages/registration/RegisterEntry';
import CandidateFormPortal from './pages/candidate/CandidateFormPortal';
import CandidateDocumentForm from './pages/candidate/CandidateDocumentForm';
import CandidateFormPrintPage from './pages/agency/hiring/CandidateFormPrintPage';
import InterviewFeedbackPrintPage from './pages/agency/hiring/InterviewFeedbackPrintPage';
import AgencyInformation from './pages/registration/AgencyInformation';
import CreateAccount from './pages/registration/CreateAccount';
import RegistrationConfirmation from './pages/registration/RegistrationConfirmation';
import { getHomeRouteForRole } from './utils/auth';

function HomeRedirect() {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked, user } = useSelector((state) => state.auth);
  const hasToken = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    if (hasToken && !authChecked) {
      dispatch(fetchCurrentUser());
    }
  }, [authChecked, dispatch, hasToken]);

  if (hasToken && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] text-sm text-gray-500">
        Checking session…
      </div>
    );
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }
  return <Navigate to={ROUTES.LOGIN} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomeRedirect />} />

        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route path={ROUTES.REGISTRATION_ENTRY} element={<RegisterEntry />} />

        <Route path={ROUTES.CANDIDATE_FORM_PORTAL} element={<CandidateFormPortal />} />
        <Route path={ROUTES.CANDIDATE_FORM_DOCUMENT} element={<CandidateDocumentForm />} />

        <Route element={<ProtectedRoute />}>
          {/* Super Admin — /admin/* */}
          <Route element={<RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]} />}>
            <Route path={ROUTES.ADMIN_PREFIX} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.ADMIN_AGENCIES} element={<Agencies />} />
              <Route path={ROUTES.ADMIN_INVITATIONS} element={<Invitations />} />
              <Route
                path={ROUTES.ADMIN_CREATE_INVITATION}
                element={<Navigate to={ROUTES.ADMIN_INVITATIONS} state={{ openSendDrawer: true }} replace />}
              />
              <Route path={ROUTES.ADMIN_SUBSCRIPTION_PLANS} element={<SubscriptionPlans />} />
              <Route path={ROUTES.ADMIN_USERS} element={<Users />} />
              <Route path={ROUTES.ADMIN_REPORTS} element={<Reports />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<AuditLogs />} />
              <Route path={ROUTES.ADMIN_SETTINGS} element={<Settings />} />
              <Route path={ROUTES.ADMIN_PROFILE} element={<Profile />} />
            </Route>
          </Route>

          {/* Agency Owner & HR — /agency/* */}
          <Route element={<RoleRoute allowedRoles={[ROLES.AGENCY_OWNER, ROLES.HR]} />}>
            <Route path={ROUTES.AGENCY_ASSESSMENTS_PRINT} element={<AssessmentPrintPage />} />
            <Route path={ROUTES.AGENCY_ASSESSMENTS_PRINT_DRAFT} element={<AssessmentPrintPage />} />
            <Route path={ROUTES.AGENCY_CARE_PLANS_PRINT} element={<CarePlanPrintPage />} />
            <Route path={ROUTES.AGENCY_CARE_PLANS_PRINT_DRAFT} element={<CarePlanPrintPage />} />
            <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_PRINT} element={<InsuranceIntakePrintPage />} />
            <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_PRINT_DRAFT} element={<InsuranceIntakePrintPage />} />
            <Route path={ROUTES.AGENCY_EVV_ENROLLMENT_PRINT} element={<EvvEnrollmentPrintPage />} />
            <Route path={ROUTES.AGENCY_CANDIDATE_FORM_PRINT} element={<CandidateFormPrintPage />} />
            <Route path={ROUTES.AGENCY_INTERVIEW_FEEDBACK_PRINT} element={<InterviewFeedbackPrintPage />} />
            <Route path={ROUTES.AGENCY_PREFIX} element={<Navigate to={ROUTES.AGENCY_DASHBOARD} replace />} />
            <Route element={<AgencyLayout />}>
              <Route path={ROUTES.AGENCY_DASHBOARD} element={<AgencyDashboard />} />
              <Route path={ROUTES.AGENCY_CLIENTS} element={<Clients />} />
              <Route path={ROUTES.AGENCY_CLIENTS_INTAKE} element={<ClientIntake />} />
              <Route path={ROUTES.AGENCY_CLIENTS_EDIT} element={<ClientIntake />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE} element={<InsuranceIntakes />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_CREATE} element={<ClientInsuranceIntakeForm />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_EDIT} element={<ClientInsuranceIntakeForm />} />
              <Route path={ROUTES.AGENCY_LEADS} element={<Leads />} />
              <Route path={ROUTES.AGENCY_LEADS_CREATE} element={<LeadFormPage />} />
              <Route path={ROUTES.AGENCY_LEADS_EDIT} element={<LeadFormPage />} />
              <Route path={ROUTES.AGENCY_LEADS_DETAIL} element={<LeadFormPage />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS} element={<Assessments />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS_CREATE} element={<ClientAssessmentForm />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS_EDIT} element={<ClientAssessmentForm />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS} element={<CarePlans />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS_CREATE} element={<GenerateCarePlan />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS_EDIT} element={<GenerateCarePlan />} />
              <Route path={ROUTES.AGENCY_SERVICE_NOTES} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_MEDICATIONS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_EMAR} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SCHEDULE} element={<Schedules />} />
              <Route path={ROUTES.AGENCY_VISIT_CALENDAR} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SHIFT_MANAGEMENT} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_TIME_ATTENDANCE} element={<AgencyModulePage />} />
              <Route path="/agency/evv" element={<Navigate to={ROUTES.AGENCY_EVV_DASHBOARD} replace />} />
              <Route path="/agency/evv-enrollments" element={<Navigate to={ROUTES.AGENCY_EVV_ENROLLMENTS} replace />} />
              <Route path={ROUTES.AGENCY_EVV_DASHBOARD} element={<EvvDashboard />} />
              <Route path={ROUTES.AGENCY_EVV_LOGS} element={<EvvLogs />} />
              <Route path={ROUTES.AGENCY_EVV_EXCEPTIONS} element={<EvvExceptions />} />
              <Route path={ROUTES.AGENCY_EVV_UNVERIFIED} element={<EvvUnverified />} />
              <Route path={ROUTES.AGENCY_EVV_ENROLLMENTS} element={<EvvEnrollments />} />
              <Route path={ROUTES.AGENCY_EVV_ENROLLMENTS_REVIEW} element={<EvvEnrollmentReview />} />
              <Route path={ROUTES.AGENCY_EVV_SETTINGS} element={<EvvSettings />} />
              <Route path={ROUTES.AGENCY_CAREGIVERS} element={<Caregivers />} />
              <Route path={ROUTES.AGENCY_CAREGIVER_MATCHING} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_TASKS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_INCIDENTS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_REPORTS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_USERS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_ROLES} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SETTINGS} element={<Profile />} />
              <Route path={ROUTES.AGENCY_PROFILE} element={<Profile />} />
              <Route path={ROUTES.AGENCY_BILLING} element={<ClientInvoices />} />
              <Route path={ROUTES.AGENCY_HR_STAFF} element={<HrStaff />} />
              <Route path={ROUTES.AGENCY_HR_STAFF_DETAIL} element={<HrStaffDetail />} />
              <Route path={ROUTES.AGENCY_HIRING_PIPELINE} element={<HiringPipeline />} />
              <Route path={ROUTES.AGENCY_JOBS} element={<Jobs />} />
              <Route path={ROUTES.AGENCY_JOBS_CREATE} element={<CreateJob />} />
              <Route path={ROUTES.AGENCY_JOBS_EDIT} element={<EditJob />} />
              <Route path={ROUTES.AGENCY_CANDIDATES} element={<Candidates />} />
            </Route>
          </Route>

          {/* Caregiver portal — /caregiver/* */}
          <Route element={<RoleRoute allowedRoles={[ROLES.CAREGIVER]} />}>
            <Route path={ROUTES.CAREGIVER_EVV_ENROLLMENT_PRINT} element={<EvvEnrollmentPrintPage />} />
            <Route path={ROUTES.CAREGIVER_PREFIX} element={<Navigate to={ROUTES.CAREGIVER_DASHBOARD} replace />} />
            <Route element={<CaregiverLayout />}>
              <Route path={ROUTES.CAREGIVER_DASHBOARD} element={<CaregiverDashboard />} />
              <Route path={ROUTES.CAREGIVER_EVV_ENROLLMENTS} element={<CaregiverEvvEnrollments />} />
              <Route path={ROUTES.CAREGIVER_EVV_ENROLLMENT_FORM} element={<CaregiverEvvEnrollmentForm />} />
              <Route path={ROUTES.CAREGIVER_JOBS} element={<CaregiverJobs />} />
              <Route path="/caregiver/jobs" element={<Navigate to={ROUTES.CAREGIVER_JOBS} replace />} />
              <Route path={ROUTES.CAREGIVER_VISITS} element={<CaregiverVisitLogs />} />
              <Route path={ROUTES.CAREGIVER_CLIENTS} element={<CaregiverModulePage />} />
              <Route path={ROUTES.CAREGIVER_MESSAGES} element={<CaregiverModulePage />} />
              <Route path={ROUTES.CAREGIVER_ALERTS} element={<CaregiverModulePage />} />
              <Route path={ROUTES.CAREGIVER_CLOCK} element={<CaregiverClock />} />
              <Route path={ROUTES.CAREGIVER_LEAVES} element={<CaregiverLeaves />} />
              <Route path={ROUTES.CAREGIVER_DOCUMENTS} element={<CaregiverModulePage />} />
              <Route path={ROUTES.CAREGIVER_SUMMARY} element={<CaregiverSummary />} />
              <Route path={ROUTES.CAREGIVER_PAYMENTS} element={<CaregiverPayments />} />
              <Route path="/caregiver/payments" element={<Navigate to={ROUTES.CAREGIVER_PAYMENTS} replace />} />
              <Route path={ROUTES.CAREGIVER_TRAINING} element={<CaregiverModulePage />} />
              <Route path={ROUTES.CAREGIVER_SETTINGS} element={<Profile />} />
              <Route path={ROUTES.CAREGIVER_PROFILE} element={<Profile />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RegistrationLayout />}>
          <Route path={ROUTES.REGISTRATION_AGENCY_INFO} element={<AgencyInformation />} />
          <Route path={ROUTES.REGISTRATION_CREATE_ACCOUNT} element={<CreateAccount />} />
          <Route path={ROUTES.REGISTRATION_CONFIRMATION} element={<RegistrationConfirmation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
