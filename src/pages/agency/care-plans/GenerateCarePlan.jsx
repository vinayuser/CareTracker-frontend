import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, ClipboardList, Printer, Save } from 'lucide-react';
import CarePlanStepper from '../../../components/agency/care-plans/CarePlanStepper';
import { CarePlanStepOne, CarePlanStepTwo } from '../../../components/agency/care-plans/CarePlanSteps';
import SubmitButton from '../../../components/ui/SubmitButton';
import { fetchClients } from '../../../redux/slices/clientsSlice';
import { fetchCaregivers } from '../../../redux/slices/caregiversSlice';
import { fetchHrStaff } from '../../../redux/slices/hrStaffSlice';
import { createCarePlan, fetchCarePlan, updateCarePlan } from '../../../redux/slices/carePlansSlice';
import { carePlanToForm, clientToFormPatch, todayIso } from '../../../utils/carePlanForm';
import {
  sanitizeCarePlanPatch,
  validateCarePlanForm,
} from '../../../utils/carePlanFormValidation';
import { saveCarePlanPrintDraft } from './CarePlanPrintPage';
import { ROUTES } from '../../../routes/routes';
import useSubmitLock from '../../../hooks/useSubmitLock';
import useScrollToTopOnChange from '../../../hooks/useScrollToTopOnChange';

function applyClientSignatureDefaults(formData, clientName) {
  const today = todayIso();
  const sig = formData.signatures || {};
  const clientRep = sig.clientRep || {};
  return {
    ...formData,
    authorization: {
      ...(formData.authorization || {}),
      representativeName: formData.authorization?.representativeName || clientName || '',
      date: formData.authorization?.date || today,
    },
    signatures: {
      ...sig,
      clientRep: {
        ...clientRep,
        name: clientRep.name || clientName || '',
        date: clientRep.date || today,
      },
      agencyStaff: {
        ...(sig.agencyStaff || {}),
        date: sig.agencyStaff?.date || today,
      },
      supervisor: {
        ...(sig.supervisor || {}),
        date: sig.supervisor?.date || today,
      },
    },
  };
}

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
  const { list: hrStaff } = useSelector((state) => state.hrStaff);
  const { selected: existingPlan } = useSelector((state) => state.carePlans);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(carePlanToForm(null));
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, runLocked] = useSubmitLock();

  useScrollToTopOnChange(step);

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchCaregivers());
    dispatch(fetchHrStaff());
    if (isEdit) dispatch(fetchCarePlan(id)).finally(() => setLoading(false));
  }, [dispatch, id, isEdit]);

  const agencyMembers = useMemo(() => {
    const members = [];
    const ownerName = authUser?.fullName || authUser?.name || authUser?.email || '';
    if (ownerName) {
      members.push({
        id: `owner-${authUser?.id || authUser?.email || 'self'}`,
        name: ownerName,
        role: 'Agency Owner',
      });
    }
    (hrStaff || [])
      .filter((m) => m.status !== 'Inactive')
      .forEach((m) => {
        const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || '';
        if (!name) return;
        // Avoid duplicating the logged-in owner if they also appear in HR list
        if (members.some((existing) => existing.name.toLowerCase() === name.toLowerCase())) return;
        members.push({
          id: m.id,
          name,
          role: m.jobTitle || m.department || 'Team Member',
        });
      });
    return members;
  }, [authUser, hrStaff]);

  useEffect(() => {
    if (!existingPlan || !isEdit) return;
    const client = existingPlan.client
      || clients.find((c) => String(c.id) === String(existingPlan.clientId));
    const next = carePlanToForm(existingPlan, client);
    setForm({
      ...next,
      formData: applyClientSignatureDefaults(next.formData, next.formData?.clientInfo?.clientName || ''),
    });
    setClientId(existingPlan.clientId || '');
  }, [clients, existingPlan, isEdit]);

  useEffect(() => {
    if (isEdit || !clientId) return;
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const patch = clientToFormPatch(client);
    setForm((p) => {
      const clientInfo = { ...p.formData.clientInfo, ...patch.clientInfo };
      return {
        ...p,
        clientId,
        clientPhoto: client.profilePic || client.photo || '',
        formData: applyClientSignatureDefaults({
          ...p.formData,
          clientInfo,
          medicalInfo: { ...p.formData.medicalInfo, ...patch.medicalInfo },
          supplementary: { ...p.formData.supplementary, ...patch.supplementary },
        }, clientInfo.clientName || ''),
      };
    });
  }, [clientId, clients, isEdit]);

  const onHeaderChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const onFormDataChange = (section, patchOrValue, isRoot = false) => {
    const safe = sanitizeCarePlanPatch(section, patchOrValue);
    setForm((p) => {
      if (isRoot) return { ...p, formData: { ...p.formData, [section]: safe } };
      if (typeof safe === 'object' && !Array.isArray(safe)) {
        return { ...p, formData: { ...p.formData, [section]: { ...p.formData[section], ...safe } } };
      }
      return p;
    });
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      Object.keys(prev).forEach((key) => {
        if (key === section || key.startsWith(`${section}.`)) delete next[key];
      });
      return next;
    });
  };

  const onClientChange = (newClientId) => {
    setClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (!client) return;
    const patch = clientToFormPatch(client);
    setForm((p) => {
      const clientInfo = { ...p.formData.clientInfo, ...patch.clientInfo };
      return {
        ...p,
        clientId: newClientId,
        clientPhoto: client.profilePic || client.photo || '',
        formData: applyClientSignatureDefaults({
          ...p.formData,
          clientInfo,
          medicalInfo: { ...p.formData.medicalInfo, ...patch.medicalInfo },
          supplementary: { ...p.formData.supplementary, ...patch.supplementary },
          signatures: {
            ...p.formData.signatures,
            // Always refresh client signature name when switching clients (unless already signed)
            clientRep: {
              ...p.formData.signatures?.clientRep,
              name: p.formData.signatures?.clientRep?.signature?.startsWith?.('data:image')
                ? (p.formData.signatures?.clientRep?.name || clientInfo.clientName || '')
                : (clientInfo.clientName || ''),
            },
          },
        }, clientInfo.clientName || ''),
      };
    });
  };

  const handlePrint = () => {
    saveCarePlanPrintDraft({ ...form, clientId, planCode: form.planCode }, agencyName);
    window.open(ROUTES.AGENCY_CARE_PLANS_PRINT_DRAFT, '_blank');
  };

  const handleNext = () => {
    const nextErrors = validateCarePlanForm({ ...form, clientId }, { requireClient: true });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = () => {
    if (!clientId) return;
    const formErrors = validateCarePlanForm({ ...form, clientId }, { requireClient: true });
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setStep(1);
      return;
    }
    return runLocked(async () => {
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
        toast.success('Care plan saved. EVV enrollments created for assigned caregivers.');
        navigate(ROUTES.AGENCY_CARE_PLANS);
      } catch { /* toast */ }
    });
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
            clientInfoLocked={isEdit || Boolean(clientId)}
            errors={errors}
          />
        ) : (
          <CarePlanStepTwo
            form={form}
            onFormDataChange={onFormDataChange}
            caregivers={caregivers}
            agencyMembers={agencyMembers}
          />
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
            <button type="button" disabled={!clientId} onClick={handleNext} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50">
              Next: Care Needs & Signatures <ArrowRight size={18} />
            </button>
          ) : (
            <SubmitButton
              loading={submitting}
              disabled={!clientId}
              onClick={handleSubmit}
              icon={Save}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              {isEdit ? 'Update Care Plan' : 'Save Care Plan'}
            </SubmitButton>
          )}
        </div>
      </div>
    </div>
  );
}
