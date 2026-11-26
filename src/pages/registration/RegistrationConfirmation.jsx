import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { fetchActivePlans } from '../../redux/slices/subscriptionPlanSlice';
import { submitRegistration } from '../../redux/slices/registrationSlice';
import { getInvitePlan } from '../../utils/subscriptionStore';
import {
  clearInviteSession,
  getInviteSession,
  markInvitationAccepted,
} from '../../utils/invitationStore';
import { clearRegistrationData, getRegistrationData } from '../../utils/registrationStore';
import PlanLimitsDisplay from '../../components/ui/PlanLimitsDisplay';
import StripeRegistrationCheckout from '../../components/registration/StripeRegistrationCheckout';

export default function RegistrationConfirmation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const plansFetchedRef = useRef(false);

  const inviteSession = useMemo(() => getInviteSession(), []);
  const registrationData = useMemo(() => getRegistrationData(), []);
  const inviteToken = inviteSession?.token || '';
  const invitePlanId = inviteSession?.subscriptionPlanId || '';

  const [plan, setPlan] = useState(null);
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

  const handlePaid = async (payment) => {
    if (!plan?.id) {
      toast.error('Subscription plan is still loading. Please wait.');
      return;
    }
    setLoading(true);
    try {
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
      throw err;
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

        <div className={`lg:col-span-3 ${loading ? 'pointer-events-none opacity-70' : ''}`}>
          <StripeRegistrationCheckout
            plan={plan}
            email={registrationData.email}
            name={registrationData.fullName}
            onPaid={handlePaid}
          />
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
