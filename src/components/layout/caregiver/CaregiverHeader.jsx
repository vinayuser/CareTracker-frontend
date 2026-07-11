import { Menu, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getAuthUser } from '../../../utils/auth';
import { ROUTES } from '../../../routes/routes';

export default function CaregiverHeader({ title, onMenuClick }) {
  const authUser = getAuthUser();
  const { pathname } = useLocation();
  const isDashboard = pathname === ROUTES.CAREGIVER_DASHBOARD;
  const initials = authUser?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'SW';

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
        <div className="flex items-center gap-2 rounded-lg border border-gray-100 py-1 pl-1 pr-2 hover:bg-gray-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-gray-900">{authUser?.name ?? 'Sarah Williams'}</p>
            <p className="text-xs text-gray-500">Caregiver</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
