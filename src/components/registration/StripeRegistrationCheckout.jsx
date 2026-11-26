import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axiosInstance';
import API_ROUTES from '../../api/apiRoutes';

const publishableKey = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

async function confirmOnServer({ plan, paymentIntentId, free }) {
  const confirmRes = await axiosInstance.post(API_ROUTES.REGISTRATION.PAYMENT_CONFIRM, {
    planId: plan.id,
    amount: plan.price,
    paymentIntentId: free ? undefined : (paymentIntentId || undefined),
  });
  return confirmRes.data?.data;
}

function PayButton({ loading, disabled, plan, label }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled || !plan}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {loading
        ? 'Processing…'
        : (label || `Pay $${plan?.price ?? '—'} & Complete Registration`)}
    </button>
  );
}

function Shell({ children, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      noValidate
    >
      <div className="mb-4 flex items-center gap-2">
        <CreditCard size={18} className="text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
        <Lock size={14} className="ml-auto text-gray-400" />
      </div>
      {children}
      <p className="mt-3 text-center text-xs text-gray-400">
        Payments are processed securely by Stripe. Card details never touch Caretraqer servers.
      </p>
    </form>
  );
}

function TotalDue({ plan }) {
  if (!plan) return null;
  return (
    <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-600">Total due today</span>
      <span className="text-lg font-bold text-gray-900">${plan.price}</span>
    </div>
  );
}

function FreeCheckoutForm({ plan, onPaid, submitLabel }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plan?.id || loading) return;
    setLoading(true);
    try {
      const payment = await confirmOnServer({ plan, free: true });
      await onPaid(payment);
    } catch (err) {
      const message = typeof err === 'string'
        ? err
        : err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell onSubmit={handleSubmit}>
      <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        This plan is free. No card charge is required to complete registration.
      </p>
      <TotalDue plan={plan} />
      <PayButton loading={loading} plan={plan} label={submitLabel || 'Complete Registration'} />
    </Shell>
  );
}

function PaidCheckoutForm({ plan, paymentIntentId, onPaid, submitLabel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plan?.id || loading) return;

    setLoading(true);
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe has not finished loading. Please wait a moment.');
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (error) {
        throw new Error(error.message || 'Payment failed');
      }
      if (paymentIntent && paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment incomplete (status: ${paymentIntent.status})`);
      }

      const payment = await confirmOnServer({
        plan,
        paymentIntentId: paymentIntent?.id || paymentIntentId,
        free: false,
      });
      await onPaid(payment);
    } catch (err) {
      const message = typeof err === 'string'
        ? err
        : err?.response?.data?.message || err?.message || 'Payment failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell onSubmit={handleSubmit}>
      <div className="min-h-[180px]">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{ layout: 'tabs' }}
        />
      </div>
      <TotalDue plan={plan} />
      <PayButton
        loading={loading}
        disabled={!stripe || !elements || !ready}
        plan={plan}
        label={submitLabel}
      />
    </Shell>
  );
}

export default function StripeRegistrationCheckout({
  plan,
  email = '',
  name = '',
  onPaid,
  submitLabel,
}) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [free, setFree] = useState(false);
  const [bootError, setBootError] = useState('');
  const [booting, setBooting] = useState(false);

  const planId = plan?.id ? String(plan.id) : '';
  const planPrice = plan?.price;

  useEffect(() => {
    if (!planId) return undefined;
    let cancelled = false;

    const boot = async () => {
      setBooting(true);
      setBootError('');
      setClientSecret('');
      setPaymentIntentId('');
      setFree(false);
      try {
        if (!publishableKey) {
          throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY in admin/.env');
        }
        const response = await axiosInstance.post(API_ROUTES.REGISTRATION.PAYMENT_INTENT, {
          planId,
          amount: planPrice,
          email,
          name,
        });
        const data = response.data?.data;
        if (cancelled) return;
        if (data?.free) {
          setFree(true);
          return;
        }
        if (!data?.clientSecret) {
          throw new Error('Could not start Stripe payment');
        }
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId || '');
      } catch (err) {
        if (cancelled) return;
        setBootError(
          err?.response?.data?.message || err?.message || 'Unable to initialize Stripe payment',
        );
      } finally {
        if (!cancelled) setBooting(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [planId, planPrice, email, name]);

  const options = useMemo(
    () => (clientSecret
      ? {
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#2563eb',
              borderRadius: '8px',
            },
          },
        }
      : null),
    [clientSecret],
  );

  if (!plan) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Loading plan details…
      </div>
    );
  }

  if (booting) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-10 text-sm text-gray-500 shadow-sm">
        <Loader2 size={18} className="animate-spin" />
        Preparing secure payment…
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {bootError}
      </div>
    );
  }

  if (free) {
    return (
      <FreeCheckoutForm
        plan={plan}
        onPaid={onPaid}
        submitLabel={submitLabel}
      />
    );
  }

  if (!stripePromise || !options) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Stripe is not ready.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaidCheckoutForm
        plan={plan}
        paymentIntentId={paymentIntentId}
        onPaid={onPaid}
        submitLabel={submitLabel}
      />
    </Elements>
  );
}
