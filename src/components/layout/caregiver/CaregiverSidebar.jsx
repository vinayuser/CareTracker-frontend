import {
  Home,
  Briefcase,
  Clock,
  CalendarOff,
  BarChart3,
  Wallet,
  LogOut,
  Smartphone,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  GraduationCap,
} from 'lucide-react';
import CareTrackerLogo from '../../brand/CareTrackerLogo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CAREGIVER_NAV_ITEMS } from '../../../routes/caregiverNav';
import { ROUTES } from '../../../routes/routes';
import { logout as reduxLogout } from '../../../redux/slices/authSlice';
import { getAuthUser, logout } from '../../../utils/auth';

const iconMap = {
  Home,
  Briefcase,
  Clock,
  CalendarOff,
  BarChart3,
  Wallet,
  Smartphone,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  GraduationCap,
};

export default function CaregiverSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = getAuthUser();

  const handleLogout = () => {
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <CareTrackerLogo size="md" tagline="Caregiver Portal" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {CAREGIVER_NAV_ITEMS.map(({ key, label, icon, badge, badgeTone }) => {
          const Icon = iconMap[icon] ?? Home;
          return (
            <NavLink
              key={key}
              to={ROUTES[key]}
              end={key === 'CAREGIVER_DASHBOARD'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge != null && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  badgeTone === 'red'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3">
          <p className="text-xs font-semibold text-gray-900">CareTraker Caregiver App</p>
          <p className="mt-1 text-[10px] leading-relaxed text-gray-500">Clock in, view schedules, and verify visits on the go.</p>
          <div className="mt-3 flex h-16 items-center justify-center rounded-lg bg-white text-[10px] text-gray-400 ring-1 ring-gray-100">
            QR Code
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button type="button" className="rounded-md bg-gray-900 px-2 py-1 text-[9px] font-medium text-white">App Store</button>
            <button type="button" className="rounded-md bg-gray-900 px-2 py-1 text-[9px] font-medium text-white">Google Play</button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
