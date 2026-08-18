import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../ui/Drawer';
import SubmitButton from '../ui/SubmitButton';
import useSubmitLock from '../../hooks/useSubmitLock';
import { AdminModulePermissionsFields, AdminModuleAccessList } from './AdminModulePermissionsFields';
import { updateTeamMember } from '../../redux/slices/adminTeamSlice';
import { isSuperAdminRole } from '../../constants/adminModules';
import { ROLE_LABELS } from '../../constants/roles';

export default function EditTeamMemberDrawer({ open, member, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', status: 'Active', moduleAccess: [] });
  const [errors, setErrors] = useState({});
  const [loading, runLocked] = useSubmitLock();

  useEffect(() => {
    if (!open || !member) return;
    setForm({
      name: member.name || '',
      email: member.email || '',
      status: member.status || 'Active',
      moduleAccess: member.moduleAccess || [],
    });
    setErrors({});
  }, [open, member]);

  if (!member) return null;

  const isSuperAdmin = isSuperAdminRole(member.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!isSuperAdmin && !form.moduleAccess.length) next.moduleAccess = 'Select at least one module';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    return runLocked(async () => {
      try {
        await dispatch(updateTeamMember({
          id: member.id,
          updates: {
            name: form.name.trim(),
            email: form.email.trim(),
            status: form.status,
            moduleAccess: isSuperAdmin ? undefined : form.moduleAccess,
          },
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
      title="Edit Team Member"
      width="2xl"
      footer={(
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={loading} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <SubmitButton type="submit" form="edit-team-form" loading={loading} loadingLabel="Saving..." className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
            Save Changes
          </SubmitButton>
        </div>
      )}
    >
      <form id="edit-team-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Role</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{ROLE_LABELS[member.role] || member.role}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isSuperAdmin ? (
          <section>
            <h3 className="text-sm font-semibold text-gray-900">Module Access</h3>
            <p className="mt-2 text-sm text-gray-500">Super admins have full platform access.</p>
            <div className="mt-3">
              <AdminModuleAccessList moduleAccess={[]} />
            </div>
          </section>
        ) : (
          <AdminModulePermissionsFields
            selectedModules={form.moduleAccess}
            onChange={(moduleAccess) => setForm((prev) => ({ ...prev, moduleAccess }))}
            error={errors.moduleAccess}
          />
        )}
      </form>
    </Drawer>
  );
}
