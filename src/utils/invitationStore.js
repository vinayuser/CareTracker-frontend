const INVITATIONS_KEY = 'caretracker_invitations_v1';
const INVITE_SESSION_KEY = 'caretracker_invite_session';

function readInvitations() {
  try {
    const raw = localStorage.getItem(INVITATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeInvitations(invitations) {
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
}

function generateToken() {
  return `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatInviteDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getInviteUrl(token) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/register?token=${encodeURIComponent(token)}`;
}

export function getAllInvitations() {
  return readInvitations();
}

export function createInvitation({ agencyName, email, message, subscriptionPlanId, planName, planPrice }) {
  const invitations = readInvitations();
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = {
    id: `inv-${Date.now()}`,
    token,
    agencyName,
    email,
    message: message || '',
    subscriptionPlanId,
    planName: planName || '',
    planPrice: planPrice ?? 0,
    status: 'Pending',
    invitedOn: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  invitations.unshift(invitation);
  writeInvitations(invitations);
  return invitation;
}

export function getInvitationByToken(token) {
  return readInvitations().find((inv) => inv.token === token) ?? null;
}

export function validateToken(token) {
  const invitation = getInvitationByToken(token);

  if (!invitation) {
    return { valid: false, error: 'This invitation link is invalid or has been removed.' };
  }

  if (invitation.status === 'Accepted') {
    return { valid: false, error: 'This invitation has already been used to complete registration.' };
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return { valid: false, error: 'This invitation link has expired. Please contact your administrator.' };
  }

  return { valid: true, invitation };
}

export function activateInviteSession(invitation) {
  sessionStorage.setItem(
    INVITE_SESSION_KEY,
    JSON.stringify({
      token: invitation.token,
      agencyName: invitation.agencyName,
      email: invitation.email,
      subscriptionPlanId: invitation.subscriptionPlanId,
    }),
  );
}

export function getInviteSession() {
  try {
    const raw = sessionStorage.getItem(INVITE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearInviteSession() {
  sessionStorage.removeItem(INVITE_SESSION_KEY);
}

export function markInvitationAccepted(token) {
  const invitations = readInvitations();
  const index = invitations.findIndex((inv) => inv.token === token);

  if (index === -1) return null;

  invitations[index] = { ...invitations[index], status: 'Accepted' };
  writeInvitations(invitations);
  return invitations[index];
}
