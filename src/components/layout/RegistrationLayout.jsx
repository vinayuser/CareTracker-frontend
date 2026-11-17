import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import RegistrationSidebar from './RegistrationSidebar';
import RegistrationHeader from './RegistrationHeader';
import Footer from './Footer';
import { REGISTRATION_STEPS, ROUTES } from '../../routes/routes';
import { scrollAppToTop } from '../../utils/scrollAppToTop';

function getCurrentStep(pathname) {
  const step = REGISTRATION_STEPS.find(({ key }) => ROUTES[key] === pathname);
  return step?.step ?? 1;
}

export default function RegistrationLayout() {
  const { pathname } = useLocation();
  const currentStep = getCurrentStep(pathname);

  useEffect(() => {
    scrollAppToTop('auto');
  }, [pathname]);

  return (
    <div className="flex h-screen max-w-[100vw] overflow-hidden bg-page-bg">
      <div className="hidden lg:flex">
        <RegistrationSidebar currentStep={currentStep} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <RegistrationHeader currentStep={currentStep} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
        <Footer variant="registration" />
      </div>
    </div>
  );
}
