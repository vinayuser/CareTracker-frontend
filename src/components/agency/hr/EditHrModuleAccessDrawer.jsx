import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { editHrStaff } from '../../../redux/slices/hrStaffSlice';
import { ModulePermissionsFields } from './ModulePermissionsFields';
import { DEFAULT_HR_MODULES } from '../../../constants/agencyModules';

export default function EditHrModuleAccessDrawer({ open, onClose, member, onSuccess }) {
  const dispatch = useDispatch();
  const [moduleAccess, setModuleAccess] = useState([...DEFAULT_HR_MODULES]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !member) return;
    setModuleAccess(member.moduleAccess?.length ? [...member.moduleAccess] : [...DEFAULT_HR_MODULES]);
    setError('');
  }, [open, member]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleAccess.length) {
      setError('Select at least one module');
      return;
    }

    setLoading(true);
    try {
      await dispatch(editHrStaff({ id: member.id, updates: { moduleAccess } })).unwrap();
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
      title="Edit Module Access"
      width="lg"
      footer={
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
            form="edit-hr-modules-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Access'}
          </button>
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
