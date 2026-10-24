import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import CareTrackerLogo from '../../components/brand/CareTrackerLogo';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const fromLink = String(params.get('email') || '').trim();
  const agencyId = String(params.get('agencyId') || params.get('scope') || '').trim();
  const [email, setEmail] = useState(fromLink);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const locked = Boolean(fromLink);

  const canSubmit = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  const prefsHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (email.trim()) qs.set('email', email.trim());
    if (agencyId) qs.set('agencyId', agencyId);
    const query = qs.toString();
    return query ? `${ROUTES.EMAIL_PREFERENCES}?${query}` : ROUTES.EMAIL_PREFERENCES;
  }, [email, agencyId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      const payload = { email: email.trim() };
      if (agencyId) payload.agencyId = agencyId;
      await axiosInstance.post(API_ROUTES.EMAIL.UNSUBSCRIBE, payload, { skipErrorToast: true });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not unsubscribe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <CareTrackerLogo size="md" tagline="Home Care Platform" />
        {done ? (
          <div className="mt-6 space-y-3">
            <CheckCircle2 className="text-emerald-600" size={28} />
            <h1 className="text-xl font-bold text-slate-900">You are unsubscribed</h1>
            <p className="text-sm text-slate-600">
              {email} will no longer receive CareTracker marketing emails.
            </p>
            <Link to={prefsHref} className="text-sm font-semibold text-primary hover:underline">
              Change email preferences instead
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Unsubscribe</h1>
            <p className="text-sm text-slate-600">
              Stop marketing emails from CareTracker. Transactional messages about your account may still be sent.
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                readOnly={locked}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Unsubscribe'}
            </button>
            <Link to={prefsHref} className="block text-center text-sm font-medium text-primary hover:underline">
              Manage preferences
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
