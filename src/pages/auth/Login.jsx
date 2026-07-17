import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import CareTrackerLogo from '../../components/brand/CareTrackerLogo';
import LoginHeroPanel from '../../components/auth/LoginHeroPanel';
import LoginHeroBackground from '../../components/auth/LoginHeroBackground';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { loginSuccess } from '../../redux/slices/authSlice';
import { getHomeRouteForRole } from '../../utils/auth';
import { ROUTES } from '../../routes/routes';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_ROUTES.LOGIN, {
        email: email.trim(),
        password,
      });
      if (response.data?.data?.token) {
        const payload = response.data.data;
        dispatch(loginSuccess(payload));
        navigate(getHomeRouteForRole(payload.user?.role), { replace: true });
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('Invalid email or password.');
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

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        <div className="relative flex flex-1 items-center justify-center px-6 py-10 lg:justify-middle lg:px-12 xl:px-16">
          <div className="login-fade-in w-full max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to manage your home care platform
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60">
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

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <Link
                      to={ROUTES.FORGOT_PASSWORD}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
                      placeholder="Enter your password"
                      className={inputClass}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Protected admin area · HIPAA-aware platform infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
