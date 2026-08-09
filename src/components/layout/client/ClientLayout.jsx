import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ClientSidebar from './ClientSidebar';
import ClientHeader from './ClientHeader';
import { fetchClientDashboard } from '../../../redux/slices/clientPortalSlice';

const TITLES = {
  dashboard: 'Dashboard',
  'care-plans': 'My Care Plan',
  schedule: 'My Schedule',
  caregivers: 'My Caregivers',
  'evv-enrollments': 'EVV Enrollment',
  'evv-visits': 'EVV Visits',
  messages: 'Messages',
  documents: 'Documents',
  medications: 'Medications',
  invoices: 'Invoices & Payments',
  profile: 'My Profile',
  help: 'Help & Support',
};

export default function ClientLayout() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  const title = TITLES[last]
    || (segments.includes('evv-enrollments') ? 'EVV Enrollment'
      : segments.includes('care-plans') ? 'My Care Plan'
        : 'Client Portal');

  useEffect(() => {
    dispatch(fetchClientDashboard());
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
      <div className={`fixed inset-y-0 left-0 z-40 lg:static lg:block ${mobileNav ? 'block' : 'hidden'}`}>
        <ClientSidebar />
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
        <ClientHeader title={title} onMenuClick={() => setMobileNav(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
