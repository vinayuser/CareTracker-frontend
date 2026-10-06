/** Login username (distinct from email). Lowercase on save. */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$|^[a-z0-9]$/;
export const USERNAME_TAKEN_MESSAGE = 'Username is already taken';

export function normalizeUsername(value = '') {
  return String(value).trim().toLowerCase();
}

export function usernameTakenMessage(apiMessage) {
  const msg = typeof apiMessage === 'string' ? apiMessage.trim() : '';
  if (!msg) return USERNAME_TAKEN_MESSAGE;
  // Normalize legacy backend wording to the same UI copy
  if (/user id is already taken/i.test(msg) || /login id or email is already in use/i.test(msg)) {
    return USERNAME_TAKEN_MESSAGE;
  }
  if (/already taken|already in use/i.test(msg)) return USERNAME_TAKEN_MESSAGE;
  return msg;
}

export function validateUsername(value = '') {
  const username = normalizeUsername(value);
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` };
  }
  if (username.includes('@')) {
    return { valid: false, error: 'Username cannot be an email address' };
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return { valid: false, error: 'Use letters, numbers, dots, hyphens, or underscores only' };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { valid: false, error: 'Username cannot start or end with . _ or -' };
  }
  return { valid: true, username };
}
