import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Mail, Ban, CheckCircle2, Plus } from 'lucide-react';
import Drawer from '../../../components/ui/Drawer';
import {
  fetchInvoices,
  generateInvoice,
  sendInvoice,
  markInvoicePaid,
  voidInvoice,
} from '../../../redux/slices/invoicesSlice';
import { fetchClients } from '../../../redux/slices/clientsSlice';

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

export default function ClientInvoices() {
  const dispatch = useDispatch();
  const { list, loading, actionLoading } = useSelector((state) => state.invoices);
  const { list: clients } = useSelector((state) => state.clients);
  const [statusFilter, setStatusFilter] = useState('All');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
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
    dispatch(fetchInvoices());
    dispatch(fetchClients());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return list;
    return list.filter((inv) => inv.status === statusFilter);
  }, [list, statusFilter]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.client_id) return;
    try {
      await dispatch(generateInvoice(form)).unwrap();
      setGenerateOpen(false);
    } catch {
      // toast in slice
    }
  };

  const runAction = async (action, id) => {
    try {
      const updated = await dispatch(action(id)).unwrap();
      if (detail?.id === id && updated) setDetail(updated);
    } catch {
      // toast in slice
    }
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
                <th className="px-5 py-3">Lines</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">Loading invoices…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                    No invoices yet. Generate a draft from approved visits.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-primary">{inv.invoiceCode}</td>
                    <td className="px-5 py-4 text-gray-900">{inv.clientName}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {inv.periodFrom} → {inv.periodTo}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{inv.lines?.length || 0}</td>
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
                          onClick={() => setDetail(inv)}
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
      </div>

      <Drawer open={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate invoice">
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-sm text-gray-500">
            Pulls Approved, not-yet-invoiced visits for the client in the selected period.
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

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.invoiceCode || 'Invoice'}>
        {detail && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">{detail.clientName}</p>
              <p className="text-gray-500">{detail.clientEmail || 'No email on file'}</p>
              <p className="mt-1 text-gray-600">{detail.periodFrom} → {detail.periodTo}</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">${Number(detail.total || 0).toFixed(2)}</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Hours</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(detail.lines || []).map((line) => (
                    <tr key={String(line.visitId)}>
                      <td className="px-3 py-2 text-gray-800">{line.date}</td>
                      <td className="px-3 py-2 text-gray-700">{line.serviceArea || '—'}</td>
                      <td className="px-3 py-2">{line.billableHours}</td>
                      <td className="px-3 py-2">${Number(line.hourlyRate || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 font-medium">${Number(line.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {detail.notes ? <p className="text-sm text-gray-600">{detail.notes}</p> : null}
          </div>
        )}
      </Drawer>
    </div>
  );
}
