import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { logout as reduxLogout } from '../../redux/slices/authSlice';
import { getAuthUser, getUserRole, logout } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';
import { ROLE_LABELS, ROLES, normalizeRole } from '../../constants/roles';

function getProfileRoute(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.SUPER_ADMIN) return ROUTES.ADMIN_PROFILE;
  if (normalized === ROLES.CAREGIVER) return ROUTES.CAREGIVER_PROFILE;
  return ROUTES.AGENCY_PROFILE;
}

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function UserMenuDropdown({
  subtitle,
  avatarUrl = null,
  showName = true,
  className = '',
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authFromStore = useSelector((state) => state.auth.user);
  const authUser = authFromStore || getAuthUser();
  const role = normalizeRole(authUser?.role) || getUserRole();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const name = authUser?.name || authUser?.fullName || 'User';
  const email = authUser?.email || '';
  const roleLabel = ROLE_LABELS[role] || 'User';
  const secondary = subtitle || (email ? email : roleLabel);
  const initials = initialsFromName(name);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    dispatch(reduxLogout());
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleProfile = () => {
    setOpen(false);
    navigate(getProfileRoute(role));
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg border border-transparent py-1 pl-1 pr-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50 sm:pr-2"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white ring-2 ring-primary/15">
            {initials}
          </div>
        )}
        {showName && (
          <div className="hidden min-w-0 text-left md:block">
            <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
            <p className="truncate text-xs text-gray-500">{secondary}</p>
          </div>
        )}
        <ChevronDown
          size={15}
          className={`hidden shrink-0 text-gray-400 transition-transform md:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
            {email ? <p className="truncate text-xs text-gray-500">{email}</p> : null}
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
              {roleLabel}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleProfile}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <User size={16} className="text-gray-400" />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
