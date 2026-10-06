import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Copy, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import {
  checkUserIdAvailability,
  createRegistrationAccount,
} from '../../redux/slices/registrationSlice';
import { getInviteSession } from '../../utils/invitationStore';
import { getRegistrationData, updateRegistrationData } from '../../utils/registrationStore';
import { normalizeUsername, usernameTakenMessage, validateUsername } from '../../utils/usernameValidation';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';
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

  const accountEmail = useMemo(
    () => saved.email || inviteSession?.email || '',
    [saved.email, inviteSession?.email],
  );

  const initialUsername = useMemo(() => {
    const savedUserId = saved.userId || '';
    if (!savedUserId) return '';
    if (savedUserId.toLowerCase() === accountEmail.toLowerCase()) return '';
    return savedUserId;
  }, [saved.userId, accountEmail]);

  const [fullName, setFullName] = useState(saved.fullName);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState(saved.password);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [credentialsReady, setCredentialsReady] = useState(false);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (!inviteSession) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [inviteSession, navigate]);

  useEffect(() => {
    if (!accountEmail) {
      navigate(ROUTES.REGISTRATION_AGENCY_INFO, { replace: true });
    }
  }, [accountEmail, navigate]);

  useEffect(() => {
    const normalized = normalizeUsername(username);
    const validation = validateUsername(normalized);
    if (!validation.valid) {
      setUsernameError(validation.error);
      setUsernameAvailable(null);
      return undefined;
    }

    setUsernameError('');
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        await dispatch(
          checkUserIdAvailability({
            userId: validation.username,
            email: accountEmail,
            invitationToken: inviteSession?.token,
          }),
        ).unwrap();
        setUsernameAvailable(true);
      } catch (err) {
        setUsernameAvailable(false);
        setUsernameError(usernameTakenMessage(err));
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, accountEmail, dispatch, inviteSession?.token]);

  const handleGenerate = async (e) => {
    e.preventDefault();

    const validation = validateUsername(username);
    if (!validation.valid) {
      setUsernameError(validation.error);
      return;
    }
    if (!usernameAvailable) {
      toast.error('Choose an available username before continuing.');
      return;
    }
    if (!accountEmail) {
      toast.error('Agency email is required. Go back and complete agency information.');
      return;
    }

    try {
      await dispatch(
        createRegistrationAccount({
          email: accountEmail.trim().toLowerCase(),
          userId: validation.username,
          password,
          fullName,
          invitationToken: inviteSession?.token,
        }),
      ).unwrap();
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Could not create account.';
      toast.error(message);
      return;
    }

    updateRegistrationData({
      fullName,
      email: accountEmail.trim().toLowerCase(),
      userId: validation.username,
      password,
    });
    setCredentialsReady(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Set login credentials for your agency owner account. You can sign in with your email or username.
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
          <label className={labelClass}>Email *</label>
          <input
            type="email"
            required
            value={accountEmail}
            readOnly
            className={`${inputClass} bg-gray-50 text-gray-600`}
          />
          <p className="mt-1 text-xs text-gray-400">From agency information. Used for login and notifications.</p>
        </div>

        <div>
          <label className={labelClass}>Username *</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameAvailable(null);
            }}
            placeholder="Choose a unique username"
            className={usernameError ? inputErrorClass : inputClass}
            autoComplete="username"
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
              3–30 characters. Letters, numbers, dots, hyphens, and underscores.
            </p>
          ) : null}
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
            Save your email, username, and password securely. You can log in with either your email or username.
          </p>
        </div>

        {credentialsReady && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="mb-3 text-sm font-semibold text-gray-900">Your Login Credentials</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{accountEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountEmail)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-sm font-medium text-gray-900">{normalizeUsername(username)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(normalizeUsername(username))}
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
              disabled={checkingUsername || !usernameAvailable}
              className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
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
