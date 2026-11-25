import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  Download,
  FileSpreadsheet,
  HeartHandshake,
  Receipt,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const GROUP_META = {
  Clients: { icon: Users, tone: 'bg-sky-50 text-sky-700 ring-sky-100' },
  Caregivers: { icon: UserRound, tone: 'bg-violet-50 text-violet-700 ring-violet-100' },
  Visits: { icon: CalendarDays, tone: 'bg-amber-50 text-amber-800 ring-amber-100' },
  Billing: { icon: Receipt, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  Agency: { icon: Building2, tone: 'bg-primary/5 text-primary ring-primary/10' },
};

function groupIcon(group) {
  return GROUP_META[group]?.icon || FileSpreadsheet;
}

function groupTone(group) {
  return GROUP_META[group]?.tone || 'bg-slate-50 text-slate-700 ring-slate-100';
}

export default function DownloadReportsPage({
  scope = 'agency',
  agencies = [],
  initialAgencyId = '',
}) {
  const isAdmin = scope === 'admin';
  const catalogUrl = isAdmin ? API_ROUTES.ADMIN.REPORTS.OPERATIONS : API_ROUTES.AGENCY.REPORTS.OPERATIONS;

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [agencyId, setAgencyId] = useState(initialAgencyId || (isAdmin ? 'all' : ''));
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [month, setMonth] = useState(today().slice(5, 7));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    axiosInstance
      .get(catalogUrl)
      .then((res) => {
        if (!active) return;
        const reports = res.data?.data?.reports || [];
        setCatalog(reports);
        if (reports[0]) setKey(reports[0].key);
      })
      .catch(() => toast.error('Could not load report types'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [catalogUrl]);

  useEffect(() => {
    if (!isAdmin) return;
    if (initialAgencyId) setAgencyId(initialAgencyId);
  }, [isAdmin, initialAgencyId]);

  const selected = useMemo(() => catalog.find((item) => item.key === key) || null, [catalog, key]);

  const grouped = useMemo(() => {
    const map = new Map();
    catalog.forEach((item) => {
      const group = item.group || 'Other';
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(item);
    });
    return [...map.entries()];
  }, [catalog]);

  const download = async () => {
    if (!key) {
      toast.error('Select a report');
      return;
    }
    if (isAdmin && !agencyId) {
      toast.error('Select an agency');
      return;
    }
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (isAdmin) params.set('agencyId', agencyId);
      if (selected?.needsRange) {
        params.set('from', from);
        params.set('to', to);
      }
      if (selected?.needsMonth) params.set('month', month);
      const query = params.toString();
      const res = await axiosInstance.get(
        `${catalogUrl}/export/${key}${query ? `?${query}` : ''}`,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${key}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Could not download this report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FileSpreadsheet size={14} />
            Reports
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Download Reports</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Choose a report card, set the date options if needed, then download the CSV.
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Agency
            <select
              value={agencyId}
              onChange={(event) => setAgencyId(event.target.value)}
              className="mt-1.5 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-primary"
            >
              <option value="all">All agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center text-sm text-slate-500">
          Loading report options…
        </div>
      ) : catalog.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center text-sm text-slate-500">
          No downloadable reports are available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([group, items]) => {
            const Icon = groupIcon(group);
            return (
              <section key={group} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${groupTone(group)}`}>
                    <Icon size={16} />
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">{group}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const active = item.key === key;
                    const CardIcon = groupIcon(item.group);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setKey(item.key)}
                        className={`rounded-xl border p-4 text-left transition ${
                          active
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                            : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${groupTone(item.group)}`}>
                            <CardIcon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              {active ? (
                                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {item.description || 'Download this report as CSV.'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.needsRange ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Date range
                                </span>
                              ) : null}
                              {item.needsMonth ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Month
                                </span>
                              ) : null}
                              {!item.needsRange && !item.needsMonth ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  Ready to download
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {selected ? (
        <div className="sticky bottom-3 z-10 rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Selected report</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{selected.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{selected.description}</p>
            </div>
            <button
              type="button"
              onClick={download}
              disabled={downloading || !key || (isAdmin && !agencyId)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? 'Downloading…' : 'Download CSV'}
            </button>
          </div>

          {(selected.needsRange || selected.needsMonth) ? (
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {selected.needsRange ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    From
                    <input
                      type="date"
                      value={from}
                      max={to || undefined}
                      onChange={(event) => setFrom(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    To
                    <input
                      type="date"
                      value={to}
                      min={from || undefined}
                      onChange={(event) => setTo(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                </>
              ) : null}
              {selected.needsMonth ? (
                <label className="block text-sm font-medium text-slate-700">
                  Month
                  <input
                    type="month"
                    value={`${today().slice(0, 4)}-${month}`}
                    onChange={(event) => setMonth(event.target.value.slice(5, 7))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <HeartHandshake size={13} />
              No date filters required for this report.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
