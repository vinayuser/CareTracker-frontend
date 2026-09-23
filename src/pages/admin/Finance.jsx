import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import Drawer from '../../components/ui/Drawer';
import InvoiceDetailView from '../../components/agency/billing/InvoiceDetailView';

const PAGE_SIZE = 5;

function toDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthRange(base = new Date()) {
  const from = new Date(base.getFullYear(), base.getMonth(), 1);
  const to = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { from: toDateKey(from), to: toDateKey(to) };
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

function formatHours(value) {
  return Number(value || 0).toFixed(2);
}

function formatRangeLabel(from, to) {
  const fmt = (key) => {
    if (!key) return '';
    const d = new Date(`${key}T12:00:00`);
    if (Number.isNaN(d.getTime())) return key;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (!from && !to) return 'All dates';
  if (from && to) return `${fmt(from)} - ${fmt(to)}`;
  return fmt(from || to);
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
  const paid = status === 'Paid';
  const mixed = status === 'Mixed';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        paid
          ? 'bg-emerald-50 text-emerald-700'
          : mixed
            ? 'bg-amber-50 text-amber-700'
            : 'bg-rose-50 text-rose-700'
      }`}
    >
      {paid ? <Check size={11} strokeWidth={2.5} /> : mixed ? null : <X size={11} strokeWidth={2.5} />}
      {paid ? 'Paid' : mixed ? 'Mixed' : 'Unpaid'}
    </span>
  );
}

function KpiCard({ label, value, subValue, icon: Icon, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {subValue != null ? (
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">{subValue}</p>
        ) : null}
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon size={20} />
      </span>
    </div>
  );
}

const EMPTY_STATS = {
  totalInvoices: 0,
  totalInvoiceAmount: 0,
  paidInvoices: 0,
  paidAmount: 0,
  unpaidInvoices: 0,
  unpaidAmount: 0,
};

const EMPTY_TOTALS = {
  hoursSpent: 0,
  billingAmount: 0,
  totalInvoiceAmount: 0,
};

export default function Finance() {
  const defaultRange = useMemo(() => monthRange(), []);

  const [agencies, setAgencies] = useState([]);
  const [draftAgencyId, setDraftAgencyId] = useState('');
  const [draftFrom, setDraftFrom] = useState(defaultRange.from);
  const [draftTo, setDraftTo] = useState(defaultRange.to);
  const [draftSearch, setDraftSearch] = useState('');

  const [appliedAgencyId, setAppliedAgencyId] = useState('');
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);
  const [appliedSearch, setAppliedSearch] = useState('');

  const [expandedAgencyId, setExpandedAgencyId] = useState('');
  const [stats, setStats] = useState(EMPTY_STATS);
  const [groups, setGroups] = useState([]);
  const [lines, setLines] = useState([]);
  const [agencyTotals, setAgencyTotals] = useState(EMPTY_TOTALS);
  const [activeAgencyId, setActiveAgencyId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    from: 0,
    to: 0,
    agencyName: '',
    invoiceCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get(API_ROUTES.ADMIN.AGENCY.OPTIONS);
        setAgencies(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        toast.error('Failed to load agencies');
      }
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const filterParams = {
          agencyId: appliedAgencyId || undefined,
          from: appliedFrom || undefined,
          to: appliedTo || undefined,
          search: appliedSearch || undefined,
        };
        const [statsRes, listRes] = await Promise.all([
          axiosInstance.get(API_ROUTES.ADMIN.FINANCE.STATS, { params: filterParams }),
          axiosInstance.get(API_ROUTES.ADMIN.FINANCE.LIST, {
            params: {
              ...filterParams,
              page,
              limit: PAGE_SIZE,
              expandedAgencyId: expandedAgencyId || undefined,
            },
          }),
        ]);
        if (cancelled) return;

        setStats(statsRes.data?.data || EMPTY_STATS);
        const data = listRes.data?.data || {};
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setLines(Array.isArray(data.lines) ? data.lines : []);
        setAgencyTotals(data.agencyTotals || EMPTY_TOTALS);
        setActiveAgencyId(data.expandedAgencyId || '');
        setPagination(data.pagination || {
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 1,
          from: 0,
          to: 0,
          agencyName: '',
          invoiceCount: 0,
        });
      } catch {
        if (cancelled) return;
        setStats(EMPTY_STATS);
        setGroups([]);
        setLines([]);
        setAgencyTotals(EMPTY_TOTALS);
        setActiveAgencyId('');
        toast.error('Failed to load finance data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [appliedAgencyId, appliedFrom, appliedTo, appliedSearch, page, expandedAgencyId]);

  useEffect(() => {
    if (!loading && lines.length === 0 && page > 1 && pagination.total > 0) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, lines.length, page, pagination.total]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const openAgencyId = expandedAgencyId || activeAgencyId;

  const applyFilters = () => {
    if (draftFrom && draftTo && draftFrom > draftTo) {
      toast.error('Start date must be before end date');
      return;
    }
    setAppliedAgencyId(draftAgencyId);
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
    setAppliedSearch(draftSearch.trim());
    setExpandedAgencyId(draftAgencyId || '');
    setPage(1);
  };

  const resetFilters = () => {
    const range = monthRange();
    setDraftAgencyId('');
    setDraftFrom(range.from);
    setDraftTo(range.to);
    setDraftSearch('');
    setAppliedAgencyId('');
    setAppliedFrom(range.from);
    setAppliedTo(range.to);
    setAppliedSearch('');
    setExpandedAgencyId('');
    setPage(1);
  };

  const toggleAgency = (agencyId) => {
    if (openAgencyId === agencyId) {
      if (groups.length <= 1) return;
      const other = groups.find((g) => g.agencyId !== agencyId);
      if (other) {
        setExpandedAgencyId(other.agencyId);
        setPage(1);
      }
      return;
    }
    setExpandedAgencyId(agencyId);
    setPage(1);
  };

  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(API_ROUTES.ADMIN.FINANCE.DETAIL(row.invoiceId));
      setDetail(res.data?.data || null);
    } catch {
      toast.error('Failed to load invoice');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const colCount = 10;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Finance</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage all invoices, payments and financial records.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Building2 size={12} />
              Agency
            </label>
            <select
              value={draftAgencyId}
              onChange={(e) => setDraftAgencyId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-primary"
            >
              <option value="">All Agencies</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[240px] flex-1">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Calendar size={12} />
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

          <div className="min-w-[220px] flex-[1.2]">
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Search size={12} />
              Search
            </label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
                placeholder="Search by invoice no., caregiver or job name..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Invoices"
          value={Number(stats.totalInvoices || 0).toLocaleString()}
          icon={FileText}
          tone="bg-primary/10 text-primary"
        />
        <KpiCard
          label="Total Invoice Amount"
          value={formatMoney(stats.totalInvoiceAmount)}
          icon={DollarSign}
          tone="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Paid Invoices"
          value={Number(stats.paidInvoices || 0).toLocaleString()}
          subValue={formatMoney(stats.paidAmount)}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Unpaid Invoices"
          value={Number(stats.unpaidInvoices || 0).toLocaleString()}
          subValue={formatMoney(stats.unpaidAmount)}
          icon={X}
          tone="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    Invoice Generate Date
                    <ArrowDownUp size={11} className="text-slate-400" />
                  </span>
                </th>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Caregiver Name</th>
                <th className="px-4 py-3">Job Name</th>
                <th className="px-4 py-3">Billing Rate (per hour)</th>
                <th className="px-4 py-3">Hours Spent</th>
                <th className="px-4 py-3">Billing Amount</th>
                <th className="px-4 py-3">Total Invoice Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-500">
                    Loading finance records…
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center text-sm text-slate-500">
                    No invoices found for the selected filters.
                  </td>
                </tr>
              ) : (
                groups.map((group) => {
                  const isOpen = group.agencyId === openAgencyId;
                  return (
                    <AgencyGroupRows
                      key={group.agencyId}
                      group={group}
                      isOpen={isOpen}
                      lines={isOpen ? lines : []}
                      agencyTotals={isOpen ? agencyTotals : null}
                      onToggle={() => toggleAgency(group.agencyId)}
                      onView={openDetail}
                      colCount={colCount}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-[12px] text-slate-500">
            {pagination.total === 0
              ? 'Showing 0 invoices'
              : `Showing ${pagination.from} - ${pagination.to} of ${pagination.total} invoices${
                pagination.agencyName ? ` (${pagination.agencyName})` : ''
              }`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || !openAgencyId}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((p, idx) => (
              p === '…' ? (
                <span key={`e-${idx}`} className="px-1.5 text-slate-400">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] rounded-lg px-2 py-1.5 text-sm font-semibold ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1) || !openAgencyId}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Drawer
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        title={detail?.invoiceCode || 'Invoice'}
        width="2xl"
      >
        {detailLoading ? (
          <p className="py-10 text-center text-sm text-slate-500">Loading invoice…</p>
        ) : detail ? (
          <InvoiceDetailView invoice={detail} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-500">Invoice not found.</p>
        )}
      </Drawer>
    </div>
  );
}

function AgencyGroupRows({
  group,
  isOpen,
  lines,
  agencyTotals,
  onToggle,
  onView,
  colCount,
}) {
  return (
    <>
      <tr className="border-b border-slate-100 bg-primary/[0.06]">
        <td colSpan={colCount} className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ChevronDown
                size={16}
                className={`text-primary transition-transform ${isOpen ? '' : '-rotate-90'}`}
              />
              Agency: {group.agencyName}
              <span className="font-medium text-slate-500">
                ({group.invoiceCount} Invoice{group.invoiceCount === 1 ? '' : 's'})
              </span>
            </span>
            {!isOpen ? (
              <span className="inline-flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-600">
                <span>{formatMoney(group.totalInvoiceAmount)}</span>
                <StatusPill status={group.statusSummary} />
              </span>
            ) : null}
          </button>
        </td>
      </tr>

      {isOpen ? (
        <>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-slate-500">
                No line items for this agency.
              </td>
            </tr>
          ) : (
            lines.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3.5 text-slate-700">{row.invoiceDateLabel || '—'}</td>
                <td className="px-4 py-3.5 font-medium text-slate-800">{row.invoiceCode || '—'}</td>
                <td className="px-4 py-3.5 text-slate-700">{row.caregiverName || '—'}</td>
                <td className="px-4 py-3.5 text-slate-700">{row.jobName || '—'}</td>
                <td className="px-4 py-3.5 text-slate-700">{formatMoney(row.billingRate)}</td>
                <td className="px-4 py-3.5 text-slate-700">{formatHours(row.hoursSpent)}</td>
                <td className="px-4 py-3.5 font-medium text-slate-900">{formatMoney(row.billingAmount)}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-900">{formatMoney(row.totalInvoiceAmount)}</td>
                <td className="px-4 py-3.5">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onView(row)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    <Eye size={15} />
                    View
                  </button>
                </td>
              </tr>
            ))
          )}

          {agencyTotals ? (
            <tr className="border-b border-slate-100 bg-slate-50/90">
              <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-slate-800">
                Agency Total ({group.agencyName})
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                {formatHours(agencyTotals.hoursSpent)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                {formatMoney(agencyTotals.billingAmount)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                {formatMoney(agencyTotals.totalInvoiceAmount)}
              </td>
              <td colSpan={2} />
            </tr>
          ) : null}
        </>
      ) : null}
    </>
  );
}
