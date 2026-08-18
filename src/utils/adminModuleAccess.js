import { ROLES, normalizeRole } from '../constants/roles';
import {
  ADMIN_ASSIGNABLE_MODULES,
  DEFAULT_ADMIN_MODULES,
  OWNER_ONLY_MODULES,
  isSuperAdminRole,
} from '../constants/adminModules';
import { ADMIN_NAV_GROUPS } from '../routes/adminNav';
import { ROUTES } from '../routes/routes';
import { getAuthUser, getUserRole } from './auth';

export function getAdminModuleAccess(user = getAuthUser()) {
  if (!user?.moduleAccess?.length) return [...DEFAULT_ADMIN_MODULES];
  const allowed = user.moduleAccess.filter((key) => ADMIN_ASSIGNABLE_MODULES.includes(key));
  return allowed.length ? allowed : [...DEFAULT_ADMIN_MODULES];
}

export function isPlatformSuperAdmin(role = getUserRole()) {
  return isSuperAdminRole(normalizeRole(role));
}

export function getAllowedAdminModuleKeys(role = getUserRole(), user = getAuthUser()) {
  if (isPlatformSuperAdmin(role)) {
    return [...new Set([...ADMIN_ASSIGNABLE_MODULES, ...OWNER_ONLY_MODULES])];
  }
  if (normalizeRole(role) === ROLES.ADMIN) {
    return getAdminModuleAccess(user);
  }
  return [];
}

export function getModuleKeyForAdminPath(pathname) {
  const entries = [...ADMIN_ASSIGNABLE_MODULES, ...OWNER_ONLY_MODULES]
    .map((key) => ({ key, path: ROUTES[key] }))
    .filter((entry) => typeof entry.path === 'string' && entry.path.startsWith('/admin'))
    .sort((a, b) => b.path.length - a.path.length);

  const match = entries.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  return match?.key || null;
}

export function canAccessAdminModule(pathname, role = getUserRole(), user = getAuthUser()) {
  if (isPlatformSuperAdmin(role)) return true;
  if (normalizeRole(role) !== ROLES.ADMIN) return false;

  const moduleKey = getModuleKeyForAdminPath(pathname);
  if (!moduleKey) return pathname === ROUTES.ADMIN_PROFILE;
  if (OWNER_ONLY_MODULES.includes(moduleKey)) return false;
  return getAdminModuleAccess(user).includes(moduleKey);
}

export function filterAdminNavGroups(role = getUserRole(), user = getAuthUser()) {
  if (isPlatformSuperAdmin(role)) return ADMIN_NAV_GROUPS;

  const allowed = new Set(
    normalizeRole(role) === ROLES.ADMIN ? getAdminModuleAccess(user) : [],
  );

  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.key)),
  })).filter((group) => group.items.length > 0);
}

export function getHomeRouteForAdmin(user = getAuthUser(), role = getUserRole()) {
  if (isPlatformSuperAdmin(role)) return ROUTES.ADMIN_DASHBOARD;
  const allowed = getAdminModuleAccess(user);
  if (allowed.includes('ADMIN_DASHBOARD')) return ROUTES.ADMIN_DASHBOARD;
  const firstKey = allowed[0];
  return firstKey ? ROUTES[firstKey] : ROUTES.ADMIN_DASHBOARD;
}
