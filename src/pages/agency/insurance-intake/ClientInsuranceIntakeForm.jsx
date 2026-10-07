import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Printer, Save, Shield } from 'lucide-react';
import InsuranceIntakeStepper from '../../../components/agency/insurance-intake/InsuranceIntakeStepper';
import { InsuranceIntakeStepOne, InsuranceIntakeStepTwo } from '../../../components/agency/insurance-intake/InsuranceIntakeSteps';
import SubmitButton from '../../../components/ui/SubmitButton';
import { fetchClient, fetchClients } from '../../../redux/slices/clientsSlice';
import { fetchAssessment, fetchAssessments } from '../../../redux/slices/assessmentsSlice';
import {
  createInsuranceIntake,
  fetchInsuranceIntake,
  removeInsuranceDocument,
  updateInsuranceIntake,
  uploadInsuranceDocument,
} from '../../../redux/slices/insuranceIntakesSlice';
import {
  insuranceIntakeToForm,
  mergeInsurancePrefill,
  validateInsuranceIntakeStepOne,
  validateInsuranceIntakeStepTwo,
} from '../../../utils/insuranceIntakeForm';
import { saveInsuranceIntakePrintDraft } from './InsuranceIntakePrintPage';
import { ROUTES } from '../../../routes/routes';
import { toast } from 'react-toastify';
import useSubmitLock from '../../../hooks/useSubmitLock';
import useScrollToTopOnChange from '../../../hooks/useScrollToTopOnChange';
import { scrollAppToTop } from '../../../utils/scrollAppToTop';

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
    const payload = await dispatch(fetchAssessments({ client_id: selectedClientId, limit: 50 })).unwrap();
    const rows = Array.isArray(payload) ? payload : (payload?.items || []);
    const summary = rows.find((a) => a.status === 'Accepted')
      || rows.find((a) => a.clientId === selectedClientId)
      || rows[0]
      || null;
    if (summary?.id) {
      assessment = await dispatch(fetchAssessment(summary.id)).unwrap();
    }
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
  const [submitting, runLocked] = useSubmitLock();
  const [errors, setErrors] = useState({});
  const [intakeRecordId, setIntakeRecordId] = useState(id || null);
  const [uploadingKey, setUploadingKey] = useState(null);
  const clientLockedFromQuery = Boolean(searchParams.get('clientId'));
  const clientInfoLocked = Boolean(clientId);
  const clientSelectLocked = clientLockedFromQuery || (Boolean(intakeRecordId) && Boolean(clientId));

  useScrollToTopOnChange(step);

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
      setIntakeRecordId(existing.id || id);
    };

    hydrate();
    return () => { cancelled = true; };
  }, [clients, dispatch, existing, id, isEdit]);

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
      const clear = (...errorKeys) => errorKeys.forEach((k) => delete next[k]);
      keys.forEach((key) => {
        if (section === 'clientInfo') {
          if (key === 'clientFullName') clear('clientFullName');
          if (key === 'dob') clear('dob');
          if (key === 'gender') clear('gender');
          if (key === 'address') clear('address');
          if (key === 'city') clear('city');
          if (key === 'state') clear('state');
          if (key === 'zip') clear('zip');
          if (key === 'email') clear('email');
          if (key === 'ssnLast4') clear('ssnLast4');
          if (key === 'phoneMobile' || key === 'phoneHome') clear('phoneMobile', 'phoneHome');
          if (key === 'emergencyPhone') clear('emergencyPhone');
        }
        if (section === 'primaryInsurance') {
          if (key === 'types') clear('insuranceTypes');
          if (key === 'otherType') clear('otherType');
          if (key === 'companyName') clear('companyName');
          if (key === 'memberId') clear('memberId');
          if (key === 'policyHolderRelationship') clear('policyHolderRelationship');
          if (key === 'policyHolderRelationshipOther') clear('policyHolderRelationshipOther');
          if (key === 'insurancePhone') clear('insurancePhone');
          if (key === 'policyHolderDob') clear('policyHolderDob');
          if (key === 'effectiveDate') clear('effectiveDate');
        }
        if (section === 'secondaryInsurance' && key === 'dob') clear('secondaryDob');
        if (section === 'prescriptionCoverage' && key === 'phone') clear('rxPhone');
        if (section === 'medicaid') {
          if (key === 'caseWorkerPhone') clear('caseWorkerPhone');
          if (key === 'effectiveDate') clear('medicaidEffectiveDate');
        }
        if (section === 'medicare') {
          if (key === 'partAEffectiveDate') clear('partAEffectiveDate');
          if (key === 'partBEffectiveDate') clear('partBEffectiveDate');
        }
        if (section === 'additionalCoverage') {
          if (key === 'vaBenefits' || key === 'vaClaimNumber') clear('vaClaimNumber');
          if (key === 'longTermCare' || key === 'ltcPolicyClaimNumber') clear('ltcPolicyClaimNumber');
          if (key === 'ltcCompany') clear('ltcCompany');
        }
        if (section === 'authorization') {
          if (key === 'printName') clear('authPrintName');
          if (key === 'date') clear('authDate');
          if (key === 'signature') clear('authSignature');
        }
        if (section === 'requiredDocuments') {
          if (key === 'insuranceCard') clear('docInsuranceCard');
          if (key === 'photoId') clear('docPhotoId');
        }
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

  const buildPayload = (status = form.status) => ({
    clientId: clientId || undefined,
    status,
    intakeDate: form.intakeDate,
    formData: form.formData,
  });

  const ensureIntakeSaved = async () => {
    if (intakeRecordId) return intakeRecordId;
    const step1 = validateInsuranceIntakeStepOne(form, { clientInfoLocked });
    if (Object.keys(step1).length) {
      setErrors(step1);
      setStep(1);
      scrollAppToTop();
      toast.error('Complete required client details before uploading documents');
      throw new Error('validation');
    }
    const created = await dispatch(createInsuranceIntake(buildPayload('Draft'))).unwrap();
    setIntakeRecordId(created.id);
    setForm((prev) => ({
      ...insuranceIntakeToForm(created),
      formData: {
        ...insuranceIntakeToForm(created).formData,
        ...prev.formData,
        requiredDocuments: created.formData?.requiredDocuments || prev.formData.requiredDocuments,
      },
      intakeCode: created.intakeCode,
      status: created.status,
    }));
    navigate(ROUTES.AGENCY_INSURANCE_INTAKE_EDIT.replace(':id', created.id), { replace: true });
    return created.id;
  };

  const applyIntakeToForm = (intake) => {
    setForm((prev) => ({
      ...prev,
      intakeCode: intake.intakeCode || prev.intakeCode,
      status: intake.status || prev.status,
      formData: {
        ...prev.formData,
        requiredDocuments: intake.formData?.requiredDocuments || prev.formData.requiredDocuments,
      },
    }));
  };

  const handleUploadDocument = async (docKey, file) => {
    setUploadingKey(docKey);
    try {
      const recordId = await ensureIntakeSaved();
      const updated = await dispatch(uploadInsuranceDocument({ id: recordId, docKey, file })).unwrap();
      applyIntakeToForm(updated);
      setErrors((prev) => {
        const next = { ...prev };
        if (docKey === 'insuranceCard') delete next.docInsuranceCard;
        if (docKey === 'photoId') delete next.docPhotoId;
        return next;
      });
    } catch {
      // toast / validation handled upstream
    } finally {
      setUploadingKey(null);
    }
  };

  const handleRemoveDocument = async (docKey) => {
    if (!intakeRecordId) return;
    setUploadingKey(docKey);
    try {
      const updated = await dispatch(removeInsuranceDocument({ id: intakeRecordId, docKey })).unwrap();
      applyIntakeToForm(updated);
    } catch {
      // toast in slice
    } finally {
      setUploadingKey(null);
    }
  };

  const goNext = () => {
    const stepErrors = validateInsuranceIntakeStepOne(form, { clientInfoLocked });
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length) {
      scrollAppToTop();
      toast.error('Please fix the highlighted fields before continuing');
      return;
    }
    setStep(2);
    scrollAppToTop();
  };

  const handleSubmit = () => {
    const step1 = validateInsuranceIntakeStepOne(form, { clientInfoLocked });
    const step2 = validateInsuranceIntakeStepTwo(form);
    const allErrors = { ...step1, ...step2 };
    setErrors(allErrors);
    if (Object.keys(step1).length) {
      setStep(1);
      scrollAppToTop();
      toast.error('Please fix the highlighted fields before saving');
      return;
    }
    if (Object.keys(step2).length) {
      scrollAppToTop();
      toast.error('Please fix the highlighted fields before saving');
      return;
    }

    return runLocked(async () => {
      const payload = buildPayload();
      try {
        if (intakeRecordId) await dispatch(updateInsuranceIntake({ id: intakeRecordId, payload })).unwrap();
        else await dispatch(createInsuranceIntake(payload)).unwrap();
        navigate(ROUTES.AGENCY_INSURANCE_INTAKE);
      } catch { /* toast */ }
    });
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
          <InsuranceIntakeStepTwo
            form={form}
            onFormDataChange={onFormDataChange}
            errors={errors}
            intakeId={intakeRecordId}
            onUploadDocument={handleUploadDocument}
            onRemoveDocument={handleRemoveDocument}
            uploadingKey={uploadingKey}
          />
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
            <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover">
              Next: Coverage & Authorization <ArrowRight size={18} />
            </button>
          ) : (
            <SubmitButton
              loading={submitting}
              onClick={handleSubmit}
              icon={Save}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              {intakeRecordId ? 'Update Intake' : 'Save Intake'}
            </SubmitButton>
          )}
        </div>
      </div>
    </div>
  );
}
