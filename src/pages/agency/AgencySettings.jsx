import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Building2, CheckCircle2, Save, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import AssessorPhotoUpload from '../../components/ui/AssessorPhotoUpload';
import SubmitButton from '../../components/ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { ROUTES } from '../../routes/routes';
import { ROLES, normalizeRole } from '../../constants/roles';
import {
  checkLoginIdAvailability,
  loginSuccess,
  updateProfile,
} from '../../redux/slices/authSlice';
import { normalizeUsername, usernameTakenMessage, validateUsername } from '../../utils/usernameValidation';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

const readOnlyInputClass =
  'w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  fax: '',
  website: '',
  address: '',
  city: '',
  state: '',
  logo: '',
  userId: '',
};

export default function AgencySettings() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const role = normalizeRole(authUser?.role);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, runLocked] = useSubmitLock();
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (role !== ROLES.AGENCY_OWNER) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get(API_ROUTES.AGENCY.SETTINGS);
        const data = response.data?.data;
        if (!cancelled && data) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            fax: data.fax || '',
            website: data.website || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            logo: data.logoUrl || '',
            userId: authUser?.userId || '',
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load agency settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role, authUser?.userId]);

  useEffect(() => {
    if (role !== ROLES.AGENCY_OWNER) return undefined;

    const normalized = normalizeUsername(form.userId);
    const current = normalizeUsername(authUser?.userId || '');
    if (!normalized || normalized === current) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      setUsernameError('');
      return undefined;
    }

    const validation = validateUsername(normalized);
    if (!validation.valid) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      setUsernameError(validation.error);
      return undefined;
    }

    setUsernameError('');
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        await dispatch(checkLoginIdAvailability(validation.username)).unwrap();
        setUsernameAvailable(true);
      } catch (err) {
        setUsernameAvailable(false);
        setUsernameError(usernameTakenMessage(err));
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.userId, authUser?.userId, role, dispatch]);

  if (role !== ROLES.AGENCY_OWNER) {
    return <Navigate to={ROUTES.AGENCY_DASHBOARD} replace />;
  }

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === 'userId') {
      setUsernameAvailable(null);
      setUsernameError('');
    }
  };

  const validateUsernameField = () => {
    if (!form.userId.trim()) {
      setUsernameError('Username is required');
      return false;
    }
    const validation = validateUsername(form.userId);
    if (!validation.valid) {
      setUsernameError(validation.error);
      return false;
    }
    const current = normalizeUsername(authUser?.userId || '');
    if (validation.username !== current) {
      if (checkingUsername) {
        setUsernameError('Checking username availability…');
        return false;
      }
      if (usernameAvailable === false) {
        setUsernameError(usernameTakenMessage());
        return false;
      }
      if (usernameAvailable !== true) {
        setUsernameError('Confirm username availability before saving');
        return false;
      }
    }
    setUsernameError('');
    return true;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validateUsernameField()) return;

    return runLocked(async () => {
      try {
        const nextUsername = normalizeUsername(form.userId);
        const usernameChanged = nextUsername !== normalizeUsername(authUser?.userId || '');

        if (usernameChanged) {
          await dispatch(updateProfile({
            name: authUser?.name || authUser?.fullName || '',
            email: authUser?.email || '',
            userId: nextUsername,
          })).unwrap();
        }

        const response = await axiosInstance.put(API_ROUTES.AGENCY.SETTINGS, {
          logo: form.logo || '',
          phone: form.phone.trim(),
          fax: form.fax.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
        });
        const data = response.data?.data;
        if (data) {
          setForm((prev) => ({
            ...prev,
            email: data.email || '',
            phone: data.phone || '',
            fax: data.fax || '',
            website: data.website || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            logo: data.logoUrl || '',
            userId: nextUsername,
          }));
          dispatch(loginSuccess({
            user: {
              ...authUser,
              userId: nextUsername,
              agencyLogo: data.logoUrl || '',
              agencyEmail: data.email || '',
              agencyPhone: data.phone || '',
              agencyFax: data.fax || '',
              agencyWebsite: data.website || '',
              agencyAddress: data.address || '',
              agencyCity: data.city || '',
              agencyState: data.state || '',
            },
            token: localStorage.getItem('token'),
          }));
        }
        if (!usernameChanged) {
          toast.success(response.data?.message || 'Agency settings saved');
        }
      } catch (error) {
        if (typeof error === 'string' || error?.message) {
          // updateProfile already toasts on failure
          if (!error?.response) return;
        }
        toast.error(error.response?.data?.message || 'Failed to save agency settings');
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
        Loading agency settings…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Agency</p>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Logo and contact details used on assessment form headers and PDF footers.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
          <Building2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold">{form.name || authUser?.agencyName || 'Your agency'}</p>
            <p className="mt-0.5 text-blue-800/80">
              Shown as branding on printed assessment forms.
            </p>
          </div>
        </div>

        <AssessorPhotoUpload
          label="Agency logo"
          shape="square"
          uploadLabel={form.logo ? 'Change logo' : 'Upload logo'}
          hint="PNG or JPG with a transparent or white background works best."
          value={form.logo}
          onChange={(logo) => setForm((prev) => ({ ...prev, logo }))}
        />

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Form footer contact details</h2>
          <p className="mt-1 text-xs text-gray-500">
            These appear on assessment form headers and PDF footers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Street address</span>
            <input className={inputClass} value={form.address} onChange={setField('address')} placeholder="123 Main St, Suite 100" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">City</span>
            <input className={inputClass} value={form.city} onChange={setField('city')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">State</span>
            <input className={inputClass} value={form.state} onChange={setField('state')} placeholder="TX" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Phone</span>
            <input className={inputClass} value={form.phone} onChange={setField('phone')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Fax</span>
            <input className={inputClass} value={form.fax} onChange={setField('fax')} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              className={readOnlyInputClass}
              value={form.email}
              readOnly
              disabled
              tabIndex={-1}
            />
            <p className="mt-1 text-xs text-gray-400">Agency email cannot be changed here.</p>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Username</span>
            <input
              className={usernameError ? `${inputClass} border-red-400` : inputClass}
              value={form.userId}
              onChange={setField('userId')}
              autoComplete="username"
              placeholder="Choose a unique username"
            />
            {checkingUsername && (
              <p className="mt-1 text-xs text-gray-400">Checking availability…</p>
            )}
            {!checkingUsername && usernameAvailable === true && !usernameError && (
              <p className="mt-1 flex items-center gap-1 text-xs text-success">
                <CheckCircle2 size={12} />
                Username is available
              </p>
            )}
            {!checkingUsername && usernameAvailable === false && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <XCircle size={12} />
                {usernameTakenMessage(usernameError)}
              </p>
            )}
            {usernameError && usernameAvailable !== false ? (
              <p className="mt-1 text-xs text-red-600">{usernameError}</p>
            ) : null}
            {!checkingUsername && !usernameError && usernameAvailable !== true && usernameAvailable !== false ? (
              <p className="mt-1 text-xs text-gray-400">
                Sign in with email or this username.
              </p>
            ) : null}
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Website</span>
            <input className={inputClass} value={form.website} onChange={setField('website')} placeholder="www.youragency.com" />
          </label>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <SubmitButton
            type="submit"
            loading={saving || checkingUsername}
            icon={Save}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save settings
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
