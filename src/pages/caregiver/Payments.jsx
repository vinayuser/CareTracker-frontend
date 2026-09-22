import { useEffect, useState } from 'react';
import { Download, Loader2, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

function StatusPill({ status }) {
  const map = {
    Paid: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || '—'}
    </span>
  );
}

function downloadPayslip(period) {
  if (!period) return;
  const lines = [
    ['Field', 'Value'],
    ['Pay Period', period.period || ''],
    ['Status', period.status || ''],
    ['Total Hours', period.hours ?? ''],
    ['Total Amount', period.amountLabel || ''],
    ['Payout Date', period.payoutDate || ''],
    [],
    ['Visit Code', 'Date', 'Client', 'Service', 'Hours', 'Rate', 'Amount', 'Status'],
    ...(period.visits || []).map((v) => [
      v.visitCode || '',
      v.date || '',
      v.clientName || '',
      v.service || '',
      v.hours ?? '',
      v.rate != null ? `$${Number(v.rate).toFixed(2)}` : '',
      v.amount != null ? `$${Number(v.amount).toFixed(2)}` : '',
      v.status || '',
    ]),
  ];
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = lines.map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payslip-${period.key || 'period'}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function CaregiverPayments() {
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.CAREGIVER.PAYROLL);
        const data = res.data?.data || {};
        if (cancelled) return;
        setCurrent(data.current || null);
        setHistory(Array.isArray(data.history) ? data.history : []);
      } catch {
        if (!cancelled) {
          setCurrent(null);
          setHistory([]);
          toast.error('Failed to load payroll');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" /> Loading payroll…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <Wallet size={24} className="text-emerald-600" />
          <div>
            <p className="text-sm text-emerald-700">Next payout estimate</p>
            <p className="text-2xl font-bold text-emerald-900">{current?.amountLabel || '$0.00'}</p>
            <p className="text-xs text-emerald-600">
              {current?.note || 'No clocked hours in the current pay period yet'}
            </p>
            {current?.period ? (
              <p className="mt-1 text-[11px] font-medium text-emerald-700/80">{current.period}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
          <p className="mt-0.5 text-xs text-gray-500">Biweekly earnings from completed visits (last 6 months)</p>
        </div>
        <div className="divide-y divide-gray-50">
          {!history.length && !(current?.visitCount > 0) ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">No payroll history yet. Clock out visits to see earnings here.</p>
          ) : (
            <>
              {current?.visitCount > 0 ? (
                <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{current.period}</p>
                      <StatusPill status={current.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {current.hours} hrs · {current.visitCount} visit{current.visitCount === 1 ? '' : 's'} · {current.payoutDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{current.amountLabel}</p>
                    <button
                      type="button"
                      onClick={() => downloadPayslip(current)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download size={12} /> Payslip
                    </button>
                  </div>
                </div>
              ) : null}
              {history.map((payment) => (
                <div key={payment.key} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{payment.period}</p>
                      <StatusPill status={payment.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {payment.hours} hrs · {payment.visitCount} visit{payment.visitCount === 1 ? '' : 's'} · Paid {payment.payoutDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{payment.amountLabel}</p>
                    <button
                      type="button"
                      onClick={() => downloadPayslip(payment)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Download size={12} /> Payslip
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
