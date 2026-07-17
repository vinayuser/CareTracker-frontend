import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { editCaregiver } from '../../../redux/slices/caregiversSlice';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const EMPTY = {
  fullName: '',
  email: '',
  userId: '',
  phone: '',
  employeeId: '',
  dateOfBirth: '',
  status: 'Active',
};

export default function EditCaregiverDrawer({ open, onClose, caregiver, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !caregiver) return;
    setForm({
      fullName: caregiver.fullName || '',
      email: caregiver.email || '',
      userId: caregiver.userId || '',
      phone: caregiver.phone || '',
      employeeId: caregiver.employeeId || '',
      dateOfBirth: caregiver.dateOfBirth || '',
      status: caregiver.status || 'Active',
    });
    setErrors({});
  }, [open, caregiver]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.userId.trim()) next.userId = 'Login ID is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caregiver?.id || !validate()) return;

    setLoading(true);
    try {
      await dispatch(
        editCaregiver({
          id: caregiver.id,
          updates: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            userId: form.userId.trim(),
            phone: form.phone.trim(),
            employeeId: form.employeeId.trim(),
            dateOfBirth: form.dateOfBirth,
            status: form.status,
          },
        }),
      ).unwrap();
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
      title="Edit Caregiver"
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
            form="edit-caregiver-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    >
      <form id="edit-caregiver-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.fullName} onChange={set('fullName')} className={inputClass} />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Login ID <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.userId} onChange={set('userId')} className={inputClass} />
          {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Employee ID</label>
          <input type="text" value={form.employeeId} onChange={set('employeeId')} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Date of birth</label>
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
          <select value={form.status} onChange={set('status')} className={inputClass}>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </form>
    </Drawer>
  );
}
