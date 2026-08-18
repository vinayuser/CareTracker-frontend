import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UserPlus } from 'lucide-react';
import Drawer from '../ui/Drawer';
import SubmitButton from '../ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { AdminModulePermissionsFields } from './AdminModulePermissionsFields';
import { createTeamMember } from '../../redux/slices/adminTeamSlice';
import { DEFAULT_ADMIN_MODULES } from '../../constants/adminModules';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  status: 'Active',
  moduleAccess: [...DEFAULT_ADMIN_MODULES],
};

export default function CreateTeamMemberDrawer({ open, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, runLocked] = useSubmitLock();

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setErrors({});
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.password || form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (!form.moduleAccess.length) next.moduleAccess = 'Select at least one module';
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    return runLocked(async () => {
      try {
        await dispatch(createTeamMember({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          status: form.status,
          role: 'ADMIN',
          moduleAccess: form.moduleAccess,
        })).unwrap();
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
      title="Add Team Member"
      width="2xl"
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
            form="create-team-form"
            loading={loading}
            icon={UserPlus}
            loadingLabel="Creating..."
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Create Team Member
          </SubmitButton>
        </div>
      )}
    >
      <form id="create-team-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Temporary Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
          </div>
        </div>

        <AdminModulePermissionsFields
          selectedModules={form.moduleAccess}
          onChange={(moduleAccess) => handleChange('moduleAccess', moduleAccess)}
          error={errors.moduleAccess}
        />
      </form>
    </Drawer>
  );
}
