import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import ActionIconButton from '../ui/ActionIconButton';

const PAGE_SIZE = 10;
const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Pending'];

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'CG';
}

function StatusPill({ status }) {
  const tone =
    status === 'Active'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'Inactive'
        ? 'bg-rose-50 text-rose-700'
        : status === 'Pending'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-600';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      {status || '—'}
    </span>
  );
}

function SkillPills({ skills = [] }) {
  if (!skills.length) {
    return <span className="text-sm text-slate-400">—</span>;
  }
  const visible = skills.slice(0, 3);
  const rest = skills.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
        >
          {skill}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, trend }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{Number(value || 0).toLocaleString()}</p>
          {trend != null ? (
            <p className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold ${
              trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
            >
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}% vs last month
            </p>
          ) : null}
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export default function AgencyCaregiversTab({ agencyId, agencyName }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    newThisMonth: 0,
    trendPct: 0,
  });
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [agencyId, debouncedSearch, status]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(
          `${API_ROUTES.ADMIN.AGENCY.CAREGIVERS}/${agencyId}/caregivers`,
          {
            params: {
              page,
              limit: PAGE_SIZE,
              search: debouncedSearch || undefined,
              status: status === 'All' ? undefined : status,
            },
          },
        );
        if (cancelled) return;
        const data = response.data?.data || {};
        setStats(data.stats || {});
        setList(Array.isArray(data.list) ? data.list : []);
        setPagination(data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
          from: 0,
          to: 0,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load caregivers');
        setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [agencyId, page, debouncedSearch, status]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const handleExport = () => {
    if (!list.length) {
      toast.info('No caregivers to export');
      return;
    }
    const rows = [
      ['Code', 'Name', 'Email', 'Phone', 'Joined On', 'Skills', 'Status'],
      ...list.map((cg) => [
        cg.code,
        cg.name,
        cg.email,
        cg.phone,
        cg.joinedOn || '',
        (cg.skills || []).join('; '),
        cg.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(agencyName || 'agency').replace(/\s+/g, '-').toLowerCase()}-caregivers.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Caregivers</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            View and manage caregivers associated with this agency.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search caregivers..."
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter size={15} /> Filter
              {status !== 'All' ? (
                <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">{status}</span>
              ) : null}
            </button>
            {filterOpen ? (
              <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {STATUS_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setStatus(item);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      status === item ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={15} /> Export
          </button>
          <button
            type="button"
            onClick={() => toast.info('Caregivers are added from the agency portal.')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} /> Add Caregiver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={Users} label="Total Caregivers" value={stats.total} tone="bg-violet-50 text-violet-600" />
        <KpiCard icon={UserCheck} label="Active Caregivers" value={stats.active} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard icon={UserX} label="Inactive Caregivers" value={stats.inactive} tone="bg-orange-50 text-orange-600" />
        <KpiCard icon={UserMinus} label="Pending" value={stats.pending ?? stats.onLeave} tone="bg-indigo-50 text-indigo-600" />
        <KpiCard
          icon={UserPlus}
          label="New This Month"
          value={stats.newThisMonth}
          tone="bg-teal-50 text-teal-600"
          trend={stats.trendPct}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Caregiver</th>
                <th className="py-3">Email</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Join On Date</th>
                <th className="py-3">Skill Set</th>
                <th className="py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                    <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading caregivers…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-rose-500">{error}</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-sm text-slate-400">
                    No caregivers found for this agency.
                  </td>
                </tr>
              ) : (
                list.map((cg) => (
                  <tr key={cg.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {cg.profilePic ? (
                          <img
                            src={cg.profilePic}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                            {initials(cg.name)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{cg.name || '—'}</p>
                          <p className="text-[11px] text-slate-400">{cg.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600">{cg.email || '—'}</td>
                    <td className="py-3.5 text-slate-600">{cg.phone || '—'}</td>
                    <td className="py-3.5 text-slate-600">{formatLongDate(cg.joinedOn)}</td>
                    <td className="py-3.5 pr-3"><SkillPills skills={cg.skills} /></td>
                    <td className="py-3.5"><StatusPill status={cg.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <ActionIconButton
                          label="View"
                          className="text-primary hover:bg-primary/10"
                          onClick={() => toast.info(`${cg.name} · ${cg.code}`)}
                        >
                          <Eye size={15} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Edit"
                          className="text-slate-500 hover:bg-slate-100"
                          onClick={() => toast.info('Caregiver edits are managed in the agency portal.')}
                        >
                          <Pencil size={15} />
                        </ActionIconButton>
                        <ActionIconButton
                          label="More"
                          className="text-slate-500 hover:bg-slate-100"
                          onClick={() => toast.info(cg.email || 'No email on file')}
                        >
                          <MoreVertical size={15} />
                        </ActionIconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            Showing {pagination.from} to {pagination.to} of {Number(pagination.total || 0).toLocaleString()} caregivers
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:text-slate-300"
            >
              <ChevronLeft size={14} />
            </button>
            {pages.map((item, idx) => (
              item === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">…</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`min-w-[28px] rounded px-2 py-0.5 font-semibold ${
                    item === page
                      ? 'border border-primary/30 bg-primary/5 text-primary'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {item}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1) || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:text-slate-300"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
