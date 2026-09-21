import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText, Mail, Ban, CheckCircle2, Plus, Printer, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import InvoiceDetailView from '../../../components/agency/billing/InvoiceDetailView';
import {
  fetchInvoices,
  fetchInvoiceById,
  generateInvoice,
  sendInvoice,
  markInvoicePaid,
  voidInvoice,
} from '../../../redux/slices/invoicesSlice';
import { fetchClients } from '../../../redux/slices/clientsSlice';

const PAGE_SIZE = 5;

const statusStyles = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Void: 'bg-red-100 text-red-700',
};

function toDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

export default function ClientInvoices() {
  const dispatch = useDispatch();
  const { list, pagination, loading, actionLoading } = useSelector((state) => state.invoices);
  const { list: clients } = useSelector((state) => state.clients);
  const authUser = useSelector((state) => state.auth.user);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 13);
    return {
      client_id: '',
      period_from: toDateKey(from),
      period_to: toDateKey(to),
      notes: '',
    };
  });

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const loadList = (nextPage = page) => {
    dispatch(fetchInvoices({
      page: nextPage,
      limit: PAGE_SIZE,
      status: statusFilter === 'All' ? undefined : statusFilter,
    }));
  };

  useEffect(() => {
    loadList(page);
  }, [dispatch, page, statusFilter]);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && list.length === 0 && page > 1 && pagination.total > 0) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [loading, list.length, page, pagination.total]);

  const pages = useMemo(
    () => pageNumbers(pagination.page || page, pagination.totalPages || 1),
    [pagination.page, pagination.totalPages, page],
  );

  const openDetail = async (inv) => {
    setDetail(inv);
    setDetailLoading(true);
    try {
      const full = await dispatch(fetchInvoiceById(inv.id)).unwrap();
      setDetail(full);
    } catch {
      // keep list snapshot
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.client_id) return;
    try {
      const created = await dispatch(generateInvoice(form)).unwrap();
      setGenerateOpen(false);
      loadList(1);
      setPage(1);
      if (created) openDetail(created);
    } catch {
      // toast in slice
    }
  };

  const runAction = async (action, id) => {
    try {
      const updated = await dispatch(action(id)).unwrap();
      if (detail?.id === id && updated) setDetail(updated);
      loadList(page);
    } catch {
      // toast in slice
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate private-pay invoices from approved EVV visits and care-plan rates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGenerateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Plus size={16} /> Generate invoice
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
        >
          <option value="All">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Void">Void</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Visits</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">Loading invoices…</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No invoices yet. Generate a draft from approved visits.
                  </td>
                </tr>
              ) : (
                list.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-primary">{inv.invoiceCode}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{inv.clientName}</p>
                      {inv.clientEmail ? (
                        <p className="text-xs text-gray-500">{inv.clientEmail}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {inv.periodFrom} → {inv.periodTo}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{inv.lineCount ?? inv.lines?.length ?? 0}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      ${Number(inv.total || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[inv.status] || statusStyles.Draft}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetail(inv)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <FileText size={12} /> View
                        </button>
                        {inv.status === 'Draft' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => runAction(sendInvoice, inv.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                          >
                            <Mail size={12} /> Send
                          </button>
                        )}
                        {(inv.status === 'Draft' || inv.status === 'Sent') && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => runAction(markInvoicePaid, inv.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Paid
                          </button>
                        )}
                        {inv.status !== 'Void' && inv.status !== 'Paid' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => {
                              if (window.confirm('Void this invoice and release visits for re-billing?')) {
                                runAction(voidInvoice, inv.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Ban size={12} /> Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
          <p className="text-sm text-gray-500">
            Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total || 0}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-600 disabled:text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((p, idx) => (
              typeof p === 'number' ? (
                <button
                  key={`p-${p}`}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-semibold ${
                    p === page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={`e-${idx}`} className="px-1 text-gray-400">…</span>
              )
            ))}
            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-600 disabled:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Drawer open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate invoice">
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-sm text-gray-500">
            Pulls Approved, not-yet-invoiced visits for the client in the selected period — each visit becomes a detailed line with service, caregiver, times, hours, rate, and amount.
          </p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Client</span>
            <select
              required
              value={form.client_id}
              onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Select client…</option>
              {(clients || []).map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">From</span>
              <input
                type="date"
                required
                value={form.period_from}
                onChange={(e) => setForm((f) => ({ ...f, period_from: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">To</span>
              <input
                type="date"
                required
                value={form.period_to}
                onChange={(e) => setForm((f) => ({ ...f, period_to: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Notes (optional)</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {actionLoading ? 'Generating…' : 'Create draft invoice'}
          </button>
        </form>
      </Drawer>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.invoiceCode || 'Invoice'}
        width="3xl"
        footer={(
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Printer size={15} /> Print
            </button>
            <div className="flex flex-wrap gap-2">
              {detail?.status === 'Draft' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runAction(sendInvoice, detail.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Mail size={15} /> Send to client
                </button>
              )}
              {(detail?.status === 'Draft' || detail?.status === 'Sent') && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => runAction(markInvoicePaid, detail.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={15} /> Mark paid
                </button>
              )}
            </div>
          </div>
        )}
      >
        {detailLoading && !detail?.lines?.some((l) => l.checkInAt) ? (
          <p className="py-10 text-center text-sm text-gray-500">Loading invoice details…</p>
        ) : (
          <InvoiceDetailView
            invoice={{
              ...detail,
              agencyName: detail?.agencyName || authUser?.agencyName || '',
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
