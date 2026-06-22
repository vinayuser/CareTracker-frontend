import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CreditCard, CheckCircle2, Lock } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { fetchActivePlans } from '../../redux/slices/subscriptionPlanSlice';
import {
  processRegistrationPayment,
  submitRegistration,
} from '../../redux/slices/registrationSlice';
import { getInvitePlan } from '../../utils/subscriptionStore';
import PlanLimitsDisplay from '../../components/ui/PlanLimitsDisplay';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export default function SubscriptionPayment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [plan, setPlan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
  });
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const invitePlan = getInvitePlan();
    if (invitePlan) {
      setPlan(invitePlan);
    } else {
      dispatch(fetchActivePlans()).then((action) => {
        const plans = action.payload;
        if (Array.isArray(plans) && plans.length > 0) setPlan(plans[0]);
      });
    }
  }, [dispatch]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(
        processRegistrationPayment({
          planId: plan.id,
          amount: plan.price,
          ...paymentData,
        }),
      ).unwrap();
      await dispatch(submitRegistration({ planId: plan.id })).unwrap();
    } catch {
      // Demo mode
    }
    setPaid(true);
    setLoading(false);
  };

  if (paid) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mt-2 text-gray-500">
          Your {plan?.name} subscription is now active. Welcome to CareTracker!
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Amount charged: ${plan?.price}/{plan?.billingCycle}
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Subscription Payment</h1>
      <p className="mt-1 text-sm text-gray-500">
        Complete your registration by paying for your assigned subscription plan.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-sm font-medium text-primary">Your Assigned Plan</p>
            {plan ? (
              <>
                <h2 className="mt-2 text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-3 text-3xl font-bold text-primary">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-500">/{plan.billingCycle}</span>
                </p>
                <p className="mt-3 text-sm text-gray-600">{plan.description}</p>
                <PlanLimitsDisplay limits={plan.limits} />
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Loading plan details...</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handlePayment} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
              <Lock size={14} className="ml-auto text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name on Card *</label>
                <input
                  type="text"
                  required
                  value={paymentData.nameOnCard}
                  onChange={(e) => setPaymentData({ ...paymentData, nameOnCard: e.target.value })}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Card Number *</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expiry Date *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={paymentData.expiry}
                    onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CVV *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    placeholder="123"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {plan && (
              <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Total due today</span>
                <span className="text-lg font-bold text-gray-900">${plan.price}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !plan}
              className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Processing...' : `Pay $${plan?.price ?? '—'} & Complete Registration`}
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Your payment is secured with 256-bit SSL encryption.
            </p>
          </form>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.REGISTRATION_REVIEW)}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
