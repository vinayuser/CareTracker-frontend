import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Eye,
  FileText,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import ActionIconButton from '../../components/ui/ActionIconButton';

const PAGE_SIZE = 5;

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'CG';
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

function StatusPill({ status }) {
  const map = {
    Active: 'bg-emerald-50 text-emerald-700',
    Inactive: 'bg-slate-100 text-slate-600',
    Pending: 'bg-amber-50 text-amber-700',
    Verified: 'bg-emerald-50 text-emerald-700',
    Paid: 'bg-emerald-50 text-emerald-700',
    Upcoming: 'bg-slate-100 text-slate-600',
    Confirmed: 'bg-emerald-50 text-emerald-700',
    Overdue: 'bg-rose-50 text-rose-700',
    'In Progress': 'bg-emerald-50 text-emerald-700',
    'On Leave': 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || '—'}
    </span>
  );
}

function Avatar({ name, src, size = 'h-9 w-9' }) {
  if (src) return <img src={src} alt="" className={`${size} rounded-full object-cover`} />;
  return (
    <span className={`inline-flex ${size} items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary`}>
      {initials(name)}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex min-w-[150px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold tracking-tight text-slate-900">{Number(value || 0).toLocaleString()}</p>
      </div>
    </div>
  );
}

function CaregiverSelect({ caregivers, value, onChange }) {
  const selected = caregivers.find((c) => c.id === value);
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none truncate rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-[12px] font-medium text-slate-700 outline-none focus:border-primary"
      >
        {caregivers.map((c) => (
          <option key={c.id} value={c.id}>{c.name} ({c.caregiverCode})</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
      {!selected && !caregivers.length ? <span className="sr-only">No caregivers</span> : null}
    </div>
  );
}

function WidgetCard({ title, action, headerLink, children, footer }) {
  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {headerLink}
        </div>
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
      {footer ? <div className="shrink-0 border-t border-slate-100 px-4 py-3">{footer}</div> : null}
    </div>
  );
}

const EMPTY_OVERVIEW = {
  caregiver: null,
  clients: [],
  documents: [],
  upcoming: [],
  next: null,
  invoices: [],
};

export default function AdminCaregivers() {
  const [options, setOptions] = useState([]);
  const [agencyId, setAgencyId] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  const [stats, setStats] = useState({ total: 0, active: 0, upcomingSchedules: 0, overdueInvoices: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const selectedAgency = useMemo(
    () => options.find((o) => o.id === agencyId) || null,
    [options, agencyId],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
        setOptions(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        toast.error('Failed to load agencies');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectorOpen) return undefined;
    const onDown = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) setSelectorOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [selectorOpen]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSelectedId('');
  }, [agencyId, debouncedSearch]);

  const loadStatsAndList = async () => {
    setLoading(true);
    try {
      const params = {
        agencyId: agencyId || undefined,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      };
      const [statsRes, listRes] = await Promise.all([
        axiosInstance.get(API_ROUTES.ADMIN.CAREGIVERS.STATS, { params: { agencyId: agencyId || undefined } }),
        axiosInstance.get(API_ROUTES.ADMIN.CAREGIVERS.LIST, { params }),
      ]);
      setStats(statsRes.data?.data || { total: 0, active: 0, upcomingSchedules: 0, overdueInvoices: 0 });
      const data = listRes.data?.data || {};
      const rows = Array.isArray(data.list) ? data.list : [];
      setList(rows);
      setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0 });
      setSelectedId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : (rows[0]?.id || '')));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndList();
  }, [agencyId, page, debouncedSearch]);

  useEffect(() => {
    if (!selectedId) {
      setOverview(EMPTY_OVERVIEW);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setOverviewLoading(true);
      try {
        const res = await axiosInstance.get(`${API_ROUTES.ADMIN.CAREGIVERS.OVERVIEW}/${selectedId}/overview`);
        if (!cancelled) setOverview(res.data?.data || EMPTY_OVERVIEW);
      } catch {
        if (!cancelled) setOverview(EMPTY_OVERVIEW);
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedId]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const portalHint = () => toast.info('This action is managed in the agency portal.');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Caregiver Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage caregivers, their clients, schedules, documents and invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadStatsAndList}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={portalHint}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} /> Add New Caregiver
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div ref={selectorRef} className="relative min-w-[200px]">
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Select Agency</label>
          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            className="flex w-full min-w-[200px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm"
          >
            <span className="truncate font-semibold text-slate-900">{selectedAgency?.name || 'All Agencies'}</span>
            <ChevronDown size={16} className="ml-2 shrink-0 text-slate-400" />
          </button>
          {selectorOpen ? (
            <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => { setAgencyId(''); setSelectorOpen(false); }}
                className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${!agencyId ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-800'}`}
              >
                All Agencies
              </button>
              {options.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setAgencyId(item.id); setSelectorOpen(false); }}
                  className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${item.id === agencyId ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-800'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <KpiCard icon={UserCheck} label="Total Caregivers" value={stats.total} tone="bg-sky-50 text-sky-600" />
        <KpiCard icon={CheckCircle2} label="Active Caregivers" value={stats.active} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={Calendar} label="Upcoming Schedules" value={stats.upcomingSchedules} tone="bg-violet-50 text-violet-600" />
        <KpiCard icon={AlertCircle} label="Overdue Invoices" value={stats.overdueInvoices} tone="bg-rose-50 text-rose-600" />

        <div className="relative min-w-[240px] flex-1">
          <label className="mb-1 block text-[11px] font-medium text-transparent">Search</label>
          <Search size={15} className="pointer-events-none absolute left-3 top-[34px] text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search caregiver by name, ID or phone..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Caregiver Name</th>
                <th className="px-4 py-3">Caregiver ID</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Associated Clients</th>
                <th className="px-4 py-3">Next Schedule</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500">Loading caregivers…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500">No caregivers found.</td></tr>
              ) : list.map((caregiver) => (
                <tr
                  key={caregiver.id}
                  onClick={() => setSelectedId(caregiver.id)}
                  className={`cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/80 ${selectedId === caregiver.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={caregiver.name} src={caregiver.profilePic} />
                      <p className="font-semibold text-slate-900">{caregiver.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700">{caregiver.caregiverCode}</td>
                  <td className="px-4 py-3.5 text-slate-600">{caregiver.agencyName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{caregiver.phone || '—'}</td>
                  <td className="px-4 py-3.5"><StatusPill status={caregiver.status} /></td>
                  <td className="max-w-[200px] truncate px-4 py-3.5 text-slate-600" title={caregiver.associatedClients?.map((c) => c.name).join(', ') || ''}>
                    {caregiver.associatedClients?.length
                      ? caregiver.associatedClients.map((c) => c.name).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {caregiver.nextSchedule ? (
                      <div className="flex items-start gap-2">
                        <CalendarDays size={14} className="mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium text-slate-800">{caregiver.nextSchedule.date} {caregiver.nextSchedule.time}</p>
                          <p className="text-[11px] text-slate-400">
                            {caregiver.nextSchedule.service}
                            {caregiver.nextSchedule.clientName ? ` - ${caregiver.nextSchedule.clientName}` : ''}
                          </p>
                        </div>
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <ActionIconButton label="View" className="text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); setSelectedId(caregiver.id); }}>
                        <Eye size={15} />
                      </ActionIconButton>
                      <ActionIconButton label="More" className="text-slate-500 hover:bg-slate-100" onClick={(e) => { e.stopPropagation(); portalHint(); }}>
                        <MoreVertical size={15} />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>Showing {pagination.from} to {pagination.to} of {Number(pagination.total || 0).toLocaleString()} caregivers</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded p-1 hover:bg-slate-100 disabled:text-slate-300">
              <ChevronLeft size={14} />
            </button>
            {pages.map((item, idx) => (
              item === '…' ? <span key={`e-${idx}`} className="px-1">…</span> : (
                <button key={item} type="button" onClick={() => setPage(item)} className={`min-w-[28px] rounded px-2 py-1 ${item === page ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
                  {item}
                </button>
              )
            ))}
            <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)} className="rounded p-1 hover:bg-slate-100 disabled:text-slate-300">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <WidgetCard
          title="Clients Associated"
          headerLink={<button type="button" onClick={portalHint} className="text-[12px] font-medium text-primary hover:underline">View All</button>}
          action={<CaregiverSelect caregivers={list} value={selectedId} onChange={setSelectedId} />}
          footer={(
            <button type="button" onClick={portalHint} className="w-full text-center text-[13px] font-medium text-primary hover:underline">View All Clients</button>
          )}
        >
          {overviewLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading…</p> : overview.clients.length ? (
            <ul className="space-y-3">
              {overview.clients.map((client) => (
                <li key={client.id} className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <Avatar name={client.name} size="h-9 w-9" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{client.name}</p>
                      <p className="text-[11px] text-slate-400">{client.clientCode || '—'}</p>
                      {client.nextVisit ? (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {client.nextVisit.date} {client.nextVisit.time}
                          {client.nextVisit.service ? ` · ${client.nextVisit.service}` : ''}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <StatusPill status={client.status} />
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-sm text-slate-400">No clients assigned.</p>}
        </WidgetCard>

        <WidgetCard
          title="Caregiver Documents"
          headerLink={<button type="button" onClick={portalHint} className="text-[12px] font-medium text-primary hover:underline">View All</button>}
          action={<CaregiverSelect caregivers={list} value={selectedId} onChange={setSelectedId} />}
          footer={(
            <button type="button" onClick={portalHint} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <CloudUpload size={15} /> Upload Document
            </button>
          )}
        >
          {overviewLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading…</p> : overview.documents.length ? (
            <ul className="space-y-3">
              {overview.documents.map((doc) => (
                <li key={doc.key} className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <FileText size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{doc.name}</p>
                      <p className="text-[11px] text-slate-400">{doc.uploadedOn ? `Uploaded on ${doc.uploadedOn}` : 'Not uploaded'}</p>
                    </div>
                  </div>
                  <StatusPill status={doc.status} />
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-sm text-slate-400">No documents on file.</p>}
        </WidgetCard>

        <WidgetCard
          title="Upcoming Schedules"
          headerLink={<button type="button" onClick={portalHint} className="text-[12px] font-medium text-primary hover:underline">View Calendar</button>}
          action={<CaregiverSelect caregivers={list} value={selectedId} onChange={setSelectedId} />}
          footer={(
            <button type="button" onClick={portalHint} className="w-full text-center text-[13px] font-medium text-primary hover:underline">View Full Schedule</button>
          )}
        >
          {overviewLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading…</p> : overview.upcoming.length ? (
            <ul className="space-y-3">
              {overview.upcoming.map((visit) => (
                <li key={visit.id} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{visit.month} {visit.day} {visit.weekday}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{visit.startTime} - {visit.endTime}</p>
                      <p className="text-[12px] text-slate-500">{visit.service}</p>
                      <p className="text-[11px] text-slate-400">{visit.clientName}</p>
                    </div>
                    <StatusPill status={visit.status === 'In Progress' ? 'In Progress' : 'Upcoming'} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-sm text-slate-400">No upcoming visits.</p>}
        </WidgetCard>

        <WidgetCard
          title="Next Schedule"
          action={<CaregiverSelect caregivers={list} value={selectedId} onChange={setSelectedId} />}
          footer={(
            <button type="button" onClick={portalHint} className="w-full text-center text-[13px] font-medium text-primary hover:underline">View Details</button>
          )}
        >
          {overviewLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading…</p> : overview.next ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{overview.next.dateLabel}</p>
                <StatusPill status={overview.next.status} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">{overview.next.startTime} - {overview.next.endTime}</p>
              <p className="mt-1 text-sm text-slate-600">{overview.next.service}</p>
              <p className="mt-1 text-[12px] text-slate-500">{overview.next.clientName}</p>
              {overview.next.address ? (
                <p className="mt-2 flex items-start gap-1.5 text-[12px] text-slate-400">
                  <MapPin size={12} className="mt-0.5 shrink-0" />
                  <span>{overview.next.address}</span>
                </p>
              ) : null}
              <p className={`mt-4 text-sm font-semibold ${overview.next.rawStatus === 'InProgress' ? 'text-emerald-600' : 'text-slate-500'}`}>
                Status: {overview.next.status}
              </p>
            </div>
          ) : <p className="py-8 text-center text-sm text-slate-400">No upcoming visit scheduled.</p>}
        </WidgetCard>

        <WidgetCard
          title="Invoices"
          headerLink={<button type="button" onClick={portalHint} className="text-[12px] font-medium text-primary hover:underline">View All</button>}
          action={<CaregiverSelect caregivers={list} value={selectedId} onChange={setSelectedId} />}
          footer={(
            <button type="button" onClick={portalHint} className="w-full text-center text-[13px] font-medium text-primary hover:underline">View All Invoices</button>
          )}
        >
          {overviewLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading…</p> : overview.invoices.length ? (
            <ul className="space-y-3">
              {overview.invoices.map((inv) => (
                <li key={inv.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{inv.invoiceCode}</p>
                    <p className="text-[11px] text-slate-400">{inv.date}</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">{formatMoney(inv.amount)}</p>
                  </div>
                  <StatusPill status={inv.status} />
                </li>
              ))}
            </ul>
          ) : <p className="py-8 text-center text-sm text-slate-400">No invoices yet.</p>}
        </WidgetCard>
      </div>
    </div>
  );
}
