import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Upload,
  UserCheck,
  UserCog,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
  UserX,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import ActionIconButton from '../../components/ui/ActionIconButton';

const PAGE_SIZE = 10;
const ROLE_OPTIONS = ['All Roles', 'Caregiver', 'Office Staff', 'Agency Owner'];
const STATUS_OPTIONS = ['All Status', 'Active', 'Inactive', 'Pending'];
const EVV_STATUS_OPTIONS = ['All Status', 'Verified', 'Pending', 'Rejected'];

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatWeekLabel(start, end) {
  if (!start || !end) return '—';
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${a.toLocaleDateString('en-US', opts).replace(',', '')} - ${b.toLocaleDateString('en-US', opts)}`;
}

function addDaysKey(dateKey, days) {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + Number(days || 0)));
  const pad = (n) => String(n).padStart(2, '0');
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'U';
}

function StatusPill({ status }) {
  const map = {
    Active: 'bg-emerald-50 text-emerald-700',
    Inactive: 'bg-rose-50 text-rose-700',
    Pending: 'bg-amber-50 text-amber-700',
    Verified: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-rose-50 text-rose-700',
    'In Progress': 'bg-sky-50 text-sky-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || '—'}
    </span>
  );
}

function Avatar({ name, src, size = 'h-8 w-8' }) {
  if (src) {
    return <img src={src} alt="" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <span className={`inline-flex ${size} items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary`}>
      {initials(name)}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone, subTone = 'text-emerald-600' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {Number(value || 0).toLocaleString()}
          </p>
          {sub ? <p className={`mt-1.5 text-[11px] font-semibold ${subTone}`}>{sub}</p> : null}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
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

function SelectMenu({ value, options, onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export default function Users() {
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [agencyId, setAgencyId] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('All Roles');
  const [status, setStatus] = useState('All Status');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0,
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [weekStart, setWeekStart] = useState('');
  const [scheduleUserId, setScheduleUserId] = useState('');
  const [schedules, setSchedules] = useState({ days: [], rows: [], users: [], weekStart: '', weekEnd: '' });
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const [evvUserId, setEvvUserId] = useState('');
  const [evvStatus, setEvvStatus] = useState('All Status');
  const [evvForms, setEvvForms] = useState({ list: [], users: [] });
  const [evvLoading, setEvvLoading] = useState(false);

  const selectedAgency = useMemo(
    () => options.find((o) => o.id === agencyId) || null,
    [options, agencyId],
  );

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setOptions(list);
        if (list.length) setAgencyId((prev) => prev || list[0].id);
      } catch {
        toast.error('Failed to load agencies');
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
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
    setSelectedIds([]);
    setScheduleUserId('');
    setEvvUserId('');
  }, [agencyId, debouncedSearch, role, status]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;
    const load = async () => {
      setStatsLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.USERS.STATS, { params: { agencyId } });
        if (!cancelled) setStats(res.data?.data || null);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;
    const load = async () => {
      setUsersLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.USERS.LIST, {
          params: {
            agencyId,
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            role: role === 'All Roles' ? undefined : role,
            status: status === 'All Status' ? undefined : status,
          },
        });
        if (cancelled) return;
        const data = res.data?.data || {};
        setUsers(Array.isArray(data.list) ? data.list : []);
        setPagination(data.pagination || {
          page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1, from: 0, to: 0,
        });
      } catch {
        if (!cancelled) {
          setUsers([]);
          toast.error('Failed to load users');
        }
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId, page, debouncedSearch, role, status]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;
    const load = async () => {
      setSchedulesLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.USERS.SCHEDULES, {
          params: {
            agencyId,
            weekStart: weekStart || undefined,
            userId: scheduleUserId || undefined,
          },
        });
        if (cancelled) return;
        const data = res.data?.data || {};
        setSchedules({
          days: data.days || [],
          rows: data.rows || [],
          users: data.users || [],
          weekStart: data.weekStart || '',
          weekEnd: data.weekEnd || '',
        });
        if (!weekStart && data.weekStart) setWeekStart(data.weekStart);
      } catch {
        if (!cancelled) setSchedules({ days: [], rows: [], users: [], weekStart: '', weekEnd: '' });
      } finally {
        if (!cancelled) setSchedulesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId, weekStart, scheduleUserId]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;
    const load = async () => {
      setEvvLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.USERS.EVV_FORMS, {
          params: {
            agencyId,
            weekStart: weekStart || undefined,
            weekEnd: schedules.weekEnd || undefined,
            userId: evvUserId || undefined,
            status: evvStatus === 'All Status' ? undefined : evvStatus,
            limit: 8,
          },
        });
        if (cancelled) return;
        const data = res.data?.data || {};
        setEvvForms({ list: data.list || [], users: data.users || [] });
      } catch {
        if (!cancelled) setEvvForms({ list: [], users: [] });
      } finally {
        if (!cancelled) setEvvLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [agencyId, weekStart, schedules.weekEnd, evvUserId, evvStatus]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds((ids) => ids.filter((id) => !users.some((u) => u.id === id)));
    else setSelectedIds((ids) => [...new Set([...ids, ...users.map((u) => u.id)])]);
  };

  const toggleOne = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const deltaText = (n, suffix = 'this month') => {
    const num = Number(n) || 0;
    if (num > 0) return `+${num} ${suffix}`;
    if (num < 0) return `${num} ${suffix}`;
    return `0 ${suffix}`;
  };

  if (optionsLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-500 shadow-sm">
        <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading agencies…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage users for the selected agency. View schedules and EVV forms.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div ref={selectorRef} className="relative min-w-[240px]">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Select Agency</label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setSelectorOpen((v) => !v)}
                className="flex min-w-0 flex-1 items-center justify-between px-3 py-2.5 text-left text-sm"
              >
                <span className="truncate font-semibold text-slate-900">
                  {selectedAgency?.name || 'Select an agency'}
                </span>
                <ChevronDown size={16} className="ml-2 shrink-0 text-slate-400" />
              </button>
              {agencyId ? (
                <button
                  type="button"
                  onClick={() => setAgencyId('')}
                  className="mr-1.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Clear"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            {selectorOpen ? (
              <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAgencyId(item.id);
                      setSelectorOpen(false);
                      setWeekStart('');
                    }}
                    className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                      item.id === agencyId ? 'bg-primary/5 font-semibold text-primary' : 'text-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => toast.info('User import will be available in a future release')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Upload size={15} /> Import Users
          </button>
          <button
            type="button"
            onClick={() => toast.info('Invite users from the agency portal or Invitations module.')}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      {!agencyId ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <UsersIcon size={32} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Select an agency</h3>
          <p className="mt-1 text-sm text-slate-500">Choose an agency to view its users, schedules, and EVV forms.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <KpiCard
              icon={UsersIcon}
              label="Total Users"
              value={stats?.total}
              sub={statsLoading ? '…' : deltaText(stats?.deltas?.total)}
              tone="bg-violet-50 text-violet-600"
            />
            <KpiCard
              icon={UserCheck}
              label="Caregivers"
              value={stats?.caregivers}
              sub={statsLoading ? '…' : deltaText(stats?.deltas?.caregivers)}
              tone="bg-blue-50 text-blue-600"
            />
            <KpiCard
              icon={UserCog}
              label="Office Staff"
              value={stats?.officeStaff}
              sub={statsLoading ? '…' : deltaText(stats?.deltas?.officeStaff)}
              tone="bg-indigo-50 text-indigo-600"
            />
            <KpiCard
              icon={UserPlus}
              label="Active Users"
              value={stats?.active}
              sub={statsLoading ? '…' : `${stats?.activePct ?? 0}% of total`}
              tone="bg-cyan-50 text-cyan-600"
            />
            <KpiCard
              icon={UserMinus}
              label="Pending Invites"
              value={stats?.pendingInvites}
              sub={statsLoading ? '…' : deltaText(stats?.deltas?.pendingInvites)}
              tone="bg-amber-50 text-amber-600"
              subTone={(stats?.deltas?.pendingInvites || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}
            />
            <KpiCard
              icon={UserX}
              label="Inactive Users"
              value={stats?.inactive}
              sub={statsLoading ? '…' : deltaText(stats?.deltas?.inactive)}
              tone="bg-rose-50 text-rose-600"
              subTone={(stats?.deltas?.inactive || 0) <= 0 ? 'text-rose-600' : 'text-emerald-600'}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            {/* User List */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">User List</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {Number(pagination.total || 0).toLocaleString()} users found
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search users by name, email, or role..."
                      className="w-56 rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <SelectMenu value={role} options={ROLE_OPTIONS} onChange={setRole} className="w-[130px]" />
                  <SelectMenu value={status} options={STATUS_OPTIONS} onChange={setStatus} className="w-[120px]" />
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                    title="Filters"
                  >
                    <Filter size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 w-10">
                        <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-300" />
                      </th>
                      <th className="py-3">User</th>
                      <th className="py-3">Role</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Phone</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Join Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                          <span className="mx-auto mb-2 block h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Loading users…
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                          No users found for this agency.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-50 last:border-0">
                          <td className="px-5 py-3.5">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(user.id)}
                              onChange={() => toggleOne(user.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={user.name} src={user.profilePic} />
                              <span className="font-semibold text-slate-900">{user.name || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-600">{user.roleLabel}</td>
                          <td className="py-3.5 text-slate-600">{user.email || '—'}</td>
                          <td className="py-3.5 text-slate-600">{user.phone || '—'}</td>
                          <td className="py-3.5"><StatusPill status={user.status} /></td>
                          <td className="py-3.5 text-slate-600">{formatLongDate(user.joinedOn)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-0.5">
                              <ActionIconButton
                                label="View"
                                className="text-primary hover:bg-primary/10"
                                onClick={() => toast.info(`${user.name} · ${user.roleLabel}`)}
                              >
                                <Eye size={15} />
                              </ActionIconButton>
                              <ActionIconButton
                                label="More"
                                className="text-slate-500 hover:bg-slate-100"
                                onClick={() => toast.info(user.email || 'No email')}
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
                  Showing {pagination.from} to {pagination.to} of {Number(pagination.total || 0).toLocaleString()} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1 || usersLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded px-2 py-1 hover:bg-slate-100 disabled:text-slate-300"
                  >
                    Previous
                  </button>
                  {pages.map((item, idx) => (
                    item === '…' ? (
                      <span key={`e-${idx}`} className="px-1 text-slate-400">…</span>
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
                    disabled={page >= (pagination.totalPages || 1) || usersLoading}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded px-2 py-1 hover:bg-slate-100 disabled:text-slate-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5 xl:col-span-2">
              {/* Schedules */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
                  <h2 className="text-sm font-semibold text-slate-900">Schedules</h2>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    View all schedules →
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-50 px-4 py-3">
                  <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-medium text-slate-700">
                    <button
                      type="button"
                      className="rounded p-1 hover:bg-slate-50"
                      onClick={() => weekStart && setWeekStart(addDaysKey(weekStart, -7))}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="px-1 whitespace-nowrap">
                      {formatWeekLabel(schedules.weekStart, schedules.weekEnd)}
                    </span>
                    <button
                      type="button"
                      className="rounded p-1 hover:bg-slate-50"
                      onClick={() => weekStart && setWeekStart(addDaysKey(weekStart, 7))}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <SelectMenu
                    value={scheduleUserId}
                    onChange={setScheduleUserId}
                    className="min-w-[140px] flex-1"
                    options={[
                      { value: '', label: 'Filter by User' },
                      ...schedules.users.map((u) => ({ value: u.id, label: u.name })),
                    ]}
                  />
                </div>
                <div className="overflow-x-auto px-2 py-3">
                  {schedulesLoading ? (
                    <p className="px-3 py-8 text-center text-sm text-slate-400">Loading schedules…</p>
                  ) : schedules.rows.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-slate-400">No schedules for this week.</p>
                  ) : (
                    <table className="min-w-full text-[11px]">
                      <thead>
                        <tr className="text-slate-400">
                          <th className="px-2 py-2 text-left font-medium">User</th>
                          {schedules.days.map((day) => (
                            <th key={day.date} className="px-1 py-2 text-center font-medium">
                              <div>{day.label}</div>
                              <div className="text-slate-900">{day.dayNum}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.rows.slice(0, 6).map((row) => (
                          <tr key={row.userId} className="border-t border-slate-50">
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                <Avatar name={row.name} src={row.profilePic} size="h-7 w-7" />
                                <span className="max-w-[88px] truncate font-medium text-slate-800">{row.name}</span>
                              </div>
                            </td>
                            {row.days.map((day) => (
                              <td key={day.date} className="px-1 py-2 text-center align-top">
                                {day.slots.length === 0 ? (
                                  <span className="text-slate-300">—</span>
                                ) : (
                                  day.slots.slice(0, 1).map((slot, i) => (
                                    <span
                                      key={`${day.date}-${i}`}
                                      className="inline-block rounded bg-primary/10 px-1.5 py-1 text-[10px] font-medium leading-tight text-primary"
                                    >
                                      {slot.label}
                                    </span>
                                  ))
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* EVV Forms */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
                  <h2 className="text-sm font-semibold text-slate-900">EVV Forms</h2>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    View all EVV forms →
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-50 px-4 py-3">
                  <SelectMenu
                    value={evvUserId}
                    onChange={setEvvUserId}
                    className="min-w-[130px] flex-1"
                    options={[
                      { value: '', label: 'Filter by User' },
                      ...(evvForms.users.length ? evvForms.users : schedules.users).map((u) => ({
                        value: u.id,
                        label: u.name,
                      })),
                    ]}
                  />
                  <SelectMenu
                    value={evvStatus}
                    onChange={setEvvStatus}
                    className="w-[120px]"
                    options={EVV_STATUS_OPTIONS}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-2.5">User</th>
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Client</th>
                        <th className="py-2.5">In / Out</th>
                        <th className="py-2.5">Hrs</th>
                        <th className="py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evvLoading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading EVV forms…</td>
                        </tr>
                      ) : evvForms.list.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-400">No EVV forms for this period.</td>
                        </tr>
                      ) : (
                        evvForms.list.map((row) => (
                          <tr key={row.id} className="border-b border-slate-50 last:border-0">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Avatar name={row.userName} src={row.profilePic} size="h-7 w-7" />
                                <span className="max-w-[90px] truncate font-medium text-slate-800">{row.userName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-600 whitespace-nowrap">{formatLongDate(row.date)}</td>
                            <td className="py-2.5 text-slate-600">
                              <span className="max-w-[80px] truncate block">{row.clientName}</span>
                            </td>
                            <td className="py-2.5 text-slate-600 whitespace-nowrap">
                              {row.checkIn || '—'}
                              <span className="text-slate-300"> / </span>
                              {row.checkOut || '—'}
                            </td>
                            <td className="py-2.5 font-medium text-slate-800">{row.hours}</td>
                            <td className="py-2.5"><StatusPill status={row.status} /></td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-0.5">
                                <ActionIconButton
                                  label="View"
                                  className="text-primary hover:bg-primary/10"
                                  onClick={() => toast.info(`${row.userName} · ${row.clientName}`)}
                                >
                                  <Eye size={14} />
                                </ActionIconButton>
                                <ActionIconButton
                                  label="Download"
                                  className="text-slate-500 hover:bg-slate-100"
                                  onClick={() => toast.info('EVV export coming soon')}
                                >
                                  <Download size={14} />
                                </ActionIconButton>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
