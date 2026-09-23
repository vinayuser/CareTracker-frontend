import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import Drawer from '../../components/ui/Drawer';
import InvoiceDetailView from '../../components/agency/billing/InvoiceDetailView';

const PAGE_SIZE = 10;

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
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        paid
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-rose-50 text-rose-700'
      }`}
    >
      {paid ? <Check size={11} strokeWidth={2.5} /> : <X size={11} strokeWidth={2.5} />}
      {paid ? 'Paid' : 'Unpaid'}
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
  totalBilledAmount: 0,
  paidInvoices: 0,
  paidAmount: 0,
  unpaidInvoices: 0,
  unpaidAmount: 0,
};

export default function BillingClaims() {
  const defaultRange = useMemo(() => monthRange(), []);

  const [agencies, setAgencies] = useState([]);
  const [draftAgencyId, setDraftAgencyId] = useState('');
  const [draftFrom, setDraftFrom] = useState(defaultRange.from);
  const [draftTo, setDraftTo] = useState(defaultRange.to);

  const [appliedAgencyId, setAppliedAgencyId] = useState('');
  const [appliedFrom, setAppliedFrom] = useState(defaultRange.from);
  const [appliedTo, setAppliedTo] = useState(defaultRange.to);

  const [stats, setStats] = useState(EMPTY_STATS);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    from: 0,
    to: 0,
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

  const loadData = async (nextPage = page) => {
    setLoading(true);
    try {
      const params = {
        agencyId: appliedAgencyId || undefined,
        from: appliedFrom || undefined,
        to: appliedTo || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      };
      const [statsRes, listRes] = await Promise.all([
        axiosInstance.get(API_ROUTES.ADMIN.BILLING_CLAIMS.STATS, {
          params: {
            agencyId: params.agencyId,
            from: params.from,
            to: params.to,
          },
        }),
        axiosInstance.get(API_ROUTES.ADMIN.BILLING_CLAIMS.LIST, { params }),
      ]);
      setStats(statsRes.data?.data || EMPTY_STATS);
      const data = listRes.data?.data || {};
      setList(Array.isArray(data.list) ? data.list : []);
      setPagination(data.pagination || {
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
        from: 0,
        to: 0,
      });
    } catch {
      setStats(EMPTY_STATS);
      setList([]);
      toast.error('Failed to load billing claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [appliedAgencyId, appliedFrom, appliedTo, page]);

  useEffect(() => {
    if (!loading && list.length === 0 && page > 1 && pagination.total > 0) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, list.length, page, pagination.total]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const applyFilters = () => {
    if (draftFrom && draftTo && draftFrom > draftTo) {
      toast.error('Start date must be before end date');
      return;
    }
    setAppliedAgencyId(draftAgencyId);
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
    setPage(1);
  };

  const resetFilters = () => {
    const range = monthRange();
    setDraftAgencyId('');
    setDraftFrom(range.from);
    setDraftTo(range.to);
    setAppliedAgencyId('');
    setAppliedFrom(range.from);
    setAppliedTo(range.to);
    setPage(1);
  };

  const openDetail = async (row) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(API_ROUTES.ADMIN.BILLING_CLAIMS.DETAIL(row.id));
      setDetail(res.data?.data || null);
    } catch {
      toast.error('Failed to load invoice');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText size={20} />
        </span>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Billing & Claims</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage agency invoices, billing status, and payment information.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
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

          <div className="min-w-[260px] flex-1">
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
          label="Total Billed Amount"
          value={formatMoney(stats.totalBilledAmount)}
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
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Caregiver Name</th>
                <th className="px-4 py-3">Billing Rate (per hour)</th>
                <th className="px-4 py-3">Billing Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                    Loading invoices…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                    No invoices found for the selected filters.
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{row.agencyName || '—'}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{row.invoiceCode || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-700">{row.caregiverName || '—'}</td>
                    <td className="px-4 py-3.5 text-slate-700">{formatMoney(row.billingRate)}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{formatMoney(row.billingAmount)}</td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{row.invoiceDateLabel || '—'}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(row)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
          <p className="text-[12px] text-slate-500">
            {pagination.total === 0
              ? 'Showing 0 invoices'
              : `Showing ${pagination.from} - ${pagination.to} of ${pagination.total} invoices`}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
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
              disabled={page >= (pagination.totalPages || 1)}
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
