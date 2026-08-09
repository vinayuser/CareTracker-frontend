import { useLocation } from 'react-router-dom';

const TITLES = {
  schedule: 'My Schedule',
  caregivers: 'My Caregivers',
  'evv-visits': 'EVV Visits',
  messages: 'Messages',
  documents: 'Documents',
  medications: 'Medications',
  invoices: 'Invoices & Payments',
  help: 'Help & Support',
};

export default function ClientModulePage() {
  const { pathname } = useLocation();
  const key = pathname.split('/').pop();
  // schedule has a dedicated page; keep map for any leftover links
  const title = TITLES[key] || 'Coming soon';

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        This section will show live data from your agency. More detail is coming next.
      </p>
    </div>
  );
}
