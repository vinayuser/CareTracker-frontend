import { useEffect, useState } from 'react';
import { CalendarOff, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const statusTone = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

const EMPTY = { typeKey: '', startDate: '', endDate: '', reason: '' };

export default function CaregiverLeaves() {
  const [showForm, setShowForm] = useState(false);
  const [balance, setBalance] = useState({ items: [] });
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await axiosInstance.get(API_ROUTES.CAREGIVER.LEAVES);
    const data = res.data?.data || {};
    setBalance(data.balance || { items: [] });
    setList(Array.isArray(data.list) ? data.list : []);
    setForm((prev) => ({
      ...prev,
      typeKey: prev.typeKey || data.balance?.items?.[0]?.key || '',
    }));
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const submit = async () => {
    if (!form.typeKey || !form.startDate || !form.endDate) {
      toast.error('Leave type and dates are required');
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post(API_ROUTES.CAREGIVER.LEAVES, form);
      toast.success('Leave request submitted for agency approval');
      setForm((prev) => ({ ...EMPTY, typeKey: prev.typeKey }));
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    await axiosInstance.post(`${API_ROUTES.CAREGIVER.LEAVES}/${id}/cancel`);
    toast.success('Request cancelled');
    load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Check balances and apply for leave. National holidays are already marked off — they do not use your leave days.</p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900">New Leave Request</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Leave Type</label>
              <select value={form.typeKey} onChange={(e) => setForm((f) => ({ ...f, typeKey: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {(balance.items || []).map((item) => (
                  <option key={item.key} value={item.key}>{item.name} ({item.available} available)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value, endDate: f.endDate || e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
              <textarea rows={2} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Optional note..." />
            </div>
          </div>
          <button type="button" onClick={submit} disabled={saving} className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(balance.items || []).map((item) => (
          <div key={item.key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <CalendarOff size={20} className="text-primary" />
            <p className="mt-2 text-sm font-medium text-gray-900">{item.name}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{item.available}</p>
            <p className="text-xs text-gray-500">{item.used} used · {item.pending} pending · {item.allocated} total</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Leave History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {list.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">No leave requests yet.</p>
          ) : list.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">{item.typeName}</p>
                <p className="text-gray-500">{item.rangeLabel} · {item.days} day(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[item.status] || 'bg-slate-100 text-slate-600'}`}>
                  {item.status}
                </span>
                {item.status === 'Pending' ? (
                  <button type="button" onClick={() => cancel(item.id)} className="text-xs font-medium text-rose-600 hover:underline">Cancel</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
