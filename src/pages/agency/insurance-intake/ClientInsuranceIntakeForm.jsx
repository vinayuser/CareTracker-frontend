import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Printer, Save, Shield } from 'lucide-react';
import InsuranceIntakeStepper from '../../../components/agency/insurance-intake/InsuranceIntakeStepper';
import { InsuranceIntakeStepOne, InsuranceIntakeStepTwo } from '../../../components/agency/insurance-intake/InsuranceIntakeSteps';
import { fetchClients } from '../../../redux/slices/clientsSlice';
import { createInsuranceIntake, fetchInsuranceIntake, updateInsuranceIntake } from '../../../redux/slices/insuranceIntakesSlice';
import { insuranceIntakeToForm, clientToInsurancePatch } from '../../../utils/insuranceIntakeForm';
import { saveInsuranceIntakePrintDraft } from './InsuranceIntakePrintPage';
import { ROUTES } from '../../../routes/routes';

export default function ClientInsuranceIntakeForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { list: clients } = useSelector((state) => state.clients);
  const { selected: existing } = useSelector((state) => state.insuranceIntakes);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(insuranceIntakeToForm(null));
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchClients());
    if (isEdit) dispatch(fetchInsuranceIntake(id)).finally(() => setLoading(false));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!existing || !isEdit) return;
    const client = existing.client || clients.find((c) => c.id === existing.clientId);
    setForm(insuranceIntakeToForm(existing, client));
    setClientId(existing.clientId || '');
  }, [clients, existing, isEdit]);

  useEffect(() => {
    if (isEdit || !clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const patch = clientToInsurancePatch(client);
    setForm((p) => ({
      ...p,
      clientId,
      formData: {
        ...p.formData,
        clientInfo: { ...p.formData.clientInfo, ...patch.clientInfo },
        primaryInsurance: { ...p.formData.primaryInsurance, ...patch.primaryInsurance },
      },
    }));
  }, [clientId, clients, isEdit]);

  const onHeaderChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const onFormDataChange = (section, patch) => {
    setForm((p) => ({
      ...p,
      formData: { ...p.formData, [section]: { ...p.formData[section], ...patch } },
    }));
  };

  const onClientChange = (newClientId) => {
    setClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (!client) return;
    const patch = clientToInsurancePatch(client);
    setForm((p) => ({
      ...p,
      clientId: newClientId,
      formData: {
        ...p.formData,
        clientInfo: { ...p.formData.clientInfo, ...patch.clientInfo },
        primaryInsurance: { ...p.formData.primaryInsurance, ...patch.primaryInsurance },
      },
    }));
  };

  const handlePrint = () => {
    saveInsuranceIntakePrintDraft({ ...form, clientId, intakeCode: form.intakeCode });
    window.open(ROUTES.AGENCY_INSURANCE_INTAKE_PRINT_DRAFT, '_blank');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      clientId: clientId || undefined,
      status: form.status,
      intakeDate: form.intakeDate,
      formData: form.formData,
    };
    try {
      if (isEdit) await dispatch(updateInsuranceIntake({ id, payload })).unwrap();
      else await dispatch(createInsuranceIntake(payload)).unwrap();
      navigate(ROUTES.AGENCY_INSURANCE_INTAKE);
    } catch { /* toast */ }
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading insurance intake...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <Link to={ROUTES.AGENCY_INSURANCE_INTAKE} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to Insurance Intake
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Shield size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Insurance Intake' : 'New Insurance Intake'}</h1>
            <p className="text-sm text-gray-500">Client insurance intake form matching the official CareTraker PDF</p>
          </div>
        </div>
        <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-primary/30 hover:bg-blue-50 hover:text-primary">
          <Printer size={18} /> Print Form
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <InsuranceIntakeStepper currentStep={step} />
        {step === 1 ? (
          <InsuranceIntakeStepOne form={form} clients={clients} clientId={clientId} onClientChange={onClientChange} onHeaderChange={onHeaderChange} onFormDataChange={onFormDataChange} />
        ) : (
          <InsuranceIntakeStepTwo form={form} onFormDataChange={onFormDataChange} />
        )}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <Link to={ROUTES.AGENCY_INSURANCE_INTAKE} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">Cancel</Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover">
              Next: Coverage & Authorization <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Saving...' : isEdit ? 'Update Intake' : 'Save Intake'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
