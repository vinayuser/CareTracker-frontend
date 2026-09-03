import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Building2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import AssessorPhotoUpload from '../../components/ui/AssessorPhotoUpload';
import SubmitButton from '../../components/ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { ROUTES } from '../../routes/routes';
import { ROLES, normalizeRole } from '../../constants/roles';
import { loginSuccess } from '../../redux/slices/authSlice';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

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
};

export default function AgencySettings() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const role = normalizeRole(authUser?.role);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, runLocked] = useSubmitLock();

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
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load agency settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [role]);

  if (role !== ROLES.AGENCY_OWNER) {
    return <Navigate to={ROUTES.AGENCY_DASHBOARD} replace />;
  }

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    return runLocked(async () => {
      try {
        const response = await axiosInstance.put(API_ROUTES.AGENCY.SETTINGS, {
          logo: form.logo || '',
          email: form.email.trim(),
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
          }));
          dispatch(loginSuccess({
            user: {
              ...authUser,
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
        toast.success(response.data?.message || 'Agency settings saved');
      } catch (error) {
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
          value={form.logo}
          onChange={(logo) => setForm((prev) => ({ ...prev, logo }))}
        />
        <p className="-mt-2 text-xs text-gray-500">
          Recommended: PNG or JPG with a transparent or white background. Max 2 MB.
        </p>

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
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
            <input type="email" className={inputClass} value={form.email} onChange={setField('email')} required />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Website</span>
            <input className={inputClass} value={form.website} onChange={setField('website')} placeholder="www.youragency.com" />
          </label>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <SubmitButton
            type="submit"
            loading={saving}
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
