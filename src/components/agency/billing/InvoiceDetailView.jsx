import { formatVisitTime, formatTimezoneAbbr } from '../../../utils/visitTimezone';

const statusStyles = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Void: 'bg-red-100 text-red-700',
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDisplayDate(dateKey) {
  if (!dateKey) return '—';
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatPeriod(from, to) {
  if (!from && !to) return '—';
  return `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
}

function LineTime({ line }) {
  const tz = line.timezone;
  const start = line.checkInAt || line.scheduledStartAt;
  const end = line.checkOutAt || line.scheduledEndAt;
  if (!start && !end) return <span className="text-gray-400">—</span>;
  const abbr = formatTimezoneAbbr(start || end, tz);
  return (
    <span>
      {formatVisitTime(start, tz)} – {formatVisitTime(end, tz)}
      {abbr ? <span className="ml-1 text-gray-400">{abbr}</span> : null}
    </span>
  );
}

export default function InvoiceDetailView({ invoice }) {
  if (!invoice) return null;

  const lines = invoice.lines || [];
  const totalHours = lines.reduce((sum, l) => sum + (Number(l.billableHours) || 0), 0);
  const issued = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    : '—';

  return (
    <div className="invoice-sheet space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Invoice</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{invoice.invoiceCode}</h2>
          <p className="mt-1 text-sm text-gray-500">Issued {issued}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[invoice.status] || statusStyles.Draft}`}>
            {invoice.status}
          </span>
          <p className="mt-2 text-sm font-medium text-gray-900">{invoice.agencyName || 'CareTraker Agency'}</p>
          {invoice.agencyAddress ? <p className="text-xs text-gray-500">{invoice.agencyAddress}</p> : null}
          {invoice.agencyPhone ? <p className="text-xs text-gray-500">{invoice.agencyPhone}</p> : null}
          {invoice.agencyEmail ? <p className="text-xs text-gray-500">{invoice.agencyEmail}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Bill to</p>
          <p className="mt-1.5 text-base font-semibold text-gray-900">{invoice.clientName || 'Client'}</p>
          {invoice.clientCode ? (
            <p className="text-xs text-gray-500">Client ID: {invoice.clientCode}</p>
          ) : null}
          {invoice.clientAddress ? (
            <p className="mt-1 text-sm text-gray-600">{invoice.clientAddress}</p>
          ) : null}
          <div className="mt-2 space-y-0.5 text-sm text-gray-600">
            {invoice.clientPhone ? <p>{invoice.clientPhone}</p> : null}
            {invoice.clientEmail ? <p>{invoice.clientEmail}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Service period</p>
          <p className="mt-1.5 text-sm font-medium text-gray-900">
            {formatPeriod(invoice.periodFrom, invoice.periodTo)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Visits</p>
              <p className="font-semibold text-gray-900">{lines.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total hours</p>
              <p className="font-semibold text-gray-900">{totalHours.toFixed(2)}h</p>
            </div>
          </div>
          {invoice.sentAt ? (
            <p className="mt-3 text-xs text-gray-500">
              Sent {new Date(invoice.sentAt).toLocaleString()}
            </p>
          ) : null}
          {invoice.paidAt ? (
            <p className="mt-1 text-xs text-emerald-600">
              Paid {new Date(invoice.paidAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Visit & service details</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-violet-50/60 text-left text-[11px] font-semibold uppercase tracking-wide text-violet-900">
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Service</th>
                <th className="px-3 py-2.5">Caregiver</th>
                <th className="px-3 py-2.5">Visit time</th>
                <th className="px-3 py-2.5 text-right">Hours</th>
                <th className="px-3 py-2.5 text-right">Rate</th>
                <th className="px-3 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No visit lines on this invoice.
                  </td>
                </tr>
              ) : (
                lines.map((line, idx) => (
                  <tr key={String(line.visitId || idx)} className="align-top hover:bg-gray-50/60">
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">{formatDisplayDate(line.date)}</p>
                      {line.visitCode ? (
                        <p className="text-[11px] text-gray-400">{line.visitCode}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-900">{line.serviceArea || 'Service'}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{line.caregiverName || '—'}</td>
                    <td className="px-3 py-3 text-gray-700">
                      <LineTime line={line} />
                    </td>
                    <td className="px-3 py-3 text-right text-gray-800">
                      {Number(line.billableHours || 0).toFixed(2)}h
                      {line.billableMinutes ? (
                        <p className="text-[11px] text-gray-400">{line.billableMinutes} min</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-800">
                      {money(line.hourlyRate)}
                      <p className="text-[11px] text-gray-400">/hr</p>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900">
                      {money(line.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 border-t border-gray-200 pt-4">
        <div className="max-w-sm text-sm text-gray-600">
          {invoice.notes ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap">{invoice.notes}</p>
            </>
          ) : (
            <p className="text-xs text-gray-400">Private-pay invoice generated from approved EVV visits.</p>
          )}
        </div>
        <div className="min-w-[220px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{money(invoice.subtotal ?? invoice.total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
            <span>Total due</span>
            <span>{money(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
