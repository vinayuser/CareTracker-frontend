import { Outlet, useLocation } from 'react-router-dom';
import RegistrationSidebar from './RegistrationSidebar';
import RegistrationHeader from './RegistrationHeader';
import Footer from './Footer';
import { REGISTRATION_STEPS, ROUTES } from '../../routes/routes';

function getCurrentStep(pathname) {
  const step = REGISTRATION_STEPS.find(({ key }) => ROUTES[key] === pathname);
  return step?.step ?? 1;
}

export default function RegistrationLayout() {
  const { pathname } = useLocation();
  const currentStep = getCurrentStep(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-page-bg">
      <RegistrationSidebar currentStep={currentStep} />
      <div className="flex min-w-0 flex-1 flex-col">
        <RegistrationHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
        <Footer variant="registration" />
      </div>
    </div>
  );
}
