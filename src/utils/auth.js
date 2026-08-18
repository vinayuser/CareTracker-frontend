import { normalizeRole, ROLES } from '../constants/roles';
import { ROUTES } from '../routes/routes';
import { canAccessAgencyModule, getHomeRouteForHr } from './moduleAccess';
import {
  canAccessAdminModule,
  getHomeRouteForAdmin,
  isPlatformSuperAdmin,
} from './adminModuleAccess';

export function isAuthenticated() {
  // Prefer live session from /auth/me; token alone is not enough
  return Boolean(localStorage.getItem('token') && localStorage.getItem('authUser'));
}

export function getAuthUser() {
  try {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function getUserRole() {
  return normalizeRole(getAuthUser()?.role);
}

export function getRoutePrefixForRole(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return ROUTES.ADMIN_PREFIX;
    case ROLES.AGENCY_OWNER:
    case ROLES.HR:
      return ROUTES.AGENCY_PREFIX;
    case ROLES.CAREGIVER:
      return ROUTES.CAREGIVER_PREFIX;
    case ROLES.CLIENT:
      return ROUTES.CLIENT_PREFIX;
    default:
      return null;
  }
}

export function getHomeRouteForRole(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return getHomeRouteForAdmin();
    case ROLES.AGENCY_OWNER:
      return ROUTES.AGENCY_DASHBOARD;
    case ROLES.HR:
      return getHomeRouteForHr();
    case ROLES.CAREGIVER:
      return ROUTES.CAREGIVER_DASHBOARD;
    case ROLES.CLIENT:
      return ROUTES.CLIENT_DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
}

export function canAccessPath(pathname, role) {
  const normalized = normalizeRole(role);
  if (!normalized) return pathname === ROUTES.LOGIN;

  if (pathname.startsWith(ROUTES.ADMIN_PREFIX)) {
    if (isPlatformSuperAdmin(normalized)) return true;
    if (normalized === ROLES.ADMIN) return canAccessAdminModule(pathname);
    return false;
  }
  if (pathname.startsWith(ROUTES.AGENCY_PREFIX)) {
    if (normalized === ROLES.AGENCY_OWNER) return true;
    if (normalized === ROLES.HR) return canAccessAgencyModule(pathname);
    return false;
  }
  if (pathname.startsWith(ROUTES.CAREGIVER_PREFIX)) {
    return normalized === ROLES.CAREGIVER;
  }
  if (pathname.startsWith(ROUTES.CLIENT_PREFIX)) {
    return normalized === ROLES.CLIENT;
  }

  return true;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('authUser');
}
