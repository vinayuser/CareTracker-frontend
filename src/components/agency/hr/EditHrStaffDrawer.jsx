import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { editHrStaff } from '../../../redux/slices/hrStaffSlice';
import {
  EMPTY_HR_FORM,
  HrFormFields,
  hrFormToPayload,
  memberToHrForm,
  validateHrForm,
} from './HrFormFields';

export default function EditHrStaffDrawer({ open, onClose, member, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_HR_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !member) return;
    setForm(memberToHrForm(member));
    setErrors({});
  }, [open, member]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member?.id) return;

    const validationErrors = validateHrForm(form, { requirePassword: false });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        editHrStaff({
          id: member.id,
          updates: hrFormToPayload(form, { includePassword: false }),
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
      title="Edit HR Staff"
      width="2xl"
      footer={(
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-hr-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    >
      <form id="edit-hr-form" onSubmit={handleSubmit}>
        <HrFormFields
          form={form}
          errors={errors}
          onChange={handleChange}
          showPasswordFields={false}
        />
      </form>
    </Drawer>
  );
}
