import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CaregiverSidebar from './CaregiverSidebar';
import CaregiverHeader from './CaregiverHeader';

const TITLES = {
  dashboard: 'Home',
  jobs: 'My Jobs',
  clock: 'Time Clock',
  leaves: 'Leaves',
  summary: 'Work Summary',
  payments: 'Payments',
};

export default function CaregiverLayout() {
  const { pathname } = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const title = TITLES[pathname.split('/').pop()] ?? 'Caregiver';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <div className={`fixed inset-y-0 left-0 z-40 lg:static lg:block ${mobileNav ? 'block' : 'hidden'}`}>
        <CaregiverSidebar />
      </div>
      {mobileNav && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <CaregiverHeader title={title} onMenuClick={() => setMobileNav(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
