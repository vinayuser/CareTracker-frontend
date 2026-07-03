import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes/routes';
import { ROLES } from './constants/roles';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import PublicRoute from './components/auth/PublicRoute';
import AdminLayout from './components/layout/AdminLayout';
import AgencyLayout from './components/layout/agency/AgencyLayout';
import CaregiverLayout from './components/layout/caregiver/CaregiverLayout';
import RegistrationLayout from './components/layout/RegistrationLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Agencies from './pages/admin/Agencies';
import Invitations from './pages/admin/Invitations';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';
import Users from './pages/admin/Users';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import AgencyDashboard from './pages/agency/Dashboard';
import AgencyModulePage from './pages/agency/AgencyModulePage';
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
import Assessments from './pages/agency/assessments/Assessments';
import ClientAssessmentForm from './pages/agency/assessments/ClientAssessmentForm';
import AssessmentPrintPage from './pages/agency/assessments/AssessmentPrintPage';
import CarePlans from './pages/agency/care-plans/CarePlans';
import GenerateCarePlan from './pages/agency/care-plans/GenerateCarePlan';
import CarePlanPrintPage from './pages/agency/care-plans/CarePlanPrintPage';
import InsuranceIntakes from './pages/agency/insurance-intake/InsuranceIntakes';
import ClientInsuranceIntakeForm from './pages/agency/insurance-intake/ClientInsuranceIntakeForm';
import InsuranceIntakePrintPage from './pages/agency/insurance-intake/InsuranceIntakePrintPage';
import CaregiverDashboard from './pages/caregiver/Dashboard';
import CaregiverJobs from './pages/caregiver/Jobs';
import CaregiverClock from './pages/caregiver/Clock';
import CaregiverLeaves from './pages/caregiver/Leaves';
import CaregiverSummary from './pages/caregiver/Summary';
import CaregiverPayments from './pages/caregiver/Payments';
import RegisterEntry from './pages/registration/RegisterEntry';
import AgencyInformation from './pages/registration/AgencyInformation';
import CreateAccount from './pages/registration/CreateAccount';
import RegistrationConfirmation from './pages/registration/RegistrationConfirmation';
import { getHomeRouteForRole, getUserRole } from './utils/auth';

function HomeRedirect() {
  const role = getUserRole();
  if (role) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
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

        <Route path={ROUTES.REGISTRATION_ENTRY} element={<RegisterEntry />} />

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
            <Route path={ROUTES.AGENCY_PREFIX} element={<Navigate to={ROUTES.AGENCY_DASHBOARD} replace />} />
            <Route element={<AgencyLayout />}>
              <Route path={ROUTES.AGENCY_DASHBOARD} element={<AgencyDashboard />} />
              <Route path={ROUTES.AGENCY_CLIENTS} element={<Clients />} />
              <Route path={ROUTES.AGENCY_CLIENTS_INTAKE} element={<ClientIntake />} />
              <Route path={ROUTES.AGENCY_CLIENTS_EDIT} element={<ClientIntake />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE} element={<InsuranceIntakes />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_CREATE} element={<ClientInsuranceIntakeForm />} />
              <Route path={ROUTES.AGENCY_INSURANCE_INTAKE_EDIT} element={<ClientInsuranceIntakeForm />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS} element={<Assessments />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS_CREATE} element={<ClientAssessmentForm />} />
              <Route path={ROUTES.AGENCY_ASSESSMENTS_EDIT} element={<ClientAssessmentForm />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS} element={<CarePlans />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS_CREATE} element={<GenerateCarePlan />} />
              <Route path={ROUTES.AGENCY_CARE_PLANS_EDIT} element={<GenerateCarePlan />} />
              <Route path={ROUTES.AGENCY_SERVICE_NOTES} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_MEDICATIONS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_EMAR} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SCHEDULE} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_VISIT_CALENDAR} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SHIFT_MANAGEMENT} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_TIME_ATTENDANCE} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_CAREGIVERS} element={<Caregivers />} />
              <Route path={ROUTES.AGENCY_CAREGIVER_MATCHING} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_TASKS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_INCIDENTS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_REPORTS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_USERS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_ROLES} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_SETTINGS} element={<AgencyModulePage />} />
              <Route path={ROUTES.AGENCY_BILLING} element={<AgencyModulePage />} />
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
            <Route path={ROUTES.CAREGIVER_PREFIX} element={<Navigate to={ROUTES.CAREGIVER_DASHBOARD} replace />} />
            <Route element={<CaregiverLayout />}>
              <Route path={ROUTES.CAREGIVER_DASHBOARD} element={<CaregiverDashboard />} />
              <Route path={ROUTES.CAREGIVER_JOBS} element={<CaregiverJobs />} />
              <Route path={ROUTES.CAREGIVER_CLOCK} element={<CaregiverClock />} />
              <Route path={ROUTES.CAREGIVER_LEAVES} element={<CaregiverLeaves />} />
              <Route path={ROUTES.CAREGIVER_SUMMARY} element={<CaregiverSummary />} />
              <Route path={ROUTES.CAREGIVER_PAYMENTS} element={<CaregiverPayments />} />
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
