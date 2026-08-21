import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { confirmAlert } from '../../../utils/swal';

const statusTone = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-rose-50 text-rose-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

export default function LeaveRequests() {
  const [status, setStatus] = useState('Pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_ROUTES.AGENCY.LEAVE_REQUESTS, {
        params: { status: status === 'All' ? undefined : status, search: search || undefined, page, limit: 10 },
      });
      const data = res.data?.data || {};
      setList(Array.isArray(data.list) ? data.list : []);
      setPagination(data.pagination || { total: 0, totalPages: 1, from: 0, to: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  const review = async (row, action) => {
    const ok = await confirmAlert({
      title: action === 'approve' ? 'Approve leave?' : 'Reject leave?',
      text: action === 'approve'
        ? `${row.caregiverName}'s ${row.typeName} (${row.rangeLabel}) will be approved and their visits that day will be marked Leave.`
        : `${row.caregiverName}'s request will be rejected and the days returned to their balance.`,
      confirmText: action === 'approve' ? 'Approve' : 'Reject',
      danger: action === 'reject',
    });
    if (!ok) return;
    const url = `${API_ROUTES.AGENCY.LEAVE_REQUESTS}/${row.id}/${action}`;
    await axiosInstance.post(url, {});
    toast.success(action === 'approve' ? 'Leave approved' : 'Leave rejected');
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Leave Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Approve or reject caregiver leave. Approved days are marked as leave on the visit schedule.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['Pending', 'Approved', 'Rejected', 'Cancelled', 'All'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { setStatus(item); setPage(1); }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${status === item ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'}`}
          >
            {item}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
          placeholder="Search caregiver or type…"
          className="ml-auto min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Caregiver</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-500">Loading requests…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-500">No leave requests.</td></tr>
            ) : list.map((row) => (
              <tr key={row.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">{row.caregiverName}</td>
                <td className="px-4 py-3 text-slate-600">{row.typeName}</td>
                <td className="px-4 py-3 text-slate-600">{row.rangeLabel}</td>
                <td className="px-4 py-3 text-slate-600">{row.days}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-500">{row.reason || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[row.status] || 'bg-slate-100 text-slate-600'}`}>{row.status}</span>
                </td>
                <td className="px-4 py-3">
                  {row.status === 'Pending' ? (
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => review(row, 'approve')} className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                        <Check size={13} /> Approve
                      </button>
                      <button type="button" onClick={() => review(row, 'reject')} className="inline-flex items-center gap-1 rounded-lg border border-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                        <X size={13} /> Reject
                      </button>
                    </div>
                  ) : <p className="text-right text-xs text-slate-400">{row.reviewedByName || '—'}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {pagination.from} to {pagination.to} of {pagination.total}</span>
          <div className="flex gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded p-1 disabled:text-slate-300"><ChevronLeft size={14} /></button>
            <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="rounded p-1 disabled:text-slate-300"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
