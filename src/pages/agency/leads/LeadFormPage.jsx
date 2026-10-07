import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, Flame, MoreHorizontal, Pencil,
  Save, ClipboardPlus,
} from 'lucide-react';
import LeadFormSections from '../../../components/agency/leads/LeadFormSections';
import LeadStageStepper from '../../../components/agency/leads/LeadStageStepper';
import LeadStatusPanel from '../../../components/agency/leads/LeadStatusPanel';
import LeadContactedForm from '../../../components/agency/leads/LeadContactedForm';
import ScheduleHomeAssessmentForm from '../../../components/agency/leads/ScheduleHomeAssessmentForm';
import LeadProposalStep from '../../../components/agency/leads/LeadProposalStep';
import LeadConvertedStep from '../../../components/agency/leads/LeadConvertedStep';
import SubmitButton from '../../../components/ui/SubmitButton';
import {
  addLead,
  clearCurrentLead,
  convertLead,
  createAssessmentFromLead,
  fetchLead,
  logLeadContact,
  scheduleLeadAssessment,
  updateLead,
} from '../../../redux/slices/leadsSlice';
import { ROUTES } from '../../../routes/routes';
import { formToPayload, joinLeadName, leadToForm } from '../../../utils/leadForm';
import {
  canVisitLeadStep,
  validateAssessmentStep,
  validateContactedStep,
  validateConvertStep,
  validateLeadForm,
  validateProposalStep,
} from '../../../utils/leadFormValidation';
import { formatDateTimeUS } from '../../../utils/dateFormat';
import useSubmitLock from '../../../hooks/useSubmitLock';
import { toast } from 'react-toastify';

function assignedInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '—';
}

export default function LeadFormPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth.user);
  const isCreate = location.pathname.endsWith('/new');
  const isEdit = location.pathname.endsWith('/edit');
  const isDetail = Boolean(id) && !isEdit && !isCreate;
  const readOnly = isDetail;

  const [form, setForm] = useState(() => leadToForm(null));
  const [loading, setLoading] = useState(!isCreate);
  const [saving, runLocked] = useSubmitLock();
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeView, setActiveView] = useState('New Lead');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isCreate) {
      const empty = leadToForm(null);
      empty.assignedToName = authUser?.fullName || authUser?.name || authUser?.email || '';
      setForm(empty);
      setErrors({});
      setActiveView('New Lead');
      setLoading(false);
      dispatch(clearCurrentLead());
      return undefined;
    }

    if (!id) return undefined;

    let cancelled = false;
    setLoading(true);
    dispatch(fetchLead(id))
      .unwrap()
      .then((data) => {
        if (cancelled) return;
        const mapped = leadToForm(data);
        setForm(mapped);
        const preferredStep = location.state?.openStep;
        const nextView = preferredStep && canVisitLeadStep(mapped.stage || 'New Lead', preferredStep)
          ? preferredStep
          : (mapped.stage || 'New Lead');
        setActiveView(nextView);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        navigate(ROUTES.AGENCY_LEADS);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally omit authUser so create form is not reset on profile refresh.
    // location.state.openStep is read once when id/isCreate changes (post-create handoff).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, isCreate, navigate]);

  const onHeaderChange = (key, value) => {
    // Do not let UI controls jump the saved pipeline stage — only priority/notes/etc.
    if (key === 'stage') {
      setActiveView(value);
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFormDataChange = (section, valueOrUpdater, fieldPath) => {
    setForm((prev) => {
      const prevSection = prev.formData?.[section] || {};
      const nextSection = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(prevSection)
        : valueOrUpdater;
      return {
        ...prev,
        formData: {
          ...prev.formData,
          [section]: nextSection,
        },
      };
    });
    if (fieldPath) {
      setErrors((prev) => {
        if (!prev[fieldPath]) return prev;
        const next = { ...prev };
        delete next[fieldPath];
        return next;
      });
    } else if (section) {
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key.startsWith(`${section}.`)) delete next[key];
        });
        return next;
      });
    }
  };

  const applyStepErrors = (result, fallbackMessage) => {
    setErrors(result.errors || {});
    if (!result.valid) {
      toast.error(fallbackMessage || 'Please complete the required fields before continuing.');
      return false;
    }
    return true;
  };

  const persistLead = async (nextForm, nextStage) => {
    const payload = formToPayload({ ...nextForm, stage: nextStage });
    if (isCreate || !id) {
      const created = await dispatch(addLead(payload)).unwrap();
      return created;
    }
    return dispatch(updateLead({ id, payload })).unwrap();
  };

  const assessmentPayloadFromLead = (leadForm = form) => {
    const home = leadForm.formData?.homeAssessment || {};
    return {
      assessorName: home.assessorName || leadForm.assignedToName || authUser?.fullName || '',
      assessmentDate: home.visitDate || undefined,
    };
  };

  /** Create the linked assessment once — used when finishing proposal / converting the lead. */
  const ensureAssessmentFromLead = async (leadForm = form) => {
    if (!id || leadForm.assessmentId) return leadToForm(leadForm);
    const result = await dispatch(createAssessmentFromLead({
      id,
      payload: assessmentPayloadFromLead(leadForm),
    })).unwrap();
    const lead = result?.lead || result;
    return leadToForm(lead);
  };

  const handleSaveNewLead = () => {
    const result = validateLeadForm(form, { requireDob: true });
    if (!applyStepErrors(result, 'Complete the New Lead form before continuing.')) return;

    return runLocked(async () => {
      try {
        if (isCreate) {
          const created = await persistLead(form, 'Contacted');
          navigate(ROUTES.AGENCY_LEADS_EDIT.replace(':id', created.id), {
            replace: true,
            state: { openStep: 'Contacted' },
          });
          return;
        }
        const updated = await persistLead(form, form.stage === 'New Lead' ? 'Contacted' : form.stage);
        const mapped = leadToForm(updated);
        setForm(mapped);
        setErrors({});
        if (mapped.stage === 'Contacted' || form.stage === 'New Lead') {
          setActiveView('Contacted');
        }
      } catch {
        // toast in slice
      }
    });
  };

  const handleContactSubmit = (payload) => {
    if (isCreate || !id) {
      toast.error('Save the lead first, then log contact.');
      setActiveView('New Lead');
      return;
    }
    const contactPayload = {
      ...payload,
      nextLevel: payload.callStatus === 'move_next' ? 'Schedule Home Assessment' : payload.nextLevel,
    };
    if (contactPayload.callStatus === 'move_next' || contactPayload.callStatus === 'needs_time') {
      const result = validateContactedStep(contactPayload);
      if (!applyStepErrors(result, 'Complete the Contacted step before continuing.')) return;
    }

    return runLocked(async () => {
      try {
        const lead = await dispatch(logLeadContact({ id, payload: contactPayload })).unwrap();
        const mapped = leadToForm(lead);
        setForm(mapped);
        setErrors({});
        setActiveView(mapped.stage || 'Contacted');
      } catch {
        // toast
      }
    });
  };

  const handleScheduleSubmit = (payload) => {
    if (isCreate || !id) {
      toast.error('Save the lead first, then schedule the assessment.');
      return;
    }
    const draft = {
      ...form,
      formData: {
        ...form.formData,
        homeAssessment: {
          ...(form.formData?.homeAssessment || {}),
          ...payload,
        },
      },
    };
    const result = validateAssessmentStep(draft);
    if (!applyStepErrors(result, 'Complete the assessment schedule before continuing.')) return;

    return runLocked(async () => {
      try {
        // Schedule visit only — do not create an assessment here (still 2 steps ahead).
        const schedulePayload = { ...payload, createAssessmentAfter: false };
        const resultData = await dispatch(scheduleLeadAssessment({ id, payload: schedulePayload })).unwrap();
        const scheduledLead = resultData?.lead || resultData;
        const advanced = await dispatch(updateLead({
          id,
          payload: { stage: 'Proposal Sent' },
        })).unwrap();
        const mapped = leadToForm(advanced || scheduledLead);
        setForm(mapped);
        setErrors({});
        setActiveView('Proposal Sent');
      } catch {
        // toast
      }
    });
  };

  const handleProposalChange = (proposal) => {
    setForm((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        proposal: {
          ...(prev.formData?.proposal || {}),
          ...proposal,
        },
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.sentDate;
      delete next.notes;
      delete next.assessmentId;
      return next;
    });
  };

  const handleContinueFromProposal = () => {
    if (!id) return;
    const draft = {
      ...form,
      formData: {
        ...form.formData,
        proposal: {
          ...(form.formData?.proposal || {}),
        },
      },
    };
    const result = validateProposalStep(draft);
    if (!applyStepErrors(result, 'Complete proposal details before continuing.')) return;

    return runLocked(async () => {
      try {
        const updated = await persistLead(draft, 'Proposal Sent');
        const mapped = leadToForm(updated);
        setForm(mapped);
        setErrors({});
        setActiveView('Converted');
      } catch {
        // toast in slice
      }
    });
  };

  const handleConvert = () => {
    if (!id) return;
    const result = validateConvertStep(form);
    if (!applyStepErrors(result, 'Complete proposal details before converting.')) return;

    return runLocked(async () => {
      try {
        await persistLead(form, 'Proposal Sent');
        // Convert first so the client record exists, then create the assessment from it.
        const convertResult = await dispatch(convertLead(id)).unwrap();
        let mapped = leadToForm(convertResult?.lead || convertResult);
        mapped = await ensureAssessmentFromLead(mapped);
        setForm(mapped);
        setErrors({});
        setActiveView('Converted');
      } catch {
        // toast in slice
      }
    });
  };

  const handleSelectStep = (step) => {
    if (!canVisitLeadStep(form.stage || 'New Lead', step) && !isCreate) {
      toast.info('Complete the current step before opening a later step.');
      return;
    }
    setActiveView(step);
    setErrors({});
  };

  const fullName = joinLeadName(
    form.formData?.basicInfo?.firstName,
    form.formData?.basicInfo?.lastName,
  ) || form.formData?.basicInfo?.fullName || '';
  const initials = (fullName || 'LD')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'LD';

  const hot = form.priority === 'Hot' || form.priority === 'High';
  const title = isCreate ? 'Create Lead' : isEdit ? 'Edit Lead' : 'Lead Details';
  const disqualified = Boolean(form.formData?.disqualified || form.formData?.contactLog?.disqualified);
  const hasAssessment = Boolean(form.assessmentId);

  const subtitle = useMemo(() => {
    const care = form.formData?.careSummary || {};
    const recipient = joinLeadName(
      form.formData?.careRecipient?.firstName,
      form.formData?.careRecipient?.lastName,
    ) || form.formData?.careRecipient?.name;
    const careType = care.careTypeRequested || 'Home Care Support';
    const forWhom = care.careRequiredFor || '';
    if (!fullName && isCreate) return 'Capture a new inquiry before assessment';
    if (recipient) return `Seeking ${careType} for ${recipient}`;
    if (forWhom) return `Seeking ${careType} for ${forWhom}`;
    return `Seeking ${careType}`;
  }, [form.formData, fullName, isCreate]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading lead…
      </div>
    );
  }

  const btnGhost =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50';
  const btnPrimary =
    'inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50';

  const leadForForms = { ...form, id, formData: form.formData, assessmentId: form.assessmentId };

  const stepReadOnly = readOnly || disqualified || form.stage === 'Converted';
  let stepBody = null;

  if (activeView === 'Contacted') {
    stepBody = (
      <LeadContactedForm
        lead={leadForForms}
        authUser={authUser}
        onSubmit={handleContactSubmit}
        submitting={saving}
        readOnly={stepReadOnly}
      />
    );
  } else if (activeView === 'Assessment Scheduled') {
    stepBody = (
      <ScheduleHomeAssessmentForm
        lead={leadForForms}
        authUser={authUser}
        onSubmit={handleScheduleSubmit}
        submitting={saving}
        readOnly={stepReadOnly}
        errors={errors}
      />
    );
  } else if (activeView === 'Proposal Sent') {
    stepBody = (
      <LeadProposalStep
        form={leadForForms}
        onChange={handleProposalChange}
        onContinue={handleContinueFromProposal}
        saving={saving}
        readOnly={stepReadOnly}
        errors={errors}
      />
    );
  } else if (activeView === 'Converted') {
    stepBody = (
      <LeadConvertedStep
        form={leadForForms}
        onConvert={handleConvert}
        saving={saving}
        readOnly={stepReadOnly}
      />
    );
  } else {
    // New Lead intake
    stepBody = (
      <>
        <LeadFormSections
          form={form}
          onFormDataChange={onFormDataChange}
          onHeaderChange={onHeaderChange}
          readOnly={stepReadOnly}
          errors={errors}
        />
        {Object.keys(errors).length > 0 && !stepReadOnly ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Please fix the highlighted fields before continuing to the next step.
          </div>
        ) : null}
        {!stepReadOnly ? (
          <div className="flex justify-end gap-2">
            <Link to={ROUTES.AGENCY_LEADS} className={btnGhost}>
              Cancel
            </Link>
            <SubmitButton
              loading={saving}
              onClick={handleSaveNewLead}
              icon={Save}
              className={btnPrimary}
            >
              {form.stage === 'New Lead' || isCreate ? 'Save & Continue' : 'Save Lead'}
            </SubmitButton>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="-mx-1 space-y-4 pb-10 sm:-mx-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <nav className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-500">
            <Link to={ROUTES.AGENCY_LEADS} className="hover:text-primary">Leads</Link>
            <span className="text-slate-300">›</span>
            <span className="text-slate-700">{title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {hot && !disqualified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200/80">
                <Flame size={12} className="text-orange-500" /> Hot Lead
              </span>
            ) : null}
            {disqualified ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                Disqualified
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={ROUTES.AGENCY_LEADS} className={btnGhost}>
            <ArrowLeft size={15} /> Back to List
          </Link>

          {isDetail ? (
            <>
              <Link to={ROUTES.AGENCY_LEADS_EDIT.replace(':id', id)} className={btnGhost}>
                <Pencil size={15} /> Edit
              </Link>
              {hasAssessment ? (
                <Link
                  to={ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', form.assessmentId)}
                  className={btnPrimary}
                >
                  <ClipboardPlus size={15} /> Open Assessment
                </Link>
              ) : null}
              <div className="relative">
                <button type="button" onClick={() => setMoreOpen((v) => !v)} className={btnGhost}>
                  More <ChevronDown size={14} />
                </button>
                {moreOpen ? (
                  <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => { setMoreOpen(false); handleSelectStep('Contacted'); }}
                    >
                      Contacted form
                    </button>
                    <button
                      type="button"
                      className="flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => { setMoreOpen(false); handleSelectStep('Assessment Scheduled'); }}
                    >
                      Schedule assessment
                    </button>
                    {form.clientId ? (
                      <Link
                        to={ROUTES.AGENCY_CLIENTS_EDIT.replace(':id', form.clientId)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setMoreOpen(false)}
                      >
                        <MoreHorizontal size={14} /> View Client
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          ) : (isCreate || activeView === 'New Lead') ? (
            <SubmitButton
              loading={saving}
              onClick={handleSaveNewLead}
              icon={Save}
              className={btnPrimary}
            >
              Save & Continue
            </SubmitButton>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xl font-bold text-white shadow-md shadow-primary/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {fullName || (isCreate ? 'New Lead' : 'Untitled Lead')}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 sm:text-sm">
              <span>
                <span className="font-medium text-slate-400">Lead ID:</span>{' '}
                <span className="font-semibold text-slate-700">{form.leadCode || 'Pending'}</span>
              </span>
              <span>
                <span className="font-medium text-slate-400">Created On:</span>{' '}
                <span className="font-semibold text-slate-700">
                  {isCreate ? 'Not saved yet' : formatDateTimeUS(form.createdAt)}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-medium text-slate-400">Assigned To:</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {assignedInitials(form.assignedToName)}
                  </span>
                  {form.assignedToName || 'Unassigned'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Always visible status controls */}
      <LeadStatusPanel
        form={form}
        activeView={activeView}
        onViewChange={handleSelectStep}
        onHeaderChange={onHeaderChange}
        readOnly={false}
      />

      <LeadStageStepper
        stage={form.stage}
        activeView={activeView}
        onSelect={handleSelectStep}
      />

      <div className="space-y-4">
        {stepBody}
      </div>
    </div>
  );
}
