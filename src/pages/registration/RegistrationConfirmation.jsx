import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CreditCard, CheckCircle2, Lock } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { fetchActivePlans } from '../../redux/slices/subscriptionPlanSlice';
import {
  processRegistrationPayment,
  submitRegistration,
} from '../../redux/slices/registrationSlice';
import { getInvitePlan } from '../../utils/subscriptionStore';
import {
  clearInviteSession,
  getInviteSession,
  markInvitationAccepted,
} from '../../utils/invitationStore';
import { clearRegistrationData, getRegistrationData } from '../../utils/registrationStore';
import PlanLimitsDisplay from '../../components/ui/PlanLimitsDisplay';
import {
  formatCardNumber,
  formatCvv,
  formatExpiry,
  validatePaymentCard,
} from '../../utils/cardValidation';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const errorClass = 'mt-1 text-xs text-red-600';

const fieldClass = (hasError) => (hasError ? inputErrorClass : inputClass);

export default function RegistrationConfirmation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const plansFetchedRef = useRef(false);

  const inviteSession = useMemo(() => getInviteSession(), []);
  const registrationData = useMemo(() => getRegistrationData(), []);
  const inviteToken = inviteSession?.token || '';
  const invitePlanId = inviteSession?.subscriptionPlanId || '';

  const [plan, setPlan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: registrationData.fullName || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (plansFetchedRef.current) return;
    plansFetchedRef.current = true;

    const invitePlan = getInvitePlan();
    if (invitePlan) {
      setPlan(invitePlan);
      return;
    }

    dispatch(fetchActivePlans()).then((action) => {
      const plans = action.payload;
      if (!Array.isArray(plans) || plans.length === 0) return;
      const matched = invitePlanId
        ? plans.find((p) => String(p.id) === String(invitePlanId))
        : null;
      setPlan(matched || plans[0]);
    });
  }, [dispatch, inviteToken, invitePlanId, navigate]);

  const updateField = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateField = (field, data = paymentData) => {
    const result = validatePaymentCard(data);
    return result.errors[field] || '';
  };

  const handleBlur = (field) => {
    markTouched(field);
    const message = validateField(field);
    setErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!plan?.id) {
      toast.error('Subscription plan is still loading. Please wait.');
      return;
    }

    const result = validatePaymentCard(paymentData);
    setTouched({
      nameOnCard: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
    });
    setErrors(result.errors);
    if (!result.valid) {
      toast.error('Please fix the payment details before continuing.');
      return;
    }

    setLoading(true);
    try {
      const payment = await dispatch(
        processRegistrationPayment({
          planId: plan.id,
          amount: plan.price,
          ...paymentData,
        }),
      ).unwrap();
      await dispatch(
        submitRegistration({
          planId: plan.id,
          invitationToken: inviteToken,
          transactionId: payment?.transactionId,
          amount: payment?.amount ?? plan.price,
          paymentMethod: payment?.paymentMethod || undefined,
          ...registrationData,
        }),
      ).unwrap();

      if (inviteToken) {
        markInvitationAccepted(inviteToken);
      }

      clearInviteSession();
      clearRegistrationData();
      setCompleted(true);
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={40} className="text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Account Created Successfully!</h1>
        <p className="mt-3 text-gray-500">
          Your agency account has been created and your{' '}
          <strong>{plan?.name}</strong> subscription is active. You can now log in to the
          platform.
        </p>
        {plan && (
          <p className="mt-2 text-sm text-gray-400">
            Amount charged: ${plan.price}/{plan.billingCycle}
          </p>
        )}
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mt-8 rounded-lg border-2 border-primary bg-white px-8 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Confirmation &amp; Payment</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review your assigned plan and complete payment to activate your account.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-sm font-medium text-primary">Assigned Subscription Plan</p>
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
                  {(plan.features || []).map((feature) => (
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

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{registrationData.agencyName}</p>
            <p className="mt-1">{registrationData.email}</p>
            {registrationData.userId ? (
              <p className="mt-1">Username: {registrationData.userId}</p>
            ) : null}
            <p className="mt-1">{registrationData.fullName}</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <form
            onSubmit={handlePayment}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            noValidate
          >
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
              <Lock size={14} className="ml-auto text-gray-400" />
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="nameOnCard">Name on Card *</label>
                <input
                  id="nameOnCard"
                  type="text"
                  autoComplete="cc-name"
                  value={paymentData.nameOnCard}
                  onChange={(e) => updateField('nameOnCard', e.target.value)}
                  onBlur={() => handleBlur('nameOnCard')}
                  placeholder="John Doe"
                  className={fieldClass(touched.nameOnCard && errors.nameOnCard)}
                />
                {touched.nameOnCard && errors.nameOnCard ? (
                  <p className={errorClass}>{errors.nameOnCard}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="cardNumber">Card Number *</label>
                <input
                  id="cardNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  value={paymentData.cardNumber}
                  onChange={(e) => updateField('cardNumber', formatCardNumber(e.target.value))}
                  onBlur={() => handleBlur('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  className={fieldClass(touched.cardNumber && errors.cardNumber)}
                />
                {touched.cardNumber && errors.cardNumber ? (
                  <p className={errorClass}>{errors.cardNumber}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">13–16 digits. Test: 4242 4242 4242 4242</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="expiry">Expiry Date *</label>
                  <input
                    id="expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    value={paymentData.expiry}
                    onChange={(e) => updateField('expiry', formatExpiry(e.target.value))}
                    onBlur={() => handleBlur('expiry')}
                    placeholder="MM/YY"
                    className={fieldClass(touched.expiry && errors.expiry)}
                  />
                  {touched.expiry && errors.expiry ? (
                    <p className={errorClass}>{errors.expiry}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass} htmlFor="cvv">CVV *</label>
                  <input
                    id="cvv"
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={paymentData.cvv}
                    onChange={(e) => updateField('cvv', formatCvv(e.target.value))}
                    onBlur={() => handleBlur('cvv')}
                    placeholder="123"
                    className={fieldClass(touched.cvv && errors.cvv)}
                  />
                  {touched.cvv && errors.cvv ? (
                    <p className={errorClass}>{errors.cvv}</p>
                  ) : null}
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
              Demo payment — no real charges will be made.
            </p>
          </form>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={() => navigate(ROUTES.REGISTRATION_CREATE_ACCOUNT)}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
