import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { KeyRound } from 'lucide-react';
import Drawer from '../ui/Drawer';
import SubmitButton from '../ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { setAgencyPassword } from '../../redux/slices/agencySlice';

export default function SetAgencyPasswordDrawer({ open, agency, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, runLocked] = useSubmitLock();

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [open, agency?.id]);

  if (!agency) return null;

  const validate = () => {
    const next = {};
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    return runLocked(async () => {
      try {
        await dispatch(setAgencyPassword({ id: agency.id, password })).unwrap();
        onSuccess?.();
        onClose();
      } catch {
        // toast in slice
      }
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Set Agency Password"
      footer={(
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <SubmitButton
            type="submit"
            form="set-agency-password-form"
            loading={loading}
            icon={KeyRound}
            loadingLabel="Saving..."
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Update Password
          </SubmitButton>
        </div>
      )}
    >
      <form id="set-agency-password-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Set a new password for{' '}
          <span className="font-semibold text-gray-900">{agency.name}</span>
          {agency.ownerName ? (
            <>
              {' '}
              (owner: <span className="font-medium text-gray-800">{agency.ownerName}</span>)
            </>
          ) : null}
          . This updates the agency owner login immediately.
        </p>
        {agency.email ? (
          <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Login email: <span className="font-medium text-gray-800">{agency.email}</span>
          </p>
        ) : null}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
          ) : null}
        </div>
      </form>
    </Drawer>
  );
}
