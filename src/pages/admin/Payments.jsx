import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  RefreshCw,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { downloadSubscriptionInvoicePdf } from '../../utils/subscriptionInvoicePdf';

const PAGE_SIZE = 10;

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') || raw.includes(' ')
    ? new Date(raw)
    : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    Overdue: 'bg-rose-50 text-rose-700',
    Failed: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status] || styles.Failed}`}>
      {status || '—'}
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
  paidCount: 0,
  pendingCount: 0,
  overdueCount: 0,
  failedCount: 0,
  paidAmount: 0,
  pendingAmount: 0,
  totalCount: 0,
};

export default function Payments() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        axiosInstance.get(API_ROUTES.ADMIN.PAYMENTS.STATS),
        axiosInstance.get(API_ROUTES.ADMIN.PAYMENTS.LIST, {
          params: {
            page,
            limit: PAGE_SIZE,
            ...(status ? { status } : {}),
            ...(search ? { search } : {}),
          },
        }),
      ]);
      setStats(statsRes.data?.data || EMPTY_STATS);
      const data = listRes.data?.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load payments');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, search]);

  const pages = useMemo(() => pageNumbers(page, totalPages), [page, totalPages]);

  const handleDownload = async (invoice) => {
    setDownloadingId(invoice.id);
    try {
      await downloadSubscriptionInvoicePdf(invoice);
      toast.success(`Downloaded ${invoice.invoiceCode}.pdf`);
    } catch (error) {
      toast.error(error.message || 'Failed to download invoice PDF');
    } finally {
      setDownloadingId('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Subscription invoices, next due dates, and downloadable PDF invoices with CareTraker branding.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Paid"
          value={formatMoney(stats.paidAmount)}
          subValue={`${stats.paidCount} invoices`}
          icon={CheckCircle2}
          tone="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Pending / Due"
          value={formatMoney(stats.pendingAmount)}
          subValue={`${stats.pendingCount + stats.overdueCount} invoices`}
          icon={Clock}
          tone="bg-amber-50 text-amber-600"
        />
        <KpiCard
          label="Overdue"
          value={String(stats.overdueCount)}
          subValue="Needs collection"
          icon={AlertTriangle}
          tone="bg-rose-50 text-rose-600"
        />
        <KpiCard
          label="All invoices"
          value={String(stats.totalCount)}
          subValue="Platform subscription billing"
          icon={FileText}
          tone="bg-indigo-50 text-primary"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setSearch(searchInput.trim());
                }
              }}
              placeholder="Search invoice #, plan, transaction…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
            <option value="Failed">Failed</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setSearch(searchInput.trim());
            }}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Next / Due Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-slate-500">
                    Loading payments…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-slate-500">
                    No subscription payments found.
                  </td>
                </tr>
              ) : (
                items.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-primary">{invoice.invoiceCode}</td>
                    <td className="px-4 py-3">
                      {invoice.agencyName ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
                          <Building2 size={14} className="text-slate-400" />
                          {invoice.agencyName}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{invoice.planName || '—'}</div>
                      <div className="text-[11px] capitalize text-slate-400">{invoice.billingCycle || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatLongDate(invoice.invoiceDate)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatLongDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatMoney(invoice.total)}</td>
                    <td className="px-4 py-3"><StatusPill status={invoice.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        title="Download PDF invoice"
                      >
                        <Download size={14} />
                        {downloadingId === invoice.id ? 'Preparing…' : 'PDF'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <p>
            Showing page {page} of {totalPages} · {total} invoice{total === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((p) => (
              typeof p === 'number' ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-8 rounded-lg px-2 py-1 text-sm font-medium ${
                    p === page ? 'bg-primary text-white' : 'hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={`e-${p}`} className="px-1">…</span>
              )
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
