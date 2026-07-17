import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import CareTrackerLogo from '../../components/brand/CareTrackerLogo';
import LoginHeroPanel from '../../components/auth/LoginHeroPanel';
import LoginHeroBackground from '../../components/auth/LoginHeroBackground';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { ROUTES } from '../../routes/routes';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is missing or invalid. Request a new one.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_ROUTES.RESET_PASSWORD, { token, password });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password. The link may have expired.');
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
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset password</h1>
              <p className="mt-2 text-sm text-slate-500">
                Choose a new password for your CareTraker account.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
              {!token ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    This reset link is invalid. Please request a new password reset email.
                  </div>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Request a new link
                  </Link>
                </div>
              ) : success ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Password reset successfully. Redirecting you to sign in…
                  </div>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Go to sign in
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
                    <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      New password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        id="confirm"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={inputClass}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                  >
                    {loading ? 'Saving…' : 'Reset password'}
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
