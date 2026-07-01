import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react';
import AssessmentStepper from '../../../components/agency/assessments/AssessmentStepper';
import { AssessmentStepOne, AssessmentStepTwo } from '../../../components/agency/assessments/AssessmentSteps';
import { addAssessment, fetchAssessment, updateAssessment } from '../../../redux/slices/assessmentsSlice';
import { EMPTY_ASSESSMENT, assessmentToForm } from '../../../utils/assessmentForm';
import { ROUTES } from '../../../routes/routes';

export default function ClientAssessmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_ASSESSMENT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...EMPTY_ASSESSMENT });
      setStep(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchAssessment(id)).unwrap()
      .then((data) => { setForm(assessmentToForm(data)); setStep(1); })
      .catch(() => navigate(ROUTES.AGENCY_ASSESSMENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, isEdit, navigate]);

  const onHeaderChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const onFormDataChange = (section, patchOrValue, isRoot = false) => {
    setForm((p) => {
      if (isRoot) return { ...p, formData: { ...p.formData, [section]: patchOrValue } };
      if (typeof patchOrValue === 'object' && !Array.isArray(patchOrValue)) {
        return { ...p, formData: { ...p.formData, [section]: { ...p.formData[section], ...patchOrValue } } };
      }
      return p;
    });
    if (section === 'clientInfo' && patchOrValue?.clientName !== undefined) {
      setErrors((e) => { const n = { ...e }; delete n.clientName; return n; });
    }
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.formData.clientInfo.clientName?.trim()) e.clientName = 'Client name is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      assessorName: form.assessorName,
      assessmentDate: form.assessmentDate,
      assessmentTypes: form.assessmentTypes,
      formData: form.formData,
    };
    try {
      if (isEdit) await dispatch(updateAssessment({ id, payload })).unwrap();
      else await dispatch(addAssessment(payload)).unwrap();
      navigate(ROUTES.AGENCY_ASSESSMENTS);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading assessment...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <Link to={ROUTES.AGENCY_ASSESSMENTS} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardList size={22} /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Assessment' : 'New Client Assessment'}</h1>
          <p className="text-sm text-gray-500">Evaluate client needs before generating a care plan quote</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <AssessmentStepper currentStep={step} />
        {step === 1 ? (
          <AssessmentStepOne form={form} onHeaderChange={onHeaderChange} onFormDataChange={onFormDataChange} errors={errors} />
        ) : (
          <AssessmentStepTwo form={form} onFormDataChange={onFormDataChange} />
        )}
        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
          ) : (
            <Link to={ROUTES.AGENCY_ASSESSMENTS} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => { if (validateStep1()) setStep(2); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
              Next: Functional Assessment <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
