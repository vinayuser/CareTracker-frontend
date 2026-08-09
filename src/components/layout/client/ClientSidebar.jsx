import {
  LayoutDashboard, ClipboardList, Calendar, HeartHandshake, MapPinned,
  MessageSquare, FolderOpen, Pill, CreditCard, UserRound, CircleHelp,
  LogOut, Phone, Mail, Clock, Smartphone,
} from 'lucide-react';
import CareTrackerLogo from '../../brand/CareTrackerLogo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CLIENT_NAV_ITEMS } from '../../../routes/clientNav';
import { ROUTES } from '../../../routes/routes';
import { logout as reduxLogout } from '../../../redux/slices/authSlice';
import { logout } from '../../../utils/auth';

const iconMap = {
  Home: LayoutDashboard,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  HeartHandshake,
  MapPin: MapPinned,
  MapPinned,
  Smartphone,
  MessageSquare,
  FolderOpen,
  Pill,
  CreditCard,
  User: UserRound,
  UserRound,
  HelpCircle: CircleHelp,
  CircleHelp,
};

export default function ClientSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dashboard = useSelector((s) => s.clientPortal.dashboard);

  const handleLogout = () => {
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-5">
        <CareTrackerLogo size="md" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-2">
        {CLIENT_NAV_ITEMS.map(({ key, label, icon, badgeKey }) => {
          const Icon = iconMap[icon] || LayoutDashboard;
          const badge = badgeKey ? Number(dashboard?.[badgeKey] || 0) : 0;
          return (
            <NavLink
              key={key}
              to={ROUTES[key]}
              end={key === 'CLIENT_DASHBOARD'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    }`}>
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Logout
        </button>
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3.5">
          <p className="text-sm font-semibold text-gray-900">Need Help?</p>
          <p className="mt-2.5 flex items-center gap-2 text-xs text-gray-700">
            <Phone size={13} strokeWidth={2} className="text-primary" />
            {dashboard?.agency?.phone || '(888) 123-4567'}
          </p>
          <p className="mt-1.5 flex items-center gap-2 truncate text-xs text-gray-700">
            <Mail size={13} strokeWidth={2} className="text-primary" />
            {dashboard?.agency?.email || 'support@caretraker.com'}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
            <Clock size={13} strokeWidth={2} className="text-primary" />
            Mon–Fri, 8am–6pm
          </p>
        </div>
      </div>
    </aside>
  );
}
