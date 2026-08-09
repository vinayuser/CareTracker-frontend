import { Menu, Bell, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../routes/routes';
import UserMenuDropdown from '../UserMenuDropdown';

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ClientHeader({ title, onMenuClick }) {
  const { pathname } = useLocation();
  const isDashboard = pathname === ROUTES.CLIENT_DASHBOARD;
  const dashboard = useSelector((s) => s.clientPortal.dashboard);
  const name = dashboard?.client?.preferredName || dashboard?.client?.fullName || 'Client';
  const messages = Number(dashboard?.unreadMessages || 0);
  const alerts = Number(dashboard?.unreadAlerts || 0);

  return (
    <header className="flex min-h-[72px] shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
        <Menu size={20} strokeWidth={1.75} />
      </button>

      {isDashboard ? (
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
            {greetingForNow()}, {name} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Here&apos;s your overview for today.</p>
        </div>
      ) : (
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link to={ROUTES.CLIENT_MESSAGES} className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Mail size={18} strokeWidth={1.75} />
          {messages > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {messages}
            </span>
          )}
        </Link>
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell size={18} strokeWidth={1.75} />
          {alerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {alerts}
            </span>
          )}
        </button>
        <UserMenuDropdown subtitle="Client Portal" showName />
      </div>
    </header>
  );
}
