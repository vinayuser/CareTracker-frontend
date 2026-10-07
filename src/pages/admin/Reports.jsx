import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  RotateCcw,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import Drawer from '../../components/ui/Drawer';

const PAGE_SIZE = 5;

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const STATUS_STYLE = {
  caregiver_only: 'bg-slate-100 text-slate-700',
  no_schedule: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  schedule_no_evv: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
  evv_client_pending: 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-100',
  evv_agency_pending: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  evv_approved: 'bg-green-50 text-green-700 ring-1 ring-green-100',
};

const EVV_PILL = {
  'Client Pending': 'bg-sky-50 text-sky-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Rejected: 'bg-rose-50 text-rose-700',
};

const EMPTY_SUMMARY = {
  caregiverOnly: 0,
  noSchedule: 0,
  scheduleNoEvv: 0,
  evvAgencyPending: 0,
};

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

function YesNo({ value }) {
  const yes = value === 'Yes';
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${yes ? 'text-emerald-600' : 'text-rose-500'}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-white ${yes ? 'bg-emerald-500' : 'bg-rose-500'}`}>
        {yes ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
      </span>
      {value}
    </span>
  );
}

function Pill({ value }) {
  if (!value || value === '—') return <span className="text-slate-400">—</span>;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${EVV_PILL[value] || 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  );
}

function KpiCard({ label, value, hint, icon: Icon, className, iconClass, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left shadow-sm transition ${
        active ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
      } ${className}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-snug text-slate-800">{label}</span>
        <span className="mt-1 block text-[28px] font-bold leading-none text-slate-900">{value}</span>
        <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>
      </span>
    </button>
  );
}

export default function Reports() {
  const [agencies, setAgencies] = useState([]);
  const [clients, setClients] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [draftAgencies, setDraftAgencies] = useState([]);
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [draftClientId, setDraftClientId] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [applied, setApplied] = useState({
    agencyIds: [],
    from: '',
    to: '',
    clientId: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [menuId, setMenuId] = useState('');
  const [detail, setDetail] = useState(null);
  const agencyRef = useRef(null);
  const exportRef = useRef(null);

  const queryString = useCallback((extra = {}) => {
    const params = new URLSearchParams();
    if (applied.agencyIds.length) params.set('agencyIds', applied.agencyIds.join(','));
    if (applied.from) params.set('from', applied.from);
    if (applied.to) params.set('to', applied.to);
    if (applied.clientId) params.set('clientId', applied.clientId);
    if (applied.status) params.set('status', applied.status);
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    return params.toString();
  }, [applied]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axiosInstance.get(`${API_ROUTES.ADMIN.REPORTS.EVV_SUMMARY}?${queryString({ page, limit: PAGE_SIZE })}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || {};
        setAgencies(data.agencies || []);
        setClients(data.clients || []);
        setStatuses(data.statuses || []);
        setItems(data.items || []);
        setSummary({ ...EMPTY_SUMMARY, ...(data.summary || {}) });
        setPagination(data.pagination || { page, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0 });
        if (data.pagination?.page && data.pagination.page !== page) setPage(data.pagination.page);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load the report');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [queryString, page]);

  useEffect(() => {
    const onPointer = (event) => {
      if (agencyRef.current && !agencyRef.current.contains(event.target)) setAgencyOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target)) setExportOpen(false);
      if (!event.target.closest('[data-row-menu]')) setMenuId('');
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  const today = todayKey();

  const setRangeFrom = (value) => {
    const next = value && value > today ? today : value;
    setDraftFrom(next);
    if (next && draftTo && next > draftTo) setDraftTo(next);
  };

  const setRangeTo = (value) => {
    const capped = value && value > today ? today : value;
    const next = capped && draftFrom && capped < draftFrom ? draftFrom : capped;
    setDraftTo(next);
  };

  const applyFilters = (next = {}) => {
    let from = next.from ?? draftFrom;
    let to = next.to ?? draftTo;
    if (from && from > today) {
      toast.error('Start date cannot be in the future');
      from = today;
      setDraftFrom(today);
    }
    if (to && to > today) {
      toast.error('End date cannot be in the future');
      to = today;
      setDraftTo(today);
    }
    if (from && to && from > to) {
      toast.error('Start date must be on or before end date');
      return;
    }
    setApplied({
      agencyIds: next.agencyIds ?? draftAgencies,
      from,
      to,
      clientId: next.clientId ?? draftClientId,
      status: next.status ?? draftStatus,
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftAgencies([]);
    setDraftFrom('');
    setDraftTo('');
    setDraftClientId('');
    setDraftStatus('');
    setApplied({ agencyIds: [], from: '', to: '', clientId: '', status: '' });
    setPage(1);
  };

  const toggleAgency = (id) => {
    setDraftAgencies((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const selectCard = (status) => {
    const next = applied.status === status ? '' : status;
    setDraftStatus(next);
    applyFilters({ status: next });
  };

  const exportCsv = async () => {
    setExporting(true);
    setExportOpen(false);
    try {
      const res = await axiosInstance.get(`${API_ROUTES.ADMIN.REPORTS.EVV_SUMMARY_EXPORT}?${queryString()}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'agency-caregiver-evv-summary.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export the report');
    } finally {
      setExporting(false);
    }
  };

  const agencyLabel = draftAgencies.length
    ? `${draftAgencies.length} selected`
    : 'Select agencies';
  const visibleClients = applied.agencyIds.length
    ? clients.filter((client) => applied.agencyIds.includes(client.agencyId) || draftAgencies.includes(client.agencyId))
    : clients;
  const pages = pageNumbers(pagination.page || 1, pagination.totalPages || 1);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <BarChart3 size={14} />
          Reports
        </p>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
          Agency Caregiver &amp; EVV Summary Report
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and export caregiver, schedule and EVV status by agency.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[180px] flex-1" ref={agencyRef}>
            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <Building2 size={13} />
              Agencies
            </label>
            <button
              type="button"
              onClick={() => setAgencyOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <span className={draftAgencies.length ? 'font-medium text-slate-800' : 'text-slate-400'}>{agencyLabel}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            {agencyOpen ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                {agencies.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-slate-400">No agencies</p>
                ) : agencies.map((agency) => (
                  <label key={agency.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={draftAgencies.includes(agency.id)}
                      onChange={() => toggleAgency(agency.id)}
                    />
                    <span className="truncate">{agency.name}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="min-w-[260px] flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <Calendar size={13} />
              Date Range
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
              <input
                type="date"
                value={draftFrom}
                max={draftTo && draftTo < today ? draftTo : today}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-slate-800 outline-none"
              />
              <span className="text-slate-300">–</span>
              <input
                type="date"
                value={draftTo}
                min={draftFrom || undefined}
                max={today}
                onChange={(e) => setRangeTo(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
              <UserRound size={13} />
              Client
            </label>
            <select
              value={draftClientId}
              onChange={(e) => setDraftClientId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
            >
              <option value="">Select client</option>
              {visibleClients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 block text-[12px] font-medium text-slate-500">Status</label>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => applyFilters()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Filter size={15} />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Create Caregiver Only"
          value={summary.caregiverOnly}
          hint="Agencies / Clients"
          icon={Users}
          className="bg-white"
          iconClass="bg-sky-50 text-sky-600"
          active={applied.status === 'caregiver_only'}
          onClick={() => selectCard('caregiver_only')}
        />
        <KpiCard
          label="No Schedule"
          value={summary.noSchedule}
          hint="Agencies / Clients"
          icon={Calendar}
          className="bg-amber-50/80"
          iconClass="bg-amber-100 text-amber-600"
          active={applied.status === 'no_schedule'}
          onClick={() => selectCard('no_schedule')}
        />
        <KpiCard
          label="Caregiver + Schedule (No EVV Form)"
          value={summary.scheduleNoEvv}
          hint="Agencies / Clients"
          icon={Calendar}
          className="bg-violet-50/80"
          iconClass="bg-violet-100 text-violet-600"
          active={applied.status === 'schedule_no_evv'}
          onClick={() => selectCard('schedule_no_evv')}
        />
        <KpiCard
          label="Caregiver + Schedule + EVV (Client Approved / Agency Pending)"
          value={summary.evvAgencyPending}
          hint="Agencies / Clients"
          icon={Calendar}
          className="bg-emerald-50/70"
          iconClass="bg-emerald-100 text-emerald-600"
          active={applied.status === 'evv_agency_pending'}
          onClick={() => selectCard('evv_agency_pending')}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-900">Report Details</h2>
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((open) => !open)}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download size={15} />
              {exporting ? 'Exporting…' : 'Export Data'}
              <ChevronDown size={14} />
            </button>
            {exportOpen ? (
              <button
                type="button"
                onClick={exportCsv}
                className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-50"
              >
                Export CSV
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[12px] font-semibold text-slate-500">
                <th className="px-4 py-3">Agency Name</th>
                <th className="px-3 py-3">Client Name</th>
                <th className="px-3 py-3">Caregiver Name</th>
                <th className="px-3 py-3">Create Caregiver</th>
                <th className="px-3 py-3">Schedule Created</th>
                <th className="px-3 py-3">EVV Form</th>
                <th className="px-3 py-3">Client EVV Status</th>
                <th className="px-3 py-3">Agency EVV Status</th>
                <th className="min-w-[220px] px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">Loading report…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-500">No records match these filters.</td>
                </tr>
              ) : items.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.agencyName}</td>
                  <td className="px-3 py-3 text-slate-700">{row.clientName}</td>
                  <td className="px-3 py-3 text-slate-700">{row.caregiverName}</td>
                  <td className="px-3 py-3"><YesNo value={row.createCaregiver} /></td>
                  <td className="px-3 py-3"><YesNo value={row.scheduleCreated} /></td>
                  <td className="px-3 py-3"><YesNo value={row.evvForm} /></td>
                  <td className="px-3 py-3"><Pill value={row.clientEvvStatus} /></td>
                  <td className="px-3 py-3"><Pill value={row.agencyEvvStatus} /></td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex max-w-[240px] rounded-lg px-2.5 py-1 text-xs font-semibold leading-snug ${STATUS_STYLE[row.status] || STATUS_STYLE.caregiver_only}`}>
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDetail(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <div className="relative" data-row-menu>
                        <button
                          type="button"
                          onClick={() => setMenuId((current) => (current === row.id ? '' : row.id))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {menuId === row.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDetail(row);
                              setMenuId('');
                            }}
                            className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-lg hover:bg-slate-50"
                          >
                            View details
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total || 0} records
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((n, index) => (
              n === '…' ? (
                <span key={`gap-${index}`} className="px-1 text-slate-400">…</span>
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
          </div>
        </div>
      </div>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Report details" width="lg">
        {detail ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Agency</p>
              <p className="text-base font-semibold text-slate-900">{detail.agencyName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-slate-400">Client</p>
                <p className="font-medium text-slate-800">{detail.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Caregiver</p>
                <p className="font-medium text-slate-800">{detail.caregiverName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <p>Create caregiver: <YesNo value={detail.createCaregiver} /></p>
              <p>Schedule: <YesNo value={detail.scheduleCreated} /></p>
              <p>EVV form: <YesNo value={detail.evvForm} /></p>
              <p>Schedules on file: <span className="font-semibold">{detail.scheduleCount}</span></p>
              <p>EVV forms: <span className="font-semibold">{detail.evvCount}</span></p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>Client EVV <Pill value={detail.clientEvvStatus} /></span>
              <span>Agency EVV <Pill value={detail.agencyEvvStatus} /></span>
            </div>
            <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[detail.status] || ''}`}>
              {detail.statusLabel}
            </span>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
