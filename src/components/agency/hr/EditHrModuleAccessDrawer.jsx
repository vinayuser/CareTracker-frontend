import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Save } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import SubmitButton from '../../ui/SubmitButton';
import { editHrStaff } from '../../../redux/slices/hrStaffSlice';
import { ModulePermissionsFields } from './ModulePermissionsFields';
import { DEFAULT_HR_MODULES } from '../../../constants/agencyModules';
import useSubmitLock from '../../../hooks/useSubmitLock';

export default function EditHrModuleAccessDrawer({ open, onClose, member, onSuccess }) {
  const dispatch = useDispatch();
  const [moduleAccess, setModuleAccess] = useState([...DEFAULT_HR_MODULES]);
  const [error, setError] = useState('');
  const [loading, runLocked] = useSubmitLock();

  useEffect(() => {
    if (!open || !member) return;
    setModuleAccess(member.moduleAccess?.length ? [...member.moduleAccess] : [...DEFAULT_HR_MODULES]);
    setError('');
  }, [open, member]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!moduleAccess.length) {
      setError('Select at least one module');
      return;
    }

    return runLocked(async () => {
      try {
        await dispatch(editHrStaff({ id: member.id, updates: { moduleAccess } })).unwrap();
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
      title="Edit Module Access"
      width="lg"
      footer={
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
            form="edit-hr-modules-form"
            loading={loading}
            icon={Save}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Save Access
          </SubmitButton>
        </div>
      }
    >
      <form id="edit-hr-modules-form" onSubmit={handleSubmit}>
        <ModulePermissionsFields
          selectedModules={moduleAccess}
          onChange={setModuleAccess}
          error={error}
        />
      </form>
    </Drawer>
  );
}
