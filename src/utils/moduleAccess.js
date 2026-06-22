import { ROLES, normalizeRole } from '../constants/roles';
import {
  DEFAULT_HR_MODULES,
  HR_ASSIGNABLE_MODULES,
  OWNER_ONLY_MODULES,
} from '../constants/agencyModules';
import { AGENCY_NAV_GROUPS } from '../routes/agencyNav';
import { ROUTES } from '../routes/routes';
import { getAuthUser, getUserRole } from './auth';

const PATH_MODULE_PREFIXES = [
  { prefix: '/agency/hr/staff', key: 'AGENCY_HR_STAFF' },
  { prefix: '/agency/hr/hiring-pipeline', key: 'AGENCY_HIRING_PIPELINE' },
  { prefix: '/agency/hr/jobs', key: 'AGENCY_JOBS' },
  { prefix: '/agency/hr/candidates', key: 'AGENCY_CANDIDATES' },
];

export function getHrModuleAccess(user = getAuthUser()) {
  if (!user?.moduleAccess?.length) return [...DEFAULT_HR_MODULES];
  return user.moduleAccess.filter((key) => HR_ASSIGNABLE_MODULES.includes(key));
}

export function isAgencyOwner(role = getUserRole()) {
  return normalizeRole(role) === ROLES.AGENCY_OWNER;
}

export function getAllowedModuleKeys(role = getUserRole(), user = getAuthUser()) {
  if (isAgencyOwner(role)) {
    return Object.keys(ROUTES).filter(
      (key) => key.startsWith('AGENCY_') && !OWNER_ONLY_MODULES.includes(key) || key === 'AGENCY_DASHBOARD'
    );
  }
  if (normalizeRole(role) === ROLES.HR) {
    return getHrModuleAccess(user);
  }
  return [];
}

export function getModuleKeyForPath(pathname) {
  const exact = Object.entries(ROUTES).find(([, path]) => path === pathname);
  if (exact) return exact[0];

  const prefixMatch = PATH_MODULE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix));
  if (prefixMatch) return prefixMatch.key;

  const agencyRoutes = Object.entries(ROUTES).filter(([key]) => key.startsWith('AGENCY_'));
  const sorted = agencyRoutes.sort((a, b) => b[1].length - a[1].length);
  const match = sorted.find(([, path]) => pathname.startsWith(path));
  return match ? match[0] : null;
}

export function canAccessAgencyModule(pathname, role = getUserRole(), user = getAuthUser()) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.AGENCY_OWNER) return true;
  if (normalized !== ROLES.HR) return false;

  const moduleKey = getModuleKeyForPath(pathname);
  if (!moduleKey) return true;
  if (OWNER_ONLY_MODULES.includes(moduleKey)) return false;

  return getHrModuleAccess(user).includes(moduleKey);
}

export function filterAgencyNavGroups(role = getUserRole(), user = getAuthUser()) {
  if (isAgencyOwner(role)) return AGENCY_NAV_GROUPS;

  const allowed = new Set(getHrModuleAccess(user));

  return AGENCY_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.key)),
  })).filter((group) => group.items.length > 0);
}

export function getHomeRouteForHr(user = getAuthUser()) {
  const allowed = getHrModuleAccess(user);
  if (allowed.includes('AGENCY_DASHBOARD')) return ROUTES.AGENCY_DASHBOARD;

  const firstKey = allowed[0];
  return firstKey ? ROUTES[firstKey] : ROUTES.AGENCY_DASHBOARD;
}
