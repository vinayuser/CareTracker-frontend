import { useEffect, useState } from 'react';
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
  CalendarClock,
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
  Smartphone,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../../../routes/routes';
import { logout as reduxLogout } from '../../../redux/slices/authSlice';
import { logout, getUserRole } from '../../../utils/auth';
import { normalizeRole } from '../../../constants/roles';
import { filterAgencyNavGroups, getHrModuleAccess, isAgencyOwner } from '../../../utils/moduleAccess';
import CareTrackerLogo from '../../brand/CareTrackerLogo';

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
  CalendarClock,
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
  Smartphone,
  ShieldCheck,
};

function canShowEvvGroup(item, role) {
  if (isAgencyOwner(role)) return true;
  const allowed = new Set(getHrModuleAccess());
  return (item.moduleKeys || []).some((key) => allowed.has(key));
}

function canShowChild(key, role) {
  if (isAgencyOwner(role)) return true;
  return getHrModuleAccess().includes(key);
}

function NavItem({ item, collapsed }) {
  const Icon = iconMap[item.icon] ?? Home;
  return (
    <NavLink
      to={ROUTES[item.key]}
      end={item.key === 'AGENCY_DASHBOARD'}
      title={collapsed ? item.label : undefined}
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
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

function EvvNavGroup({ item, collapsed }) {
  const location = useLocation();
  const role = getUserRole();
  const childRoutes = (item.children || [])
    .filter((child) => canShowChild(child.key, role))
    .map((child) => ROUTES[child.key]);
  const isEvvActive = childRoutes.some((path) => {
    const base = path.split('/:')[0];
    return location.pathname === base || location.pathname.startsWith(`${base}/`);
  });
  const [open, setOpen] = useState(isEvvActive);
  const Icon = iconMap[item.icon] ?? ShieldCheck;

  useEffect(() => {
    if (isEvvActive) setOpen(true);
  }, [isEvvActive]);

  if (collapsed) {
    return (
      <NavLink
        to={ROUTES.AGENCY_EVV_DASHBOARD}
        title={item.label}
        className={({ isActive }) =>
          `flex items-center justify-center rounded-lg px-0 py-2 text-[13px] font-medium transition-colors ${
            isActive || isEvvActive ? 'bg-[#0055d4] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`
        }
      >
        <Icon size={17} />
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
          isEvvActive ? 'bg-[#0055d4]/10 text-[#0055d4]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon size={17} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            {item.badge}
          </span>
        )}
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
          {(item.children || [])
            .filter((child) => canShowChild(child.key, role))
            .map((child) => (
              <NavLink
                key={child.key}
                to={ROUTES[child.key]}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0055d4] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
        </div>
      )}
    </div>
  );
}

export default function AgencySidebar({ collapsed }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authRole = useSelector((state) => state.auth.role);
  const authUser = useSelector((state) => state.auth.user);
  const role = normalizeRole(authRole) || getUserRole();
  const navGroups = filterAgencyNavGroups(role, authUser);

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
              {group.items.map((item) => {
                if (item.children?.length) {
                  if (!canShowEvvGroup(item, role)) return null;
                  return <EvvNavGroup key={item.key} item={item} collapsed={collapsed} />;
                }
                return <NavItem key={item.key} item={item} collapsed={collapsed} />;
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
