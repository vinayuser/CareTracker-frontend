import { ROLES, normalizeRole } from '../constants/roles';
import {
  DEFAULT_HR_MODULES,
  HR_ASSIGNABLE_MODULES,
  OWNER_ONLY_MODULES,
} from '../constants/agencyModules';
import { AGENCY_NAV_GROUPS } from '../routes/agencyNav';
import { ROUTES } from '../routes/routes';
import { getAuthUser, getUserRole } from './auth';

/** Nested paths whose module base is not the ROUTES[moduleKey] prefix alone */
const PATH_MODULE_PREFIXES = [
  { prefix: '/agency/hr/staff', key: 'AGENCY_HR_STAFF' },
  { prefix: '/agency/hr/hiring-pipeline', key: 'AGENCY_HIRING_PIPELINE' },
  { prefix: '/agency/hr/jobs', key: 'AGENCY_JOBS' },
  { prefix: '/agency/hr/candidates', key: 'AGENCY_CANDIDATES' },
  { prefix: '/agency/insurance-intake', key: 'AGENCY_INSURANCE_INTAKE' },
  { prefix: '/agency/assessments', key: 'AGENCY_ASSESSMENTS' },
  { prefix: '/agency/care-plans', key: 'AGENCY_CARE_PLANS' },
  { prefix: '/agency/clients', key: 'AGENCY_CLIENTS' },
  { prefix: '/agency/schedule', key: 'AGENCY_SCHEDULE' },
  { prefix: '/agency/caregivers', key: 'AGENCY_CAREGIVERS' },
  { prefix: '/agency/evv/enrollments', key: 'AGENCY_EVV_ENROLLMENTS' },
  { prefix: '/agency/evv/logs', key: 'AGENCY_EVV_LOGS' },
  { prefix: '/agency/evv/exceptions', key: 'AGENCY_EVV_EXCEPTIONS' },
  { prefix: '/agency/evv/unverified', key: 'AGENCY_EVV_UNVERIFIED' },
  { prefix: '/agency/evv/settings', key: 'AGENCY_EVV_SETTINGS' },
  { prefix: '/agency/evv', key: 'AGENCY_EVV_DASHBOARD' },
  { prefix: '/agency/dashboard', key: 'AGENCY_DASHBOARD' },
];

const MODULE_ROUTE_KEYS = new Set([...HR_ASSIGNABLE_MODULES, ...OWNER_ONLY_MODULES]);

export function getHrModuleAccess(user = getAuthUser()) {
  if (!user?.moduleAccess?.length) return [...DEFAULT_HR_MODULES];
  const allowed = user.moduleAccess.filter((key) => HR_ASSIGNABLE_MODULES.includes(key));
  return allowed.length ? allowed : [...DEFAULT_HR_MODULES];
}

export function isAgencyOwner(role = getUserRole()) {
  return normalizeRole(role) === ROLES.AGENCY_OWNER;
}

export function getAllowedModuleKeys(role = getUserRole(), user = getAuthUser()) {
  if (isAgencyOwner(role)) {
    return HR_ASSIGNABLE_MODULES.filter((key) => !OWNER_ONLY_MODULES.includes(key));
  }
  if (normalizeRole(role) === ROLES.HR) {
    return getHrModuleAccess(user);
  }
  return [];
}

/**
 * Map any agency URL (index, create, edit, print) to its assignable module key.
 * Never return route keys like AGENCY_ASSESSMENTS_CREATE — those are not modules.
 */
export function getModuleKeyForPath(pathname) {
  const moduleBases = [...MODULE_ROUTE_KEYS]
    .map((key) => ({ key, path: ROUTES[key] }))
    .filter((entry) => typeof entry.path === 'string' && entry.path.startsWith('/agency'))
    .sort((a, b) => b.path.length - a.path.length);

  const baseMatch = moduleBases.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (baseMatch) return baseMatch.key;

  const prefixMatch = PATH_MODULE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix));
  return prefixMatch?.key ?? null;
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
    items: group.items.filter((item) => {
      if (item.children?.length) {
        return item.children.some((child) => allowed.has(child.key));
      }
      return allowed.has(item.key);
    }),
  })).filter((group) => group.items.length > 0);
}

export function getHomeRouteForHr(user = getAuthUser()) {
  const allowed = getHrModuleAccess(user);
  if (allowed.includes('AGENCY_DASHBOARD')) return ROUTES.AGENCY_DASHBOARD;

  const firstKey = allowed[0];
  return firstKey ? ROUTES[firstKey] : ROUTES.AGENCY_DASHBOARD;
}
