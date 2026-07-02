import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, ClipboardList, Printer, Save } from 'lucide-react';
import CarePlanStepper from '../../../components/agency/care-plans/CarePlanStepper';
import { CarePlanStepOne, CarePlanStepTwo } from '../../../components/agency/care-plans/CarePlanSteps';
import { fetchClients } from '../../../redux/slices/clientsSlice';
import { fetchCaregivers } from '../../../redux/slices/caregiversSlice';
import { createCarePlan, fetchCarePlan, updateCarePlan } from '../../../redux/slices/carePlansSlice';
import { carePlanToForm, clientToFormPatch } from '../../../utils/carePlanForm';
import { saveCarePlanPrintDraft } from './CarePlanPrintPage';
import { ROUTES } from '../../../routes/routes';

export default function GenerateCarePlan() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const authUser = useSelector((state) => state.auth.user);
  const agencyName = authUser?.agencyName ?? '';
  const { list: clients } = useSelector((state) => state.clients);
  const { list: caregivers } = useSelector((state) => state.caregivers);
  const { selected: existingPlan } = useSelector((state) => state.carePlans);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(carePlanToForm(null));
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchCaregivers());
    if (isEdit) dispatch(fetchCarePlan(id)).finally(() => setLoading(false));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!existingPlan || !isEdit) return;
    const client = existingPlan.client || clients.find((c) => c.id === existingPlan.clientId);
    setForm(carePlanToForm(existingPlan, client));
    setClientId(existingPlan.clientId || '');
  }, [clients, existingPlan, isEdit]);

  useEffect(() => {
    if (isEdit || !clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const patch = clientToFormPatch(client);
    setForm((p) => ({
      ...p,
      clientId,
      formData: {
        ...p.formData,
        clientInfo: { ...p.formData.clientInfo, ...patch.clientInfo },
        medicalInfo: { ...p.formData.medicalInfo, ...patch.medicalInfo },
        supplementary: { ...p.formData.supplementary, ...patch.supplementary },
      },
    }));
  }, [clientId, clients, isEdit]);

  const onHeaderChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const onFormDataChange = (section, patchOrValue, isRoot = false) => {
    setForm((p) => {
      if (isRoot) return { ...p, formData: { ...p.formData, [section]: patchOrValue } };
      if (typeof patchOrValue === 'object' && !Array.isArray(patchOrValue)) {
        return { ...p, formData: { ...p.formData, [section]: { ...p.formData[section], ...patchOrValue } } };
      }
      return p;
    });
  };

  const onClientChange = (newClientId) => {
    setClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (!client) return;
    const patch = clientToFormPatch(client);
    setForm((p) => ({
      ...p,
      clientId: newClientId,
      formData: {
        ...p.formData,
        clientInfo: { ...p.formData.clientInfo, ...patch.clientInfo },
        medicalInfo: { ...p.formData.medicalInfo, ...patch.medicalInfo },
        supplementary: { ...p.formData.supplementary, ...patch.supplementary },
      },
    }));
  };

  const handlePrint = () => {
    saveCarePlanPrintDraft({ ...form, clientId, planCode: form.planCode }, agencyName);
    window.open(ROUTES.AGENCY_CARE_PLANS_PRINT_DRAFT, '_blank');
  };

  const handleSubmit = async () => {
    if (!clientId) return;
    setSubmitting(true);
    const payload = {
      clientId,
      status: form.status,
      effectiveDate: form.effectiveDate,
      reviewDate: form.reviewDate,
      version: form.version,
      formData: form.formData,
    };
    try {
      if (isEdit) await dispatch(updateCarePlan({ id, payload })).unwrap();
      else await dispatch(createCarePlan(payload)).unwrap();
      navigate(ROUTES.AGENCY_CARE_PLANS);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading care plan...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link to={ROUTES.AGENCY_CARE_PLANS} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600">
        <ArrowLeft size={16} /> Back to Care Plans
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><ClipboardList size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Care Plan' : 'Generate Care Plan'}</h1>
            <p className="text-sm text-gray-500">Person-centered care plan matching the official CareTraker form</p>
          </div>
        </div>
        <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
          <Printer size={18} /> Print Form
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <CarePlanStepper currentStep={step} />
        {step === 1 ? (
          <CarePlanStepOne
            form={form}
            clients={clients}
            clientId={clientId}
            onClientChange={onClientChange}
            onHeaderChange={onHeaderChange}
            onFormDataChange={onFormDataChange}
            agencyName={agencyName}
          />
        ) : (
          <CarePlanStepTwo form={form} onFormDataChange={onFormDataChange} caregivers={caregivers} />
        )}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <Link to={ROUTES.AGENCY_CARE_PLANS} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">Cancel</Link>
          )}
          {step < 2 ? (
            <button type="button" disabled={!clientId} onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50">
              Next: Care Needs & Signatures <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" disabled={submitting || !clientId} onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Saving...' : isEdit ? 'Update Care Plan' : 'Save Care Plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
