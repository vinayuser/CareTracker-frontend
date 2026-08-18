import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  MoreVertical,
  Plus,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';
import { formatPrice, formatBillingCycle, isUnlimited } from '../../utils/subscriptionStore';
import { ROUTES } from '../../routes/routes';

function formatLongDate(value) {
  if (!value) return '—';
  const raw = String(value);
  const d = raw.includes('T') || raw.includes(' ') ? new Date(raw) : new Date(`${raw.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} - ${time}`;
}

function formatStorage(bytes) {
  const n = Number(bytes || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024).toLocaleString()} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function usagePercent(used, limit) {
  if (isUnlimited(limit) || !limit) return null;
  return Math.min(100, Math.round((Number(used || 0) / Number(limit)) * 100));
}

function usageLabel(used, limit, formatter = (v) => Number(v || 0).toLocaleString()) {
  const count = formatter(used);
  if (isUnlimited(limit) || limit == null) return `${count} / Unlimited`;
  return `${count} / ${formatter(limit)}`;
}

function StatusPill({ status }) {
  const paid = status === 'Paid';
  const pending = status === 'Pending' || status === 'Overdue';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        paid
          ? 'bg-emerald-50 text-emerald-700'
          : pending
            ? 'bg-amber-50 text-amber-700'
            : 'bg-slate-100 text-slate-600'
      }`}
    >
      {status || '—'}
    </span>
  );
}

function CardShell({ title, icon: Icon, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-primary">
                <Icon size={14} />
              </span>
            ) : null}
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

function UsageBar({ label, used, limit, formatter }) {
  const pct = usagePercent(used, limit);
  const width = pct == null ? (Number(used || 0) > 0 ? 8 : 0) : pct;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[12px]">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{usageLabel(used, limit, formatter)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{pct == null ? 'Unlimited' : `${pct}%`}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

const EMPTY_BILLING = {
  plan: null,
  features: [],
  subscription: {},
  usage: {
    clients: { used: 0, limit: null },
    caregivers: { used: 0, limit: null },
    storage: { used: 0, limit: null },
  },
  summary: {
    planAmount: 0,
    addOnAmount: 0,
    taxAmount: 0,
    taxRate: 0,
    total: 0,
    defaultPaymentMethod: null,
    hasPendingInvoice: false,
  },
  invoices: [],
  paymentMethods: [],
  payments: [],
};

export default function AgencyBillingTab({ agencyId, onManageSubscription }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [billing, setBilling] = useState(EMPTY_BILLING);

  useEffect(() => {
    if (!agencyId) return undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`${API_ROUTES.ADMIN.AGENCY.BILLING}/${agencyId}/billing`);
        if (cancelled) return;
        const data = response.data?.data || {};
        setBilling({
          ...EMPTY_BILLING,
          ...data,
          usage: { ...EMPTY_BILLING.usage, ...(data.usage || {}) },
          summary: { ...EMPTY_BILLING.summary, ...(data.summary || {}) },
          subscription: data.subscription || {},
          features: Array.isArray(data.features) ? data.features : [],
          invoices: Array.isArray(data.invoices) ? data.invoices : [],
          paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
          payments: Array.isArray(data.payments) ? data.payments : [],
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load billing');
        setBilling(EMPTY_BILLING);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [agencyId]);

  const plan = billing.plan;
  const summary = billing.summary;
  const subscription = billing.subscription;
  const usage = billing.usage;
  const taxPercent = Number(summary.taxRate || 0) * 100;
  const taxLabel = taxPercent > 0 ? `Tax (${taxPercent.toFixed(2).replace(/\.00$/, '')}%)` : 'Tax';

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-slate-500">Loading subscription and billing…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-white px-6 py-16 text-center shadow-sm">
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell
          className="xl:col-span-2"
          title="Current Subscription"
          icon={Settings}
          action={(
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onManageSubscription}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Manage Subscription
              </button>
              <Link
                to={ROUTES.ADMIN_SUBSCRIPTION_PLANS}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Change Plan
              </Link>
            </div>
          )}
        >
          <div className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">{plan?.name || 'No plan assigned'}</h4>
                {plan ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    {subscription.status === 'Active' ? 'Active' : subscription.status || '—'}
                  </span>
                ) : null}
              </div>
              {plan?.description ? (
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Plan Amount</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {plan ? `${formatPrice(plan.price)} / ${formatBillingCycle(plan.billingCycle).toLowerCase()}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Billing Cycle</p>
                <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                  {plan?.billingCycle || '—'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Subscription Start Date</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{formatLongDate(subscription.startDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Next Renewal Date</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {subscription.nextRenewalDate ? formatLongDate(subscription.nextRenewalDate) : '—'}
                </p>
                {subscription.daysLeft != null && subscription.nextRenewalDate ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">
                    {subscription.daysLeft} day{subscription.daysLeft === 1 ? '' : 's'} left
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Auto Renewal</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  {subscription.autoRenewal ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-emerald-700">Enabled</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Plan Features</p>
                {billing.features.length ? (
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {billing.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[13px] text-slate-700">
                        <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState message="No plan features configured." />
                )}
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Usage This Month</p>
                <div className="space-y-4">
                  <UsageBar label="Clients" used={usage.clients?.used} limit={usage.clients?.limit} />
                  <UsageBar label="Caregivers" used={usage.caregivers?.used} limit={usage.caregivers?.limit} />
                  <UsageBar
                    label="Storage"
                    used={usage.storage?.used}
                    limit={usage.storage?.limit}
                    formatter={formatStorage}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardShell>

        <CardShell title="Billing Summary" icon={FileText}>
          <div className="flex h-full flex-col">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Plan Amount ({plan?.billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
                </span>
                <span className="font-semibold text-slate-900">
                  {plan ? formatPrice(summary.planAmount) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Add-ons</span>
                <span className="font-semibold text-slate-900">{formatPrice(summary.addOnAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{taxLabel}</span>
                <span className="font-semibold text-slate-900">
                  {plan ? formatPrice(summary.taxAmount || 0) : '—'}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-slate-100 pt-5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total Amount</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {plan ? formatPrice(summary.total) : '—'}
              </p>
            </div>

            <button
              type="button"
              disabled={!summary.hasPendingInvoice}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Make Payment
            </button>

            <div className="mt-auto border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <CreditCard size={14} />
                  </span>
                  <div className="min-w-0">
                    {summary.defaultPaymentMethod?.last4 ? (
                      <>
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {summary.defaultPaymentMethod.label}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {summary.defaultPaymentMethod.expMonth && summary.defaultPaymentMethod.expYear
                            ? `Exp ${summary.defaultPaymentMethod.expMonth}/${summary.defaultPaymentMethod.expYear}`
                            : 'Default payment method'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="truncate text-sm font-semibold text-slate-900">No payment method</p>
                        <p className="text-[11px] text-slate-400">Add a card to enable billing</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardShell>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <CardShell title="Invoices" icon={FileText} bodyClassName="p-0">
          {billing.invoices.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-primary">{invoice.invoiceCode}</td>
                      <td className="px-4 py-3 text-slate-600">{formatLongDate(invoice.invoiceDate)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(invoice.total)}</td>
                      <td className="px-4 py-3"><StatusPill status={invoice.status} /></td>
                      <td className="px-4 py-3 text-slate-600">{formatLongDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400">
                          <Download size={15} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState message="No invoices yet for this agency." />
            </div>
          )}
        </CardShell>

        <CardShell
          title="Payment Methods"
          icon={CreditCard}
          action={(
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <Plus size={14} />
              Add Payment Method
            </button>
          )}
        >
          {billing.paymentMethods.length ? (
            <ul className="space-y-3">
              {billing.paymentMethods.map((method) => (
                <li key={method.id || method.last4} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                      {method.isDefault ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {method.expMonth && method.expYear ? `Exp ${method.expMonth}/${method.expYear}` : '—'}
                    </p>
                  </div>
                  <button type="button" className="rounded-lg p-1 text-slate-400 hover:bg-slate-50" aria-label="Payment method options">
                    <MoreVertical size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No payment methods on file for this agency." />
          )}
        </CardShell>

        <CardShell title="Payment History" icon={Clock}>
          {billing.payments.length ? (
            <ul className="space-y-4">
              {billing.payments.map((payment) => (
                <li key={payment.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{payment.label || 'Payment Successful'}</p>
                    <p className="text-[12px] text-slate-500">{formatDateTime(payment.date)}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{formatPrice(payment.amount)}</p>
                    {payment.paymentMethodLabel ? (
                      <p className="text-[11px] text-slate-400">{payment.paymentMethodLabel}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="No payment history yet." />
          )}
        </CardShell>
      </div>
    </div>
  );
}
