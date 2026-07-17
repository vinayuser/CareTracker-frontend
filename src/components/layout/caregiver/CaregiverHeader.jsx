import { Menu, Bell, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import UserMenuDropdown from '../UserMenuDropdown';

export default function CaregiverHeader({ title, onMenuClick }) {
  const { pathname } = useLocation();
  const isDashboard = pathname === ROUTES.CAREGIVER_DASHBOARD;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
        <Menu size={20} />
      </button>
      {!isDashboard && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      <div className={`ml-auto flex items-center gap-2 ${isDashboard ? 'w-full justify-end' : ''}`}>
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <MessageSquare size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <UserMenuDropdown subtitle="Caregiver" />
      </div>
    </header>
  );
}
