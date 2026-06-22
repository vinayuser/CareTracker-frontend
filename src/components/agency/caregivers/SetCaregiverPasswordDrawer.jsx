import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { setCaregiverPassword } from '../../../redux/slices/caregiversSlice';

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function SetCaregiverPasswordDrawer({ open, onClose, caregiver, onSuccess }) {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  }, [open, caregiver?.id]);

  const validate = () => {
    const next = {};
    if (!password) next.password = 'Password is required';
    else if (password.length < 8) next.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caregiver?.id || !validate()) return;

    setLoading(true);
    try {
      await dispatch(setCaregiverPassword({ id: caregiver.id, password })).unwrap();
      onSuccess?.();
      onClose();
    } catch {
      // toast in slice
    }
    setLoading(false);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Set Caregiver Password"
      width="md"
      footer={(
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="set-caregiver-password-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      )}
    >
      <form id="set-caregiver-password-form" onSubmit={handleSubmit} className="space-y-4">
        {caregiver && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="font-medium text-gray-900">{caregiver.fullName}</p>
            <p className="text-sm text-gray-500">{caregiver.userId || caregiver.email}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <p className="text-xs text-gray-500">
          The caregiver will use their login ID and this password to sign in to the caregiver portal.
        </p>
      </form>
    </Drawer>
  );
}
