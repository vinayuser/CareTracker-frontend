import {
  Home,
  Briefcase,
  Clock,
  CalendarOff,
  BarChart3,
  Wallet,
  LogOut,
} from 'lucide-react';
import CareTrackerLogo from '../../brand/CareTrackerLogo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CAREGIVER_NAV_ITEMS } from '../../../routes/caregiverNav';
import { ROUTES } from '../../../routes/routes';
import { logout as reduxLogout } from '../../../redux/slices/authSlice';
import { getAuthUser, logout } from '../../../utils/auth';

const iconMap = { Home, Briefcase, Clock, CalendarOff, BarChart3, Wallet };

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
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <CareTrackerLogo size="md" tagline="Caregiver Portal" />
      </div>

      <div className="border-b border-gray-100 px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">{authUser?.name ?? 'Caregiver'}</p>
        <p className="text-xs text-gray-500">{authUser?.agencyName ?? 'BrightCare Home Health'}</p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {CAREGIVER_NAV_ITEMS.map(({ key, label, icon }) => {
          const Icon = iconMap[icon];
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
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-danger"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
