import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Save } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import SubmitButton from '../../ui/SubmitButton';
import { editHrStaff } from '../../../redux/slices/hrStaffSlice';
import useSubmitLock from '../../../hooks/useSubmitLock';
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
  const [loading, runLocked] = useSubmitLock();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!member?.id) return;

    const validationErrors = validateHrForm(form, { requirePassword: false });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    return runLocked(async () => {
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
    });
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
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <SubmitButton
            type="submit"
            form="edit-hr-form"
            loading={loading}
            icon={Save}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Save Changes
          </SubmitButton>
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
