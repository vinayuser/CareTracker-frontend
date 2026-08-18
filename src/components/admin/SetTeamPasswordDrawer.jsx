import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { KeyRound } from 'lucide-react';
import Drawer from '../ui/Drawer';
import SubmitButton from '../ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { setTeamMemberPassword } from '../../redux/slices/adminTeamSlice';

export default function SetTeamPasswordDrawer({ open, member, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, runLocked] = useSubmitLock();

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setError('');
  }, [open, member?.id]);

  if (!member) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    return runLocked(async () => {
      try {
        await dispatch(setTeamMemberPassword({ id: member.id, password })).unwrap();
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
      title="Set Password"
      footer={(
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <SubmitButton type="submit" form="set-team-password-form" loading={loading} icon={KeyRound} loadingLabel="Saving..." className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
            Update Password
          </SubmitButton>
        </div>
      )}
    >
      <form id="set-team-password-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Set a new password for <span className="font-semibold text-gray-900">{member.name}</span>.
        </p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        </div>
      </form>
    </Drawer>
  );
}
