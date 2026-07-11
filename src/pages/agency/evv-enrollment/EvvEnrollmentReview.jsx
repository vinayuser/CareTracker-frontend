import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, CheckCircle, Printer, XCircle } from 'lucide-react';
import { EvvEnrollmentStepOne, EvvEnrollmentStepTwo } from '../../../components/agency/evv-enrollment/EvvEnrollmentSteps';
import { fetchEvvEnrollment, verifyEvvEnrollment } from '../../../redux/slices/evvEnrollmentsSlice';
import { evvEnrollmentToForm, WIZARD_STEPS } from '../../../utils/evvEnrollmentForm';
import { ROUTES } from '../../../routes/routes';

function Stepper({ currentStep }) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {WIZARD_STEPS.map((step) => (
        <div key={step.id} className={`rounded-xl border px-4 py-2 text-sm ${currentStep === step.id ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-gray-200 text-gray-500'}`}>
          Step {step.id}: {step.label}
        </div>
      ))}
    </div>
  );
}

export default function EvvEnrollmentReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected } = useSelector((state) => state.evvEnrollments);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(evvEnrollmentToForm(null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchEvvEnrollment(id))
      .unwrap()
      .catch(() => navigate(ROUTES.AGENCY_EVV_ENROLLMENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (selected) setForm(evvEnrollmentToForm(selected));
  }, [selected]);

  const onFormDataChange = (section, patch) => {
    setForm((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [section]: { ...prev.formData[section], ...patch },
      },
    }));
  };

  const handleVerify = async (action) => {
    setSubmitting(true);
    try {
      await dispatch(verifyEvvEnrollment({
        id,
        action,
        formData: form.formData,
      })).unwrap();
      navigate(ROUTES.AGENCY_EVV_ENROLLMENTS);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading enrollment...</div>;

  const canVerify = form.status === 'Submitted';

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link to={ROUTES.AGENCY_EVV_DASHBOARD} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to EVV Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review EVV Enrollment</h1>
          <p className="mt-1 text-sm text-gray-500">
            {form.enrollmentCode} · {form.clientName} · {form.caregiverName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.open(ROUTES.AGENCY_EVV_ENROLLMENT_PRINT.replace(':id', id), '_blank')}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Printer size={16} /> Print Form
          </button>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${
            form.status === 'Verified' ? 'bg-emerald-100 text-emerald-700'
              : form.status === 'Submitted' ? 'bg-blue-100 text-blue-700'
                : form.status === 'Rejected' ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
          }`}>{form.status}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <Stepper currentStep={step} />
        {step === 1 ? (
          <EvvEnrollmentStepOne form={form} onFormDataChange={onFormDataChange} readOnly />
        ) : (
          <EvvEnrollmentStepTwo form={form} onFormDataChange={onFormDataChange} readOnly showOfficeUse />
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div />}
          {step < 2 ? (
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
              Next <ArrowRight size={18} />
            </button>
          ) : canVerify ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={submitting} onClick={() => handleVerify('reject')} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                <XCircle size={18} /> Reject
              </button>
              <button type="button" disabled={submitting} onClick={() => handleVerify('verify')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                <CheckCircle size={18} /> {submitting ? 'Verifying...' : 'Verify Enrollment'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
