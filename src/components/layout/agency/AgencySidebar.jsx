import {
  LayoutDashboard,
  Users,
  ClipboardList,
  HeartHandshake,
  FileText,
  Pill,
  Tablets,
  Calendar,
  CalendarDays,
  Clock,
  Timer,
  UserCheck,
  GitMerge,
  GitBranch,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  UserCog,
  Shield,
  Settings,
  Receipt,
  Briefcase,
  LogOut,
  Home,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ROUTES } from '../../../routes/routes';
import { logout as reduxLogout } from '../../../redux/slices/authSlice';
import { logout } from '../../../utils/auth';
import { filterAgencyNavGroups } from '../../../utils/moduleAccess';

const iconMap = {
  LayoutDashboard,
  Users,
  ClipboardList,
  HeartHandshake,
  FileText,
  Pill,
  Tablets,
  Calendar,
  CalendarDays,
  Clock,
  Timer,
  UserCheck,
  GitMerge,
  GitBranch,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  UserCog,
  Shield,
  Settings,
  Receipt,
  Briefcase,
};

import CareTrackerLogo from '../../brand/CareTrackerLogo';

export default function AgencySidebar({ collapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navGroups = filterAgencyNavGroups();

  const handleLogout = () => {
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside
      className={`flex min-h-0 shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      <div
        className={`flex h-[60px] items-center border-b border-gray-100 ${
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
        }`}
      >
        <CareTrackerLogo size={collapsed ? 'sm' : 'md'} showWordmark={!collapsed} />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-3 pb-4">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title ?? groupIndex} className={groupIndex > 0 ? 'mt-3' : ''}>
            {group.title && !collapsed && (
              <p className="mb-1.5 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            )}
            <div className={`space-y-0.5 ${collapsed ? 'px-1.5' : 'px-2'}`}>
              {group.items.map(({ key, label, icon }) => {
                const Icon = iconMap[icon] ?? Home;
                return (
                  <NavLink
                    key={key}
                    to={ROUTES[key]}
                    end={key === 'AGENCY_DASHBOARD'}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg text-[13px] font-medium transition-colors ${
                        collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-[#0055d4] text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={17} className="shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-gray-100 ${collapsed ? 'p-1.5' : 'p-2'}`}>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg text-[13px] font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 ${
            collapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
