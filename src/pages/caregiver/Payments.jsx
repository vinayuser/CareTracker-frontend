import { Wallet, Download } from 'lucide-react';

const payments = [
  { period: 'Jun 1 – Jun 15, 2026', amount: '$1,240.00', hours: 38.5, status: 'Paid', date: 'Jun 16, 2026' },
  { period: 'May 16 – May 31, 2026', amount: '$1,180.00', hours: 36, status: 'Paid', date: 'Jun 1, 2026' },
  { period: 'May 1 – May 15, 2026', amount: '$1,220.00', hours: 37.5, status: 'Paid', date: 'May 16, 2026' },
];

export default function CaregiverPayments() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <Wallet size={24} className="text-emerald-600" />
          <div>
            <p className="text-sm text-emerald-700">Next payout estimate</p>
            <p className="text-2xl font-bold text-emerald-900">$1,280.00</p>
            <p className="text-xs text-emerald-600">Based on 40.0 hrs this period</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.map((payment) => (
            <div key={payment.period} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium text-gray-900">{payment.period}</p>
                <p className="text-xs text-gray-500">
                  {payment.hours} hrs · Paid {payment.date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{payment.amount}</p>
                <button type="button" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                  <Download size={12} /> Payslip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
