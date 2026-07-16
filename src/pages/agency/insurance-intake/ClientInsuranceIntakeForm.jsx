import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Printer, Save, Shield } from 'lucide-react';
import InsuranceIntakeStepper from '../../../components/agency/insurance-intake/InsuranceIntakeStepper';
import { InsuranceIntakeStepOne, InsuranceIntakeStepTwo } from '../../../components/agency/insurance-intake/InsuranceIntakeSteps';
import { fetchClient, fetchClients } from '../../../redux/slices/clientsSlice';
import { fetchAssessments } from '../../../redux/slices/assessmentsSlice';
import { createInsuranceIntake, fetchInsuranceIntake, updateInsuranceIntake } from '../../../redux/slices/insuranceIntakesSlice';
import {
  insuranceIntakeToForm,
  mergeInsurancePrefill,
  validateInsuranceIntakeStepOne,
  validateInsuranceIntakeStepTwo,
} from '../../../utils/insuranceIntakeForm';
import { saveInsuranceIntakePrintDraft } from './InsuranceIntakePrintPage';
import { ROUTES } from '../../../routes/routes';

async function loadInsurancePrefill(dispatch, selectedClientId, clientsList = []) {
  if (!selectedClientId) return null;

  let client = clientsList.find((c) => c.id === selectedClientId) || null;
  try {
    client = await dispatch(fetchClient(selectedClientId)).unwrap();
  } catch {
    // keep list fallback
  }

  let assessment = null;
  try {
    const list = await dispatch(fetchAssessments({ client_id: selectedClientId })).unwrap();
    const rows = Array.isArray(list) ? list : [];
    assessment = rows.find((a) => a.status === 'Accepted')
      || rows.find((a) => a.clientId === selectedClientId)
      || rows[0]
      || null;
  } catch {
    assessment = null;
  }

  return mergeInsurancePrefill(client, assessment);
}

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
  const [loading, setLoading] = useState(isEdit || Boolean(searchParams.get('clientId')));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const clientLockedFromQuery = Boolean(searchParams.get('clientId'));
  const clientInfoLocked = Boolean(clientId);
  const clientSelectLocked = clientLockedFromQuery || (isEdit && Boolean(clientId));

  useEffect(() => {
    dispatch(fetchClients());
    if (isEdit) dispatch(fetchInsuranceIntake(id)).finally(() => setLoading(false));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!existing || !isEdit) return;
    let cancelled = false;

    const hydrate = async () => {
      const client = existing.client || clients.find((c) => c.id === existing.clientId);
      const patch = existing.clientId
        ? await loadInsurancePrefill(dispatch, existing.clientId, clients)
        : null;
      if (cancelled) return;
      const base = insuranceIntakeToForm(existing, client);
      if (patch) {
        setForm({
          ...base,
          formData: {
            ...base.formData,
            clientInfo: { ...base.formData.clientInfo, ...patch.clientInfo },
            primaryInsurance: {
              ...base.formData.primaryInsurance,
              ...(!base.formData.primaryInsurance?.companyName ? patch.primaryInsurance : {
                policyHolderName: base.formData.primaryInsurance.policyHolderName || patch.primaryInsurance.policyHolderName,
                policyHolderDob: base.formData.primaryInsurance.policyHolderDob || patch.primaryInsurance.policyHolderDob,
                policyHolderRelationship: base.formData.primaryInsurance.policyHolderRelationship || patch.primaryInsurance.policyHolderRelationship,
              }),
            },
          },
        });
      } else {
        setForm(base);
      }
      setClientId(existing.clientId || '');
    };

    hydrate();
    return () => { cancelled = true; };
  }, [clients, dispatch, existing, isEdit]);

  useEffect(() => {
    if (isEdit || !clientId) {
      if (!isEdit && !clientId) setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    loadInsurancePrefill(dispatch, clientId)
      .then((patch) => {
        if (cancelled || !patch) return;
        setForm((p) => ({
          ...p,
          clientId,
          formData: {
            ...p.formData,
            clientInfo: { ...p.formData.clientInfo, ...patch.clientInfo },
            primaryInsurance: { ...p.formData.primaryInsurance, ...patch.primaryInsurance },
          },
        }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [clientId, dispatch, isEdit]);

  const onHeaderChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onFormDataChange = (section, patch) => {
    setForm((p) => ({
      ...p,
      formData: { ...p.formData, [section]: { ...p.formData[section], ...patch } },
    }));
    const keys = Object.keys(patch || {});
    if (!keys.length) return;
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((key) => {
        if (key === 'phoneMobile' || key === 'phoneHome') delete next.phoneMobile;
        if (key === 'dob') delete next.dob;
        if (key === 'emergencyPhone') delete next.emergencyPhone;
        if (key === 'insurancePhone') delete next.insurancePhone;
        if (key === 'phone' && section === 'prescriptionCoverage') delete next.rxPhone;
        if (key === 'caseWorkerPhone') delete next.caseWorkerPhone;
        if (key === 'date' && section === 'authorization') delete next.authDate;
      });
      return next;
    });
  };

  const onClientChange = (newClientId) => {
    setClientId(newClientId);
    setErrors({});
  };

  const handlePrint = () => {
    saveInsuranceIntakePrintDraft({ ...form, clientId, intakeCode: form.intakeCode });
    window.open(ROUTES.AGENCY_INSURANCE_INTAKE_PRINT_DRAFT, '_blank');
  };

  const scrollFormTop = () => {
    const main = document.querySelector('main.overflow-y-auto');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    const stepErrors = validateInsuranceIntakeStepOne(form, { clientInfoLocked });
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      scrollFormTop();
      return;
    }
    setStep(2);
    scrollFormTop();
  };

  const handleSubmit = async () => {
    const step1 = validateInsuranceIntakeStepOne(form, { clientInfoLocked });
    const step2 = validateInsuranceIntakeStepTwo(form);
    const allErrors = { ...step1, ...step2 };
    setErrors(allErrors);
    if (Object.keys(step1).length) {
      setStep(1);
      scrollFormTop();
      return;
    }
    if (Object.keys(step2).length) {
      scrollFormTop();
      return;
    }

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
          <InsuranceIntakeStepOne
            form={form}
            clients={clients}
            clientId={clientId}
            onClientChange={onClientChange}
            onHeaderChange={onHeaderChange}
            onFormDataChange={onFormDataChange}
            clientInfoLocked={clientInfoLocked}
            clientSelectLocked={clientSelectLocked}
            errors={errors}
          />
        ) : (
          <InsuranceIntakeStepTwo form={form} onFormDataChange={onFormDataChange} errors={errors} />
        )}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => { setStep(1); scrollFormTop(); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <Link to={ROUTES.AGENCY_INSURANCE_INTAKE} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">Cancel</Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover">
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
