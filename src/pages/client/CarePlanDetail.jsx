import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, ClipboardList, PenLine, Printer } from 'lucide-react';
import CarePlanStepper from '../../components/agency/care-plans/CarePlanStepper';
import { CarePlanStepOne, CarePlanStepTwo } from '../../components/agency/care-plans/CarePlanSteps';
import SubmitButton from '../../components/ui/SubmitButton';
import { carePlanToForm } from '../../utils/carePlanForm';
import {
  fetchClientCarePlan,
  clearSelectedClientPlan,
  signClientCarePlan,
} from '../../redux/slices/clientPortalSlice';
import { saveCarePlanPrintDraft } from '../agency/care-plans/CarePlanPrintPage';
import { ROUTES } from '../../routes/routes';
import { getAuthUser } from '../../utils/auth';
import useSubmitLock from '../../hooks/useSubmitLock';
import useScrollToTopOnChange from '../../hooks/useScrollToTopOnChange';

const hasSignatureInk = (value) => Boolean(value && String(value).startsWith('data:image'));

export default function ClientCarePlanDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const authUser = getAuthUser();
  const { selectedPlan, planLoading } = useSelector((state) => state.clientPortal);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(null);
  const [submitting, runLocked] = useSubmitLock();

  useScrollToTopOnChange(step);

  useEffect(() => {
    dispatch(fetchClientCarePlan(id));
    return () => dispatch(clearSelectedClientPlan());
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedPlan) return;
    const next = carePlanToForm(selectedPlan, selectedPlan.client || null);
    const clientRep = next.formData?.signatures?.clientRep || {};
    const clientName = selectedPlan.client?.fullName
      || next.formData?.clientInfo?.clientName
      || authUser?.fullName
      || '';
    if (!hasSignatureInk(clientRep.signature)) {
      next.formData.signatures = {
        ...next.formData.signatures,
        clientRep: {
          ...clientRep,
          name: clientRep.name || clientName,
          date: clientRep.date || new Date().toISOString().slice(0, 10),
        },
      };
    }
    setForm(next);
  }, [selectedPlan, authUser?.fullName]);

  const alreadySigned = useMemo(
    () => hasSignatureInk(selectedPlan?.formData?.signatures?.clientRep?.signature),
    [selectedPlan],
  );

  const clientSignatureEditable = Boolean(form) && !alreadySigned;

  const onFormDataChange = (section, patchOrValue, isRoot = false) => {
    if (!clientSignatureEditable || section !== 'signatures') return;
    setForm((p) => {
      if (!p) return p;
      if (isRoot) return { ...p, formData: { ...p.formData, [section]: patchOrValue } };
      if (typeof patchOrValue === 'object' && !Array.isArray(patchOrValue)) {
        const nextSig = { ...p.formData.signatures, ...patchOrValue };
        // Only allow clientRep edits from the client portal.
        return {
          ...p,
          formData: {
            ...p.formData,
            signatures: {
              ...p.formData.signatures,
              clientRep: nextSig.clientRep || p.formData.signatures.clientRep,
            },
          },
        };
      }
      return p;
    });
  };

  const handleSign = () => runLocked(async () => {
    const clientRep = form?.formData?.signatures?.clientRep || {};
    if (!hasSignatureInk(clientRep.signature)) {
      toast.error('Please draw your signature before submitting.');
      return;
    }
    try {
      await dispatch(signClientCarePlan({
        id,
        payload: {
          name: clientRep.name || '',
          signature: clientRep.signature,
          date: clientRep.date || new Date().toISOString().slice(0, 10),
        },
      })).unwrap();
      toast.success('Care plan signed successfully.');
    } catch {
      /* toast from interceptor */
    }
  });

  const handlePrint = () => {
    if (!form) return;
    saveCarePlanPrintDraft(
      {
        ...form,
        clientId: selectedPlan.clientId || form.clientId,
        planCode: form.planCode || selectedPlan.planCode,
      },
      agencyNameForPrint(),
    );
    window.open(ROUTES.CLIENT_CARE_PLANS_PRINT_DRAFT, '_blank');
  };

  const agencyNameForPrint = () => authUser?.agencyName || selectedPlan?.agencyName || '';

  if (planLoading && !selectedPlan) {
    return <p className="text-sm text-gray-500">Loading care plan…</p>;
  }

  if (!selectedPlan || !form) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="font-medium text-gray-900">Care plan not found</p>
        <Link to={ROUTES.CLIENT_CARE_PLANS} className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to care plans
        </Link>
      </div>
    );
  }

  const agencyName = agencyNameForPrint();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Care Plan</h1>
            <p className="text-sm text-gray-500">
              {selectedPlan.planCode}
              {selectedPlan.status ? ` · ${selectedPlan.status}` : ''}
              {selectedPlan.version ? ` · ${selectedPlan.version}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {alreadySigned ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Signed
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              Signature required
            </span>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          >
            <Printer size={18} /> Print Form
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <CarePlanStepper currentStep={step} />
        {step === 1 ? (
          <CarePlanStepOne
            form={form}
            clients={[]}
            clientId={selectedPlan.clientId || ''}
            onClientChange={() => {}}
            onHeaderChange={() => {}}
            onFormDataChange={() => {}}
            agencyName={agencyName}
            clientInfoLocked
            readOnly
          />
        ) : (
          <CarePlanStepTwo
            form={form}
            onFormDataChange={onFormDataChange}
            caregivers={[]}
            readOnly
            clientSignatureEditable={clientSignatureEditable}
          />
        )}

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
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
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              Next: Review & Sign <ArrowRight size={18} />
            </button>
          ) : clientSignatureEditable ? (
            <SubmitButton
              loading={submitting}
              onClick={handleSign}
              icon={PenLine}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
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
