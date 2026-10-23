import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';

export default function CoverCaregiverModal({ open, visits, onClose, onSaved }) {
  const [caregivers, setCaregivers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caregiverId, setCaregiverId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected((visits || []).filter((v) => !v.checkInAt && !['InProgress', 'Completed'].includes(v.status)).map((v) => v.id));
    setCaregiverId('');
    setReason('');
    axiosInstance.get(API_ROUTES.AGENCY.CAREGIVERS.LIST)
      .then((res) => {
        const rows = res.data?.data || res.data || [];
        setCaregivers(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setCaregivers([]));
  }, [open, visits]);

  if (!open) return null;

  const assignedIds = new Set(
    (visits || [])
      .filter((visit) => selected.includes(visit.id))
      .map((visit) => String(visit.caregiverAccountId || ''))
      .filter(Boolean),
  );
  const options = caregivers.filter((cg) => (
    cg.status !== 'Inactive'
    && !assignedIds.has(String(cg.id || cg._id || ''))
  ));

  const toggle = (id) => {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  const submit = async () => {
    if (!selected.length) {
      toast.error('Select at least one day');
      return;
    }
    if (!caregiverId) {
      toast.error('Select a replacement caregiver');
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.post(API_ROUTES.AGENCY.VISITS.REASSIGN, {
        visit_ids: selected,
        caregiver_account_id: caregiverId,
        reason,
      }, { skipErrorToast: true });
      const data = res.data?.data || {};
      toast.success(
        data.evvCreatedCount
          ? `Cover assigned. ${data.evvCreatedCount} EVV form${data.evvCreatedCount === 1 ? '' : 's'} created for signing.`
          : 'Cover assigned. Existing EVV form will be used.',
      );
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not reassign these days');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">Assign another caregiver</h3>
        <p className="mt-1 text-xs text-slate-500">
          Tick the days they cannot do. Those days leave their schedule and go to the caregiver you choose. A new EVV form is created for the new caregiver and the client to sign, if they do not already have one. If that caregiver also cannot work a day later, use this again.
        </p>
        <div className="mt-4 max-h-40 space-y-2 overflow-y-auto">
          {(visits || []).map((visit) => {
            const locked = Boolean(visit.checkInAt) || ['InProgress', 'Completed'].includes(visit.status);
            return (
              <label key={visit.id} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={selected.includes(visit.id)}
                  onChange={() => toggle(visit.id)}
                />
                <span>
                  {visit.scheduledDate} · {visit.clientName} · {visit.caregiverName}
                  {locked ? ' (already started)' : ''}
                </span>
              </label>
            );
          })}
        </div>
        <label className="mt-4 block text-xs font-medium text-slate-600">
          Who will work instead
          <select
            value={caregiverId}
            onChange={(e) => setCaregiverId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Select caregiver</option>
            {options.map((cg) => (
              <option key={cg.id} value={cg.id}>{cg.fullName || cg.name || cg.email}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-xs font-medium text-slate-600">
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Cannot work these days"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Assign another caregiver'}
          </button>
        </div>
      </div>
    </div>
  );
}
