import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import CareTrackerLogo from '../../components/brand/CareTrackerLogo';
import LoginHeroPanel from '../../components/auth/LoginHeroPanel';
import LoginHeroBackground from '../../components/auth/LoginHeroBackground';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post(API_ROUTES.FORGOT_PASSWORD, { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset email. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LoginHeroPanel />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="relative h-44 overflow-hidden lg:hidden">
          <LoginHeroBackground />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-sidebar/60 to-sidebar/80" />
          <div className="absolute bottom-4 left-6">
            <CareTrackerLogo size="md" tagline="Home Care Platform" light />
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
          <div className="login-fade-in w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Forgot password</h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email or login ID and we&apos;ll send a reset link if an account exists.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
              {sent ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    If an account exists for that email, a reset link has been sent. Check your inbox
                    (and spam folder). The link expires in 1 hour.
                  </div>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <ArrowLeft size={16} />
                    Back to sign in
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Email or Login ID
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="email"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com or login ID"
                        className={inputClass}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Send reset link'}
                    {!loading && <ArrowRight size={16} />}
                  </button>

                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary"
                  >
                    <ArrowLeft size={16} />
                    Back to sign in
                  </Link>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
