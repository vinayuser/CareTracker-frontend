import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckCircle2 } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import { addHrStaff } from '../../../redux/slices/hrStaffSlice';
import {
  EMPTY_HR_FORM,
  HrFormFields,
  hrFormToPayload,
  validateHrForm,
} from './HrFormFields';

export default function CreateHrStaffDrawer({ open, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_HR_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdMember, setCreatedMember] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_HR_FORM);
    setErrors({});
    setCreatedMember(null);
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'email' && !prev.userId) {
        next.userId = value;
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateHrForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const member = await dispatch(addHrStaff(hrFormToPayload(form))).unwrap();
      setCreatedMember(member);
      onSuccess?.();
    } catch {
      // toast handled in slice
    }
    setLoading(false);
  };

  const handleClose = () => {
    setCreatedMember(null);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={createdMember ? 'HR Account Created' : 'Create HR Account'}
      width="2xl"
      footer={
        createdMember ? (
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Done
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-hr-form"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create HR Account'}
            </button>
          </div>
        )
      }
    >
      {createdMember ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">
                {createdMember.firstName} {createdMember.lastName} has been added to your HR team.
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Login ID: <span className="font-semibold">{createdMember.userId}</span>
              </p>
              {form.sendWelcomeEmail && (
                <p className="mt-1 text-sm text-emerald-700">
                  A welcome email will be sent to {createdMember.email}.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form id="create-hr-form" onSubmit={handleSubmit}>
          <HrFormFields form={form} errors={errors} onChange={handleChange} />
        </form>
      )}
    </Drawer>
  );
}
