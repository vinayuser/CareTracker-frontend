import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  Search,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import Drawer from '../../../components/ui/Drawer';

const AVATAR_TONES = [
  'bg-rose-100 text-rose-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-cyan-100 text-cyan-700',
];

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function currentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  return { from: toDateKey(monday), to: toDateKey(sunday) };
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function formatHours(value) {
  return Number(value || 0).toFixed(2);
}

function avatarTone(name = '') {
  const sum = [...name].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

function KpiCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-[26px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={20} />
      </span>
    </div>
  );
}

const EMPTY_SUMMARY = {
  totalCaregivers: 0,
  totalHours: 0,
  totalPay: 0,
  agencyName: 'Your Agency',
};

export default function TimeCard() {
  const defaultRange = useMemo(() => currentWeekRange(), []);
  const [draftFrom, setDraftFrom] = useState(defaultRange.from);
  const [draftTo, setDraftTo] = useState(defaultRange.to);
  const [applied, setApplied] = useState({
    from: defaultRange.from,
    to: defaultRange.to,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [days, setDays] = useState([]);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 1, from: 0, to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const queryString = useCallback((extra = {}) => {
    const params = new URLSearchParams();
    if (applied.from) params.set('from', applied.from);
    if (applied.to) params.set('to', applied.to);
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    return params.toString();
  }, [applied]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance.get(`${API_ROUTES.AGENCY.TIME_CARD.LIST}?${queryString({ page, limit })}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || {};
        setDays(data.days || []);
        setItems(data.items || []);
        setSummary(data.summary || EMPTY_SUMMARY);
        setPagination(data.pagination || { page, limit, total: 0, totalPages: 1, from: 0, to: 0 });
        if (data.pagination?.page && data.pagination.page !== page) setPage(data.pagination.page);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load time cards');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [queryString, page, limit]);

  const applyFilters = () => {
    setApplied({
      from: draftFrom,
      to: draftTo,
    });
    setPage(1);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await axiosInstance.get(`${API_ROUTES.AGENCY.TIME_CARD.EXPORT}?${queryString()}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const match = /filename="([^"]+)"/.exec(res.headers?.['content-disposition'] || '');
      link.href = url;
      link.download = match?.[1] || 'time-card.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export the time card');
    } finally {
      setExporting(false);
    }
  };

  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`${API_ROUTES.AGENCY.TIME_CARD.DETAIL(row.id)}?${queryString()}`);
      setDetail(res.data?.data || null);
    } catch {
      toast.error('Could not load this time card');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const pages = pageNumbers(pagination.page || 1, pagination.totalPages || 1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock size={20} />
          </span>
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Time Card</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              View caregiver time logs and pay for your agency.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportExcel}
          disabled={exporting || loading}
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm hover:bg-emerald-50 disabled:opacity-50"
        >
          <Download size={16} />
          {exporting ? 'Exporting…' : 'Export to Excel'}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <Calendar size={13} />
              Date Range
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-slate-800 outline-none"
              />
              <span className="text-slate-300">–</span>
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium text-slate-800 outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total Caregivers" value={summary.totalCaregivers} icon={Users} tone="bg-sky-50 text-sky-600" />
        <KpiCard label="Total Hours" value={`${formatHours(summary.totalHours)} hrs`} icon={Clock} tone="bg-amber-50 text-amber-500" />
        <KpiCard label="Total Pay (Week)" value={formatMoney(summary.totalPay)} icon={DollarSign} tone="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[12px] font-semibold text-slate-500">
                <th className="px-3 py-3 text-center">#</th>
                <th className="min-w-[200px] px-3 py-3">Caregiver Name</th>
                <th className="min-w-[140px] px-3 py-3">Location</th>
                <th className="min-w-[150px] px-3 py-3">In / Out Time</th>
                {days.map((day) => (
                  <th key={day.key} className="min-w-[92px] px-2 py-3 text-center">
                    <div className="text-[12px] font-semibold text-slate-700">{day.weekday}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-slate-400">{day.dateLabel}</div>
                  </th>
                ))}
                <th className="min-w-[110px] px-3 py-3 text-center">Total</th>
                <th className="min-w-[120px] px-3 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6 + days.length} className="px-4 py-12 text-center text-sm text-slate-500">
                    Loading time cards…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6 + days.length} className="px-4 py-12 text-center text-sm text-slate-500">
                    No caregiver time logs in this date range.
                  </td>
                </tr>
              ) : items.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3 text-center text-slate-500">
                    {(pagination.from || 1) + index}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarTone(row.caregiverName)}`}>
                        {row.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{row.caregiverName}</p>
                        <p className="text-[11px] font-medium text-slate-400">{row.caregiverCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <p>{row.location}</p>
                  </td>
                  <td className="px-3 py-3 text-[12px] leading-5 text-slate-600">
                    <p><span className="text-slate-400">In</span> {row.shiftIn || '—'}</p>
                    <p><span className="text-slate-400">Out</span> {row.shiftOut || '—'}</p>
                  </td>
                  {days.map((day) => {
                    const slot = row.days?.[day.key] || {};
                    return (
                      <td key={day.key} className="px-2 py-3 text-center text-[12px] leading-5 text-slate-600">
                        <p>{slot.in || '—'}</p>
                        <p>{slot.out || '—'}</p>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <p className="font-semibold text-slate-900">{formatHours(row.totalHours)} hrs</p>
                    <p className="text-[12px] font-semibold text-emerald-600">{formatMoney(row.totalAmount)}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDetail(row)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total || 0} caregivers
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((n) => (
              n === '…' ? (
                <span key={`gap-${n}`} className="px-1 text-slate-400">…</span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
                    n === (pagination.page || page)
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {n}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1) || loading}
              onClick={() => setPage((n) => n + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 outline-none"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Time card details"
        width="2xl"
      >
        {detailLoading || !detail ? (
          <p className="py-6 text-sm text-slate-500">Loading time card…</p>
        ) : (
          <div>
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${avatarTone(detail.caregiverName)}`}>
                  {detail.initials}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900">{detail.caregiverName}</p>
                  <p className="text-xs text-slate-500">
                    {detail.caregiverCode}
                    {detail.location && detail.location !== '—' ? ` · ${detail.location}` : ''}
                    {detail.agencyName ? ` · ${detail.agencyName}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-slate-500">Hours</p>
                  <p className="text-lg font-bold text-slate-900">{formatHours(detail.totalHours)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-[11px] font-medium text-emerald-700">Pay</p>
                  <p className="text-lg font-bold text-emerald-700">{formatMoney(detail.totalAmount)}</p>
                </div>
              </div>
            </div>
            <div className="py-4">
              {(detail.visits || []).length === 0 ? (
                <p className="text-sm text-slate-500">No visits in this range.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 pr-2">Client</th>
                      <th className="py-2 pr-2">Clock</th>
                      <th className="py-2 pr-2 text-right">Hours</th>
                      <th className="py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.visits.map((visit) => (
                      <tr key={visit.id} className="border-b border-slate-100">
                        <td className="py-2.5 pr-2 align-top">
                          <p className="font-medium text-slate-800">{visit.date}</p>
                          <p className="text-[11px] text-slate-400">{visit.status}</p>
                        </td>
                        <td className="py-2.5 pr-2 align-top">
                          <p className="text-slate-800">{visit.clientName}</p>
                          <p className="text-[11px] text-slate-400">{visit.service}</p>
                        </td>
                        <td className="py-2.5 pr-2 align-top text-[12px] text-slate-600">
                          <p>In {visit.clockIn || visit.scheduledIn || '—'}</p>
                          <p>Out {visit.clockOut || visit.scheduledOut || '—'}</p>
                          <p className="text-[11px] text-slate-400">
                            {formatMoney(visit.hourlyRate)}/hr
                          </p>
                        </td>
                        <td className="py-2.5 pr-2 text-right align-top font-medium text-slate-800">
                          {formatHours(visit.hours)}
                        </td>
                        <td className="py-2.5 text-right align-top font-semibold text-emerald-600">
                          {formatMoney(visit.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
