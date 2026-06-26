import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AgencySidebar from './AgencySidebar';
import AgencyHeader from './AgencyHeader';

const SIDEBAR_KEY = 'caretracker_agency_sidebar_collapsed';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  assessments: 'Assessments',
  'care-plans': 'Care Plans',
  'service-notes': 'Service Notes',
  medications: 'Medications',
  emar: 'eMAR',
  schedule: 'Schedule',
  'visit-calendar': 'Visit Calendar',
  'shift-management': 'Shift Management',
  'time-attendance': 'Time & Attendance',
  caregivers: 'Caregivers',
  'caregiver-matching': 'Caregiver Matching',
  tasks: 'Tasks',
  incidents: 'Incidents',
  reports: 'Reports',
  users: 'Users',
  roles: 'Roles & Permissions',
  settings: 'Settings',
  billing: 'Billing & Invoices',
  hr: 'Human Resources',
  staff: 'HR Staff',
};

function getPageTitle(pathname) {
  if (pathname.includes('/agency/hr/staff/') && !pathname.endsWith('/staff')) {
    return 'HR Profile';
  }
  if (pathname.includes('/agency/clients/intake')) return 'Client Intake';
  if (pathname.includes('/agency/clients/') && pathname.endsWith('/edit')) return 'Edit Client';
  if (pathname.includes('/agency/care-plans/create')) return 'Create Care Plan';
  if (pathname.includes('/agency/care-plans/') && pathname.endsWith('/edit')) return 'Edit Care Plan';
  const segment = pathname.split('/').pop();
  return PAGE_TITLES[segment] ?? 'Agency Portal';
}

export default function AgencyLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <AgencySidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AgencyHeader
          onToggleSidebar={() => setCollapsed((p) => !p)}
          title={getPageTitle(pathname)}
        />
        <main className="flex-1 overflow-y-auto bg-[#f0f4f8] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
