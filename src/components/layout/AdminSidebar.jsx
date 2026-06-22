import {
  LayoutDashboard,
  Building2,
  Mail,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import CareTrackerLogo from '../brand/CareTrackerLogo';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ADMIN_NAV_ITEMS, ROUTES } from '../../routes/routes';
import { logout as reduxLogout } from '../../redux/slices/authSlice';
import { logout } from '../../utils/auth';

const iconMap = {
  LayoutDashboard,
  Building2,
  Mail,
  CreditCard,
  Users,
  BarChart3,
  FileText,
  Settings,
};

export default function AdminSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };
  return (
    <aside
      className={`flex shrink-0 flex-col bg-sidebar text-white transition-[width] duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center border-b border-white/10 py-5 ${
          collapsed ? 'justify-center px-2' : 'gap-3 px-6'
        }`}
      >
        <CareTrackerLogo
          size="sm"
          showWordmark={!collapsed}
          tagline={!collapsed ? 'Admin Panel' : undefined}
          light
        />
      </div>

      <nav className={`flex-1 space-y-1 py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {ADMIN_NAV_ITEMS.map(({ key, label, icon }) => {
          const Icon = iconMap[icon];
          return (
            <NavLink
              key={key}
              to={ROUTES[key]}
              end={key === 'ADMIN_INVITATIONS'}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 ${collapsed ? 'p-2' : 'p-4'} space-y-1`}>
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex w-full items-center rounded-lg text-sm font-medium text-white/70 transition-colors hover:bg-sidebar-hover hover:text-white ${
            collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`flex w-full items-center rounded-lg text-sm font-medium text-white/70 transition-colors hover:bg-sidebar-hover hover:text-white ${
            collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
