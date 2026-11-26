import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CheckCircle2 } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { fetchActivePlans } from '../../redux/slices/subscriptionPlanSlice';
import { submitRegistration } from '../../redux/slices/registrationSlice';
import { getInvitePlan } from '../../utils/subscriptionStore';
import { getRegistrationData } from '../../utils/registrationStore';
import PlanLimitsDisplay from '../../components/ui/PlanLimitsDisplay';
import StripeRegistrationCheckout from '../../components/registration/StripeRegistrationCheckout';

export default function SubscriptionPayment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const registrationData = getRegistrationData();
  const [plan, setPlan] = useState(null);
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

  const handlePaid = async (payment) => {
    if (!plan?.id) {
      toast.error('Subscription plan is still loading. Please wait.');
      return;
    }
    try {
      await dispatch(submitRegistration({
        planId: plan.id,
        transactionId: payment?.transactionId,
        amount: payment?.amount ?? plan.price,
        paymentMethod: payment?.paymentMethod || undefined,
        ...registrationData,
      })).unwrap();
      setPaid(true);
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Registration failed.';
      toast.error(message);
      throw err;
    }
  };

  if (paid) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mt-2 text-gray-500">
          Your {plan?.name} subscription is now active. Welcome to Caretraqer!
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
          <StripeRegistrationCheckout
            plan={plan}
            email={registrationData.email}
            name={registrationData.fullName}
            onPaid={handlePaid}
          />
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
