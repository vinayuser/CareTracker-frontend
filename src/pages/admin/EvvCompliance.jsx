import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Heart,
  List,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: toInputDate(from), to: toInputDate(to) };
}

function initials(name = '') {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'EM';
}

function Avatar({ name, src }) {
  if (src) return <img src={src} alt="" className="h-9 w-9 rounded-full object-cover" />;
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
      {initials(name)}
    </span>
  );
}

function PendingPill({ pending, yesIcon: YesIcon }) {
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
        <YesIcon size={12} />
        Yes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <Check size={12} strokeWidth={3} />
      No
    </span>
  );
}

function FinalStatusPill({ status }) {
  const map = {
    Verified: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    'Un Verified': 'bg-rose-50 text-rose-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || '—'}
    </span>
  );
}

function KpiCard({ label, value, Icon, tone }) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold tracking-tight text-slate-900">{Number(value || 0).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function AdminEvvCompliance() {
  const initialRange = useMemo(() => defaultRange(), []);
  const [options, setOptions] = useState([]);
  const [agencyId, setAgencyId] = useState('');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);
  const [applied, setApplied] = useState(initialRange);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    clientSidePending: 0,
    ownerSidePending: 0,
    verified: 0,
    unVerified: 0,
  });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedAgency = useMemo(
    () => options.find((o) => o.id === agencyId) || null,
    [options, agencyId],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setOptions(rows);
        if (rows.length) setAgencyId((prev) => prev || rows[0].id);
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

  const loadData = async (agency = agencyId, range = applied) => {
    if (!agency) {
      setList([]);
      setStats({
        totalEmployees: 0,
        clientSidePending: 0,
        ownerSidePending: 0,
        verified: 0,
        unVerified: 0,
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        agencyId: agency,
        from: range.from || undefined,
        to: range.to || undefined,
        limit: 100,
      };
      const [statsRes, listRes] = await Promise.all([
        axiosInstance.get(API_ROUTES.ADMIN.EVV.STATS, { params }),
        axiosInstance.get(API_ROUTES.ADMIN.EVV.EMPLOYEES, { params }),
      ]);
      setStats(statsRes.data?.data || {
        totalEmployees: 0,
        clientSidePending: 0,
        ownerSidePending: 0,
        verified: 0,
        unVerified: 0,
      });
      setList(Array.isArray(listRes.data?.data?.list) ? listRes.data.data.list : []);
    } catch {
      setList([]);
      toast.error('Failed to load EVV data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!agencyId) return;
    loadData(agencyId, applied);
  }, [agencyId, applied.from, applied.to]);

  const applyFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      toast.error('From date must be before To date');
      return;
    }
    setApplied({ from: fromDate, to: toDate });
  };

  const openDetails = async (row) => {
    setDetail(row);
    setDetailOpen(true);
    try {
      const res = await axiosInstance.get(`${API_ROUTES.ADMIN.EVV.EMPLOYEES}/${row.id}`, {
        params: {
          agencyId: agencyId || undefined,
          from: applied.from || undefined,
          to: applied.to || undefined,
        },
      });
      if (res.data?.data) setDetail(res.data.data);
    } catch {
      /* keep list row as fallback */
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">EVV</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage EVV details for your employees. Track client and owner side verification status
          and final results.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div ref={selectorRef} className="relative min-w-[200px] flex-1">
            <label className="mb-1.5 block text-[12px] font-medium text-slate-500">Agency Name</label>
            <button
              type="button"
              onClick={() => setSelectorOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm shadow-sm"
            >
              <span className="truncate font-semibold text-slate-900">
                {selectedAgency?.name || 'Select agency'}
              </span>
              <ChevronDown size={16} className="ml-2 shrink-0 text-slate-400" />
            </button>
            {selectorOpen ? (
              <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                {options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setAgencyId(item.id); setSelectorOpen(false); }}
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

          <div className="min-w-[150px]">
            <label className="mb-1.5 block text-[12px] font-medium text-slate-500">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="mb-1.5 block text-[12px] font-medium text-slate-500">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={applyFilter}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Apply Filter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <KpiCard label="Total Employees" value={stats.totalEmployees} Icon={UserRound} tone="bg-sky-50 text-sky-600" />
        <KpiCard label="Client Side Pending" value={stats.clientSidePending} Icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Owner Side Pending" value={stats.ownerSidePending} Icon={Clock3} tone="bg-amber-50 text-amber-600" />
        <KpiCard label="Verified" value={stats.verified} Icon={ShieldCheck} tone="bg-sky-50 text-sky-600" />
        <KpiCard label="Un Verified" value={stats.unVerified} Icon={XCircle} tone="bg-rose-50 text-rose-600" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <List size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-slate-900">Employee Wise EVV Details</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Agency Name</th>
                <th className="px-4 py-3">Client Side Pending</th>
                <th className="px-4 py-3">Owner Side Pending</th>
                <th className="px-4 py-3">Final Status</th>
                <th className="px-4 py-3">Last EVV Date &amp; Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">Loading EVV details…</td>
                </tr>
              ) : !list.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No EVV employee records for this agency and date range.
                  </td>
                </tr>
              ) : (
                list.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.employeeName} src={row.profilePic} />
                        <span className="font-semibold text-slate-900">{row.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.agencyName}</td>
                    <td className="px-4 py-3">
                      <PendingPill pending={row.clientSidePending} yesIcon={Heart} />
                    </td>
                    <td className="px-4 py-3">
                      <PendingPill pending={row.ownerSidePending} yesIcon={Clock3} />
                    </td>
                    <td className="px-4 py-3">
                      <FinalStatusPill status={row.finalStatus} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.lastEvvLabel || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDetails(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/10"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailOpen && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30" onClick={() => setDetailOpen(false)}>
          <aside
            className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={detail.employeeName} src={detail.profilePic} />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{detail.employeeName}</h3>
                  <p className="text-[12px] text-slate-500">{detail.agencyName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500">Client Side Pending</p>
                  <div className="mt-2">
                    <PendingPill pending={detail.clientSidePending} yesIcon={Heart} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500">Owner Side Pending</p>
                  <div className="mt-2">
                    <PendingPill pending={detail.ownerSidePending} yesIcon={Clock3} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500">Final Status</p>
                  <div className="mt-2">
                    <FinalStatusPill status={detail.finalStatus} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500">Last EVV</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{detail.lastEvvLabel || '—'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Enrollments ({detail.enrollments?.length || 0})
                </h4>
                <div className="mt-2 space-y-2">
                  {(detail.enrollments || []).map((en) => (
                    <div key={en.id} className="rounded-xl border border-slate-200 px-3.5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{en.enrollmentCode || 'Enrollment'}</p>
                          <p className="mt-0.5 text-[12px] text-slate-500">{en.clientName || 'Client'}</p>
                          {en.serviceAreas?.length ? (
                            <p className="mt-1 text-[11px] text-slate-400">{en.serviceAreas.join(', ')}</p>
                          ) : null}
                        </div>
                        <FinalStatusPill
                          status={
                            en.status === 'Verified'
                              ? 'Verified'
                              : en.status === 'Rejected'
                                ? 'Un Verified'
                                : 'Pending'
                          }
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        <span>Client pending: {en.clientSidePending ? 'Yes' : 'No'}</span>
                        <span>·</span>
                        <span>Owner pending: {en.ownerSidePending ? 'Yes' : 'No'}</span>
                        <span>·</span>
                        <span>{en.lastEvvLabel || '—'}</span>
                      </div>
                    </div>
                  ))}
                  {!detail.enrollments?.length ? (
                    <p className="text-sm text-slate-400">No enrollment records.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
