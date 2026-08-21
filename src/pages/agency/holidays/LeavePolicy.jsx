import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary';

export default function LeavePolicy() {
  const [types, setTypes] = useState([]);
  const [applyToExisting, setApplyToExisting] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_ROUTES.AGENCY.LEAVE_POLICY);
      setTypes(res.data?.data?.types || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (types.some((t) => !String(t.name || '').trim())) {
      toast.error('Each leave type needs a name');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.put(API_ROUTES.AGENCY.LEAVE_POLICY, { types, applyToExisting });
      toast.success('Leave policy saved. New caregivers receive these balances on hire.');
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Leave Policy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set how many casual, sick, and other leave days a caregiver receives when they are onboarded.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Loading policy…</p> : (
          <div className="space-y-3">
            {types.map((type, index) => (
              <div key={type.key || index} className="grid gap-3 sm:grid-cols-[1fr_140px_40px]">
                <input
                  value={type.name}
                  onChange={(e) => setTypes((rows) => rows.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))}
                  className={inputClass}
                  placeholder="Leave type"
                />
                <input
                  type="number"
                  min="0"
                  value={type.days}
                  onChange={(e) => setTypes((rows) => rows.map((row, i) => (i === index ? { ...row, days: Number(e.target.value) } : row)))}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setTypes((rows) => rows.filter((_, i) => i !== index))}
                  className="rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50"
                  aria-label="Remove leave type"
                >
                  <Trash2 size={15} className="mx-auto" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTypes((rows) => [...rows, { key: '', name: '', days: 0 }])}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              <Plus size={14} /> Add leave type
            </button>
          </div>
        )}

        <label className="mt-5 flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={applyToExisting} onChange={(e) => setApplyToExisting(e.target.checked)} className="mt-0.5" />
          Also update allocated days for existing caregivers this year (used/pending days are kept)
        </label>

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={save} disabled={saving || loading} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save policy'}
          </button>
        </div>
      </div>
    </div>
  );
}
