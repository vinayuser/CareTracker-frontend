import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Copy, CheckCircle2, Lightbulb } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import {
  checkUserIdAvailability,
  createRegistrationAccount,
} from '../../redux/slices/registrationSlice';
import { getInviteSession } from '../../utils/invitationStore';
import { getRegistrationData, updateRegistrationData } from '../../utils/registrationStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

function getPasswordStrength(password) {
  if (password.length === 0) return { label: '', width: '0%', color: 'bg-gray-200' };
  if (password.length < 6) return { label: 'Weak', width: '33%', color: 'bg-red-400' };
  if (password.length < 10) return { label: 'Medium', width: '66%', color: 'bg-yellow-400' };
  return { label: 'Strong Password', width: '100%', color: 'bg-success' };
}

export default function CreateAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inviteSession = getInviteSession();
  const saved = getRegistrationData();

  const [fullName, setFullName] = useState(saved.fullName);
  const [userId, setUserId] = useState(saved.userId || saved.email);
  const [password, setPassword] = useState(saved.password);
  const [showPassword, setShowPassword] = useState(false);
  const [userIdAvailable, setUserIdAvailable] = useState(null);
  const [credentialsReady, setCredentialsReady] = useState(false);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (!inviteSession) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [inviteSession, navigate]);

  const checkAvailability = async (value) => {
    setUserId(value);
    if (value.length >= 3) {
      try {
        await dispatch(checkUserIdAvailability(value)).unwrap();
        setUserIdAvailable(true);
      } catch {
        setUserIdAvailable(false);
      }
    } else {
      setUserIdAvailable(null);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createRegistrationAccount({ email: userId, password, fullName }),
      ).unwrap();
    } catch {
      // Demo mode continues with local state
    }
    updateRegistrationData({ fullName, userId, password });
    setCredentialsReady(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Set login credentials for your agency owner account.
      </p>

      <form onSubmit={handleGenerate} className="mt-8 space-y-5">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>User ID *</label>
          <input
            type="text"
            required
            value={userId}
            onChange={(e) => checkAvailability(e.target.value)}
            placeholder="Choose a unique user ID"
            className={inputClass}
            readOnly={Boolean(inviteSession?.email)}
          />
          {userIdAvailable && (
            <p className="mt-1 flex items-center gap-1 text-xs text-success">
              <CheckCircle2 size={12} />
              User ID is available
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className={`h-1.5 rounded-full transition-all ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="mt-1 text-xs text-success">{strength.label}</p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-success" />
          <p className="text-sm text-green-800">
            Please save your User ID and Password securely. You will need them to log in after
            registration.
          </p>
        </div>

        {credentialsReady && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="mb-3 text-sm font-semibold text-gray-900">Your Login Credentials</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-sm font-medium text-gray-900">{userId}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userId)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Password</p>
                  <p className="text-sm font-medium text-gray-900">{password}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(password)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.REGISTRATION_AGENCY_INFO)}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          {!credentialsReady ? (
            <button
              type="submit"
              className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Generate &amp; Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTRATION_CONFIRMATION)}
              className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Continue to Payment
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
