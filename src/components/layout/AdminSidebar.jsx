import {
  LayoutDashboard,
  Building2,
  Mail,
  Users,
  UserCog,
  Shield,
  HeartHandshake,
  UserCheck,
  CalendarClock,
  ShieldCheck,
  Landmark,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  MessagesSquare,
  Megaphone,
  Share2,
  Contact,
  BarChart3,
  FileText,
  Puzzle,
  Ticket,
  Newspaper,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
} from 'lucide-react';
import CareTrackerLogo from '../brand/CareTrackerLogo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ADMIN_NAV_GROUPS, ROUTES } from '../../routes/routes';
import { logout as reduxLogout } from '../../redux/slices/authSlice';
import { logout, getUserRole } from '../../utils/auth';
import { filterAdminNavGroups } from '../../utils/adminModuleAccess';

const iconMap = {
  LayoutDashboard,
  Building2,
  Mail,
  Users,
  UserCog,
  Shield,
  HeartHandshake,
  UserCheck,
  CalendarClock,
  ShieldCheck,
  Landmark,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  MessagesSquare,
  Megaphone,
  Share2,
  Contact,
  BarChart3,
  FileText,
  Puzzle,
  Ticket,
  Newspaper,
  Settings,
};

function NavItem({ item, collapsed }) {
  const Icon = iconMap[item.icon] || LayoutDashboard;
  return (
    <NavLink
      to={ROUTES[item.key]}
      end={item.key === 'ADMIN_DASHBOARD' || item.key === 'ADMIN_INVITATIONS'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center rounded-lg text-[13px] font-medium transition-colors ${
          collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-3 py-2'
        } ${
          isActive
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      <Icon size={17} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function AdminSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navGroups = filterAdminNavGroups(getUserRole());

  const handleLogout = () => {
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <div
        className={`flex items-center border-b border-gray-100 py-4 ${
          collapsed ? 'justify-center px-2' : 'gap-3 px-5'
        }`}
      >
        <CareTrackerLogo
          size="sm"
          showWordmark={!collapsed}
          tagline={!collapsed ? 'Track. Manage. Care.' : undefined}
        />
      </div>

      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
        {navGroups.map((group, idx) => (
          <div key={group.title || `g-${idx}`} className={idx === 0 ? '' : 'mt-3'}>
            {!collapsed && group.title ? (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            ) : null}
            {collapsed && idx > 0 ? <div className="mx-2 mb-2 border-t border-gray-100" /> : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.key} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-gray-100 ${collapsed ? 'p-2' : 'p-3'} space-y-1`}>
        {!collapsed ? (
          <div className="mb-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CircleCheck size={14} />
              All Systems Operational
            </div>
            <p className="mt-0.5 text-[11px] text-emerald-600">Uptime: 99.97%</p>
          </div>
        ) : (
          <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-emerald-500" title="All systems operational" />
        )}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex w-full items-center rounded-lg text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${
            collapsed ? 'justify-center py-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${
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
