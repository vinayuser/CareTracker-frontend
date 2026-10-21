import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import CareTrackerLogo from '../../components/brand/CareTrackerLogo';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

const DEFAULT_TOPICS = [
  { id: 'product', label: 'Product updates' },
  { id: 'billing', label: 'Billing and invoices' },
  { id: 'hiring', label: 'Hiring and recruiting' },
  { id: 'updates', label: 'Agency news' },
];

export default function Preferences() {
  const [params] = useSearchParams();
  const fromLink = String(params.get('email') || '').trim();
  const [email, setEmail] = useState(fromLink);
  const [topics, setTopics] = useState(DEFAULT_TOPICS.map((item) => item.id));
  const [options, setOptions] = useState(DEFAULT_TOPICS);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loaded, setLoaded] = useState(!fromLink);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fromLink) return undefined;
    let cancelled = false;
    axiosInstance.get(API_ROUTES.EMAIL.PREFERENCES, { params: { email: fromLink }, skipErrorToast: true })
      .then((response) => {
        if (cancelled) return;
        const data = response.data?.data || {};
        setTopics(data.topics || DEFAULT_TOPICS.map((item) => item.id));
        setUnsubscribed(Boolean(data.unsubscribed));
        if (data.topicsAvailable?.length) setOptions(data.topicsAvailable);
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [fromLink]);

  const toggle = (id) => {
    setUnsubscribed(false);
    setTopics((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const submit = async (event, allOff = false) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axiosInstance.post(
        API_ROUTES.EMAIL.PREFERENCES,
        { email: email.trim(), unsubscribed: allOff || unsubscribed, topics: allOff ? [] : topics },
        { skipErrorToast: true },
      );
      if (allOff) setUnsubscribed(true);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save preferences. Please try again.');
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
            <h1 className="text-xl font-bold text-slate-900">Preferences saved</h1>
            <p className="text-sm text-slate-600">
              {unsubscribed
                ? `${email} is unsubscribed from marketing emails.`
                : 'We will only send the topics you selected.'}
            </p>
          </div>
        ) : (
          <form onSubmit={(event) => submit(event, false)} className="mt-6 space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Email preferences</h1>
            <p className="text-sm text-slate-600">Choose the CareTracker emails you want to receive.</p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                readOnly={Boolean(fromLink)}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            {loaded ? (
              <div className="space-y-2">
                {options.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={!unsubscribed && topics.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">Loading…</p>}
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Saving…' : 'Save preferences'}
            </button>
            <button type="button" disabled={saving} onClick={(event) => submit(event, true)} className="w-full text-sm font-semibold text-rose-600 hover:underline">
              Unsubscribe from all marketing emails
            </button>
            <Link to={ROUTES.HOME} className="block text-center text-sm text-slate-500 hover:text-primary">Back to CareTracker</Link>
          </form>
        )}
      </div>
    </div>
  );
}
