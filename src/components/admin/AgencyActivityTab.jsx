import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Briefcase,
  CalendarClock,
  CreditCard,
  HeartPulse,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const PAGE_SIZE = 20;

const CATEGORY_META = {
  compliance: { label: 'EVV & Compliance', icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-600' },
  hiring: { label: 'Hiring', icon: Briefcase, tone: 'bg-violet-50 text-violet-600' },
  schedule: { label: 'Schedules', icon: CalendarClock, tone: 'bg-sky-50 text-sky-600' },
  clinical: { label: 'Clinical', icon: HeartPulse, tone: 'bg-rose-50 text-rose-600' },
  billing: { label: 'Billing', icon: CreditCard, tone: 'bg-amber-50 text-amber-600' },
  message: { label: 'Messages', icon: MessageSquare, tone: 'bg-indigo-50 text-indigo-600' },
  system: { label: 'System', icon: Settings, tone: 'bg-slate-100 text-slate-600' },
};

const TONE_DOT = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
};

const ROLE_PILL = {
  AGENCY_OWNER: 'bg-primary/10 text-primary',
  HR: 'bg-indigo-50 text-indigo-700',
  CAREGIVER: 'bg-emerald-50 text-emerald-700',
  CLIENT: 'bg-amber-50 text-amber-700',
};

function dayLabel(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function timeLabel(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{Number(value || 0).toLocaleString()}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

export default function AgencyActivityTab({ agencyId }) {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0, byCategory: {} });
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [agencyId, category, debouncedSearch, reloadKey]);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;
    const append = page > 1;

    const load = async () => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.ACTIVITY(agencyId), {
          params: {
            page,
            limit: PAGE_SIZE,
            category: category || undefined,
            search: debouncedSearch || undefined,
          },
        });
        if (cancelled) return;
        const data = res.data?.data || {};
        const rows = Array.isArray(data.list) ? data.list : [];
        setItems((prev) => (append ? [...prev, ...rows.filter((r) => !prev.some((p) => p.id === r.id))] : rows));
        setStats(data.stats || { total: 0, today: 0, week: 0, byCategory: {} });
        setHasMore(Boolean(data.pagination?.hasMore));
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load activity');
        if (!append) setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [agencyId, page, category, debouncedSearch, reloadKey]);

  const grouped = useMemo(() => {
    const groups = [];
    for (const item of items) {
      const label = dayLabel(item.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [items]);

  const byCategory = stats.byCategory || {};
  const filterChips = [
    { key: '', label: 'All', count: stats.total },
    ...Object.entries(CATEGORY_META)
      .map(([key, meta]) => ({ key, label: meta.label, count: byCategory[key] || 0 }))
      .filter((chip) => chip.count > 0 || chip.key === category),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Activity &amp; Logs</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Everything happening in this agency — notifications sent to the agency team and its caregivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            title="Refresh"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Activities" value={stats.total} icon={Activity} tone="bg-violet-50 text-violet-600" />
        <StatCard label="Today" value={stats.today} icon={CalendarClock} tone="bg-sky-50 text-sky-600" />
        <StatCard label="Last 7 Days" value={stats.week} icon={RefreshCw} tone="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
          {filterChips.map((chip) => (
            <button
              key={chip.key || 'all'}
              type="button"
              onClick={() => setCategory(chip.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                category === chip.key
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {chip.label}
              <span className={`rounded-full px-1.5 text-[10px] ${
                category === chip.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
              >
                {chip.count}
              </span>
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <div className="py-14 text-center text-sm text-slate-400">
              <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading activity…
            </div>
          ) : error ? (
            <p className="py-14 text-center text-sm text-rose-500">{error}</p>
          ) : items.length === 0 ? (
            <div className="py-14 text-center">
              <Activity size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No activity yet</p>
              <p className="mt-1 text-xs text-slate-400">
                {debouncedSearch || category ? 'Try a different filter or search.' : 'Agency and caregiver events will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                  <ol className="relative space-y-4 border-l border-slate-100 pl-6">
                    {group.items.map((item) => {
                      const meta = CATEGORY_META[item.category] || CATEGORY_META.system;
                      const Icon = meta.icon;
                      return (
                        <li key={item.id} className="relative">
                          <span className={`absolute -left-[39px] top-0 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${meta.tone}`}>
                            <Icon size={13} />
                          </span>
                          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                            <div className="min-w-0 flex-1">
                              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[item.tone] || TONE_DOT.info}`} />
                                {item.title}
                              </p>
                              {item.body ? (
                                <p className="mt-0.5 text-[13px] text-slate-600">{item.body}</p>
                              ) : null}
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-medium text-slate-400">{meta.label}</span>
                                {item.recipients.length ? (
                                  <>
                                    <span className="text-[11px] text-slate-300">·</span>
                                    <span className="text-[11px] text-slate-400">Sent to</span>
                                    {item.recipients.map((r) => (
                                      <span
                                        key={r.id}
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_PILL[r.role] || 'bg-slate-100 text-slate-600'}`}
                                        title={r.roleLabel}
                                      >
                                        {r.name || r.roleLabel}
                                        <span className="font-medium opacity-70"> · {r.roleLabel}</span>
                                      </span>
                                    ))}
                                  </>
                                ) : null}
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-semibold text-slate-600">{timeLabel(item.createdAt)}</p>
                              <p className="text-[11px] text-slate-400">{relativeTime(item.createdAt)}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}

              <div className="pt-1 text-center">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loadingMore}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400">End of activity</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
