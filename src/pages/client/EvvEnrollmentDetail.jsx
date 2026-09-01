import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react';
import { EvvEnrollmentStepOne, EvvEnrollmentStepTwo } from '../../components/agency/evv-enrollment/EvvEnrollmentSteps';
import SubmitButton from '../../components/ui/SubmitButton';
import {
  fetchClientEvvEnrollment,
  clearSelectedClientEvvEnrollment,
  signClientEvvEnrollment,
} from '../../redux/slices/clientPortalSlice';
import { evvEnrollmentToForm, WIZARD_STEPS } from '../../utils/evvEnrollmentForm';
import { ROUTES } from '../../routes/routes';
import useSubmitLock from '../../hooks/useSubmitLock';
import useScrollToTopOnChange from '../../hooks/useScrollToTopOnChange';

function Stepper({ currentStep }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {WIZARD_STEPS.map((step) => (
        <div
          key={step.id}
          className={`rounded-xl border px-4 py-2 text-sm ${
            currentStep === step.id
              ? 'border-primary bg-primary/10 font-semibold text-primary'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          Step {step.id}: {step.label}
        </div>
      ))}
    </div>
  );
}

const hasInk = (value) => Boolean(value && String(value).startsWith('data:image'));

export default function ClientEvvEnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedEvvEnrollment, evvEnrollmentLoading } = useSelector((state) => state.clientPortal);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(null);
  const [submitting, runLocked] = useSubmitLock();

  useScrollToTopOnChange(step);

  useEffect(() => {
    dispatch(fetchClientEvvEnrollment(id));
    return () => dispatch(clearSelectedClientEvvEnrollment());
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedEvvEnrollment) return;
    const next = evvEnrollmentToForm(selectedEvvEnrollment);
    const auth = next.formData?.authorization || {};
    if (!hasInk(auth.clientSignature) && !auth.clientDate) {
      next.formData.authorization = {
        ...auth,
        clientDate: new Date().toISOString().slice(0, 10),
      };
    }
    setForm(next);
  }, [selectedEvvEnrollment]);

  const alreadySigned = useMemo(
    () => hasInk(selectedEvvEnrollment?.formData?.authorization?.clientSignature),
    [selectedEvvEnrollment],
  );
  const canSign = Boolean(form) && !alreadySigned && form.status !== 'Verified';

  const onFormDataChange = (section, patch) => {
    if (!canSign || section !== 'authorization') return;
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        formData: {
          ...prev.formData,
          authorization: {
            ...prev.formData.authorization,
            ...(patch.clientSignature !== undefined ? { clientSignature: patch.clientSignature } : {}),
            ...(patch.clientDate !== undefined ? { clientDate: patch.clientDate } : {}),
          },
        },
      };
    });
  };

  const handleSign = () => runLocked(async () => {
    const auth = form?.formData?.authorization || {};
    if (!hasInk(auth.clientSignature)) {
      toast.error('Please draw your signature before submitting.');
      return;
    }
    try {
      await dispatch(signClientEvvEnrollment({
        id,
        payload: {
          signature: auth.clientSignature,
          date: auth.clientDate || new Date().toISOString().slice(0, 10),
        },
      })).unwrap();
      toast.success('Your EVV signature was saved.');
      navigate(ROUTES.CLIENT_EVV_ENROLLMENTS);
    } catch {
      /* toast */
    }
  });

  if (evvEnrollmentLoading && !selectedEvvEnrollment) {
    return <p className="text-sm text-gray-500">Loading enrollment…</p>;
  }

  if (!selectedEvvEnrollment || !form) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="font-medium text-gray-900">Enrollment not found</p>
        <Link to={ROUTES.CLIENT_EVV_ENROLLMENTS} className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to EVV enrollments
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link
        to={ROUTES.CLIENT_EVV_ENROLLMENTS}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
      >
        <ArrowLeft size={16} /> Back to EVV enrollments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EVV Enrollment</h1>
          <p className="mt-1 text-sm text-gray-500">
            {form.enrollmentCode} · {form.caregiverName}
            {form.status ? ` · ${form.status}` : ''}
          </p>
        </div>
        {alreadySigned ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Signed
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            Signature required
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <Stepper currentStep={step} />
        {step === 1 ? (
          <EvvEnrollmentStepOne form={form} onFormDataChange={() => {}} readOnly lockClientFields />
        ) : (
          <EvvEnrollmentStepTwo
            form={form}
            onFormDataChange={onFormDataChange}
            readOnly
            clientSignatureEditable={canSign}
          />
        )}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Next: Review & Sign <ArrowRight size={18} />
            </button>
          ) : canSign ? (
            <SubmitButton
              loading={submitting}
              onClick={handleSign}
              icon={PenLine}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Submit Signature
            </SubmitButton>
          ) : (
            <p className="self-center text-sm font-medium text-emerald-700">
              Your signature is on file and locked.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
