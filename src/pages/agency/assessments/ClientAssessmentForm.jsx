import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, ClipboardList, Printer, Save } from 'lucide-react';
import AssessmentStepper from '../../../components/agency/assessments/AssessmentStepper';
import { AssessmentStepOne, AssessmentStepTwo } from '../../../components/agency/assessments/AssessmentSteps';
import { addAssessment, fetchAssessment, updateAssessment } from '../../../redux/slices/assessmentsSlice';
import {
  EMPTY_ASSESSMENT,
  assessmentToForm,
  buildEmptyFormData,
  joinClientName,
  todayIso,
} from '../../../utils/assessmentForm';
import { ROUTES } from '../../../routes/routes';
import { saveAssessmentPrintDraft } from './AssessmentPrintPage';

function applyLeadPrefill(prefill) {
  const base = {
    ...EMPTY_ASSESSMENT,
    assessmentDate: todayIso(),
    formData: buildEmptyFormData(),
  };
  if (!prefill) return base;
  const firstName = prefill.firstName || '';
  const lastName = prefill.lastName || '';
  return {
    ...base,
    formData: {
      ...base.formData,
      clientInfo: {
        ...base.formData.clientInfo,
        firstName,
        lastName,
        clientName: joinClientName(firstName, lastName),
        primaryDiagnosis: prefill.primaryDiagnosis || '',
      },
      contactInfo: {
        ...base.formData.contactInfo,
        mobile: prefill.clientPhone || '',
        homePhone: prefill.clientPhone || '',
        email: prefill.clientEmail || '',
      },
      physicianInfo: {
        ...base.formData.physicianInfo,
        primaryPhysician: prefill.physicianName || '',
      },
      allergies: {
        ...base.formData.allergies,
        details: prefill.allergies || '',
      },
      coordinatorNotes: prefill.careNotes || '',
    },
  };
}

export default function ClientAssessmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const agencyName = authUser?.agencyName ?? '';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_ASSESSMENT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setForm(applyLeadPrefill(location.state?.leadPrefill));
      setStep(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchAssessment(id)).unwrap()
      .then((data) => { setForm(assessmentToForm(data)); setStep(1); })
      .catch(() => navigate(ROUTES.AGENCY_ASSESSMENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, isEdit, location.state, navigate]);

  const onHeaderChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const onFormDataChange = (section, patchOrValue, isRoot = false) => {
    setForm((p) => {
      if (isRoot) return { ...p, formData: { ...p.formData, [section]: patchOrValue } };
      if (typeof patchOrValue === 'object' && !Array.isArray(patchOrValue)) {
        const nextSection = { ...p.formData[section], ...patchOrValue };
        if (section === 'clientInfo') {
          nextSection.clientName = joinClientName(nextSection.firstName, nextSection.lastName);
        }
        return { ...p, formData: { ...p.formData, [section]: nextSection } };
      }
      return p;
    });
    if (section === 'clientInfo') {
      setErrors((e) => {
        const n = { ...e };
        if (patchOrValue?.firstName !== undefined) delete n.firstName;
        if (patchOrValue?.lastName !== undefined) delete n.lastName;
        return n;
      });
    }
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.formData.clientInfo.firstName?.trim()) e.firstName = 'First name is required';
    if (!form.formData.clientInfo.lastName?.trim()) e.lastName = 'Last name is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const ci = form.formData.clientInfo || {};
    const payload = {
      assessorName: form.assessorName,
      assessorTitle: form.assessorTitle,
      assessorPhoto: form.assessorPhoto,
      assessmentDate: form.assessmentDate,
      assessmentTypes: form.assessmentTypes,
      formData: {
        ...form.formData,
        clientInfo: {
          ...ci,
          firstName: String(ci.firstName || '').trim(),
          lastName: String(ci.lastName || '').trim(),
          clientName: joinClientName(ci.firstName, ci.lastName),
        },
      },
    };
    try {
      if (isEdit) await dispatch(updateAssessment({ id, payload })).unwrap();
      else await dispatch(addAssessment(payload)).unwrap();
      navigate(ROUTES.AGENCY_ASSESSMENTS);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  const handlePrint = () => {
    saveAssessmentPrintDraft(form, agencyName);
    window.open(ROUTES.AGENCY_ASSESSMENTS_PRINT_DRAFT, '_blank');
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading assessment...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <Link to={ROUTES.AGENCY_ASSESSMENTS} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardList size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Assessment' : 'New Client Assessment'}</h1>
            <p className="text-sm text-gray-500">Evaluate client needs before generating a care plan quote</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-primary/30 hover:bg-gray-50 hover:text-primary"
        >
          <Printer size={18} /> Print Form
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <AssessmentStepper currentStep={step} />
        {step === 1 ? (
          <AssessmentStepOne form={form} onHeaderChange={onHeaderChange} onFormDataChange={onFormDataChange} errors={errors} agencyName={agencyName} />
        ) : (
          <AssessmentStepTwo form={form} onFormDataChange={onFormDataChange} />
        )}
        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <Link to={ROUTES.AGENCY_ASSESSMENTS} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              Cancel
            </Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => { if (validateStep1()) setStep(2); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover">
              Next: Functional Assessment <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Saving...' : 'Save Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
