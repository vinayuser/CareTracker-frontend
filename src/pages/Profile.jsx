import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, KeyRound, UserRound, XCircle } from 'lucide-react';
import {
  changePassword,
  checkLoginIdAvailability,
  updateProfile,
} from '../redux/slices/authSlice';
import { ROLE_LABELS, ROLES, normalizeRole } from '../constants/roles';
import { normalizeUsername, usernameTakenMessage, validateUsername } from '../utils/usernameValidation';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

export default function Profile() {
  const dispatch = useDispatch();
  const { user, profileSaving, passwordSaving } = useSelector((state) => state.auth);
  const role = normalizeRole(user?.role);
  const isAdmin = role === ROLES.SUPER_ADMIN;
  const isHr = role === ROLES.HR;
  const isAgency = role === ROLES.AGENCY_OWNER || isHr;
  const isCaregiver = role === ROLES.CAREGIVER;

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    userId: '',
    employeeId: '',
    jobTitle: '',
    department: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      userId: user.userId || '',
      employeeId: user.employeeId || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
    });
  }, [
    user?.id,
    user?.name,
    user?.email,
    user?.phone,
    user?.dateOfBirth,
    user?.userId,
    user?.employeeId,
    user?.jobTitle,
    user?.department,
  ]);

  const readOnlyMeta = useMemo(() => ({
    roleLabel: ROLE_LABELS[role] || role || 'User',
    agencyName: user?.agencyName || '',
    status: user?.status || '',
  }), [role, user]);

  const setProfileField = (key) => (e) => {
    setProfile((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === 'userId') {
      setUsernameAvailable(null);
      setProfileErrors((prev) => {
        if (!prev.userId) return prev;
        const next = { ...prev };
        delete next.userId;
        return next;
      });
    }
  };

  useEffect(() => {
    if (isAdmin) return undefined;

    const normalized = normalizeUsername(profile.userId);
    const current = normalizeUsername(user?.userId || '');
    if (!normalized || normalized === current) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      setProfileErrors((prev) => {
        if (!prev.userId) return prev;
        const next = { ...prev };
        delete next.userId;
        return next;
      });
      return undefined;
    }

    const validation = validateUsername(normalized);
    if (!validation.valid) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      setProfileErrors((prev) => ({ ...prev, userId: validation.error }));
      return undefined;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        await dispatch(checkLoginIdAvailability(validation.username)).unwrap();
        setUsernameAvailable(true);
        setProfileErrors((prev) => {
          if (!prev.userId) return prev;
          const next = { ...prev };
          delete next.userId;
          return next;
        });
      } catch (err) {
        setUsernameAvailable(false);
        setProfileErrors((prev) => ({ ...prev, userId: usernameTakenMessage(err) }));
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [profile.userId, user?.userId, isAdmin, dispatch]);

  const validateProfile = () => {
    const next = {};
    if (!profile.name.trim()) next.name = 'Name is required';
    if (!profile.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      next.email = 'Enter a valid email';
    }
    if (!isAdmin && profile.userId.trim()) {
      const validation = validateUsername(profile.userId);
      if (!validation.valid) next.userId = validation.error;
      else if (
        validation.username !== normalizeUsername(user?.userId || '')
        && checkingUsername
      ) {
        next.userId = 'Checking username availability…';
      } else if (
        validation.username !== normalizeUsername(user?.userId || '')
        && usernameAvailable === false
      ) {
        next.userId = usernameTakenMessage();
      } else if (
        validation.username !== normalizeUsername(user?.userId || '')
        && usernameAvailable !== true
      ) {
        next.userId = 'Confirm username availability before saving';
      }
    }
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    const payload = {
      name: profile.name.trim(),
      email: profile.email.trim(),
    };

    if (!isAdmin) {
      payload.phone = profile.phone.trim();
      payload.dateOfBirth = profile.dateOfBirth.trim();
      payload.employeeId = profile.employeeId.trim();
      if (profile.userId.trim()) payload.userId = normalizeUsername(profile.userId);
    }
    if (isHr) {
      payload.jobTitle = profile.jobTitle.trim();
      payload.department = profile.department.trim();
    }

    try {
      await dispatch(updateProfile(payload)).unwrap();
    } catch {
      // toast in slice
    }
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordForm.currentPassword) next.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) next.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) {
      next.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch {
      // toast in slice
    }
  };

  if (!user) {
    return <p className="text-sm text-gray-500">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your account details and password.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
            {initialsFromName(profile.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-900">{profile.name || 'User'}</p>
            <p className="truncate text-sm text-gray-500">{profile.email}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {readOnlyMeta.roleLabel}
              {readOnlyMeta.agencyName ? ` · ${readOnlyMeta.agencyName}` : ''}
              {readOnlyMeta.status ? ` · ${readOnlyMeta.status}` : ''}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserRound size={16} className="text-primary" />
            Personal details
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Full name</span>
              <input
                value={profile.name}
                onChange={setProfileField('name')}
                className={inputClass}
                autoComplete="name"
              />
              {profileErrors.name ? <p className="mt-1 text-xs text-red-600">{profileErrors.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={profile.email}
                onChange={setProfileField('email')}
                className={inputClass}
                autoComplete="email"
              />
              {profileErrors.email ? <p className="mt-1 text-xs text-red-600">{profileErrors.email}</p> : null}
            </label>

            {!isAdmin && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Username</span>
                <input
                  value={profile.userId}
                  onChange={setProfileField('userId')}
                  className={profileErrors.userId ? `${inputClass} border-red-400` : inputClass}
                  autoComplete="username"
                  placeholder="Choose a unique username"
                />
                {checkingUsername && (
                  <p className="mt-1 text-xs text-gray-400">Checking availability…</p>
                )}
                {!checkingUsername && usernameAvailable === true && !profileErrors.userId && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 size={12} />
                    Username is available
                  </p>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                    <XCircle size={12} />
                    {usernameTakenMessage(profileErrors.userId)}
                  </p>
                )}
                {profileErrors.userId && usernameAvailable !== false ? (
                  <p className="mt-1 text-xs text-red-600">{profileErrors.userId}</p>
                ) : null}
                {!checkingUsername && !profileErrors.userId && usernameAvailable !== false && usernameAvailable !== true ? (
                  <p className="mt-1 text-xs text-gray-400">
                    Sign in with your email or this username.
                  </p>
                ) : null}
              </label>
            )}

            {!isAdmin && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Phone</span>
                  <input
                    value={profile.phone}
                    onChange={setProfileField('phone')}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Date of birth</span>
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={setProfileField('dateOfBirth')}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Employee ID</span>
                  <input
                    value={profile.employeeId}
                    onChange={setProfileField('employeeId')}
                    className={inputClass}
                  />
                </label>
              </>
            )}

            {isHr && (
              <>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Job title</span>
                  <input
                    value={profile.jobTitle}
                    onChange={setProfileField('jobTitle')}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Department</span>
                  <input
                    value={profile.department}
                    onChange={setProfileField('department')}
                    className={inputClass}
                  />
                </label>
              </>
            )}

            {(isAgency || isCaregiver) && user?.agencyName ? (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Agency</span>
                <input value={user.agencyName} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
              </label>
            ) : null}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {profileSaving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <KeyRound size={16} className="text-primary" />
          Change password
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Current password</span>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className={inputClass}
              autoComplete="current-password"
            />
            {passwordErrors.currentPassword ? (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
            ) : null}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
              />
              {passwordErrors.newPassword ? (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Confirm new password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={inputClass}
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
              ) : null}
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {passwordSaving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
