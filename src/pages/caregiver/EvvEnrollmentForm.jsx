import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Printer, Save } from 'lucide-react';
import { EvvEnrollmentStepOne, EvvEnrollmentStepTwo } from '../../components/agency/evv-enrollment/EvvEnrollmentSteps';
import { fetchCaregiverEvvEnrollment, submitCaregiverEvvEnrollment } from '../../redux/slices/evvEnrollmentsSlice';
import { evvEnrollmentToForm, WIZARD_STEPS } from '../../utils/evvEnrollmentForm';
import { ROUTES } from '../../routes/routes';

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

export default function CaregiverEvvEnrollmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected } = useSelector((state) => state.evvEnrollments);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(evvEnrollmentToForm(null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCaregiverEvvEnrollment(id))
      .unwrap()
      .catch(() => navigate(ROUTES.CAREGIVER_EVV_ENROLLMENTS))
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

  const editable = ['Pending', 'Rejected'].includes(form.status);
  const readOnly = !editable;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await dispatch(submitCaregiverEvvEnrollment({ id, formData: form.formData })).unwrap();
      navigate(ROUTES.CAREGIVER_EVV_ENROLLMENTS);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading enrollment form...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link to={ROUTES.CAREGIVER_EVV_ENROLLMENTS} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to EVV Enrollments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EVV Enrollment Form</h1>
          <p className="mt-1 text-sm text-gray-500">
            {form.clientName} · Care Plan {form.planCode} · {form.enrollmentCode}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.open(ROUTES.CAREGIVER_EVV_ENROLLMENT_PRINT.replace(':id', id), '_blank')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Printer size={16} /> Print Form
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <Stepper currentStep={step} />
        {step === 1 ? (
          <EvvEnrollmentStepOne form={form} onFormDataChange={onFormDataChange} readOnly={readOnly} lockClientFields={editable} />
        ) : (
          <EvvEnrollmentStepTwo form={form} onFormDataChange={onFormDataChange} readOnly={readOnly} />
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
          ) : editable ? (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Submitting...' : 'Submit to Agency'}
            </button>
          ) : (
            <p className="text-sm text-gray-500">This enrollment has been submitted and is awaiting agency review.</p>
          )}
        </div>
      </div>
    </div>
  );
}
