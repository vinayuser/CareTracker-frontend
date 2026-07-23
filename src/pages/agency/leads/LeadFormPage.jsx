import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, Flame, MoreHorizontal, Pencil,
  Save, UserCheck, ClipboardPlus,
} from 'lucide-react';
import LeadFormSections from '../../../components/agency/leads/LeadFormSections';
import LeadStageStepper from '../../../components/agency/leads/LeadStageStepper';
import LeadStatusPanel from '../../../components/agency/leads/LeadStatusPanel';
import LeadContactedForm from '../../../components/agency/leads/LeadContactedForm';
import ScheduleHomeAssessmentForm from '../../../components/agency/leads/ScheduleHomeAssessmentForm';
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
import { formToPayload, leadToForm } from '../../../utils/leadForm';
import { formatDateTimeUS } from '../../../utils/dateFormat';
import { confirmAlert } from '../../../utils/swal';

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
  const { current } = useSelector((s) => s.leads);

  const isCreate = location.pathname.endsWith('/new');
  const isEdit = location.pathname.endsWith('/edit');
  const isDetail = Boolean(id) && !isEdit && !isCreate;
  const readOnly = isDetail;

  const [form, setForm] = useState(() => leadToForm(null));
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeView, setActiveView] = useState('New Lead');

  useEffect(() => {
    if (isCreate) {
      const empty = leadToForm(null);
      empty.assignedToName = authUser?.fullName || authUser?.name || authUser?.email || '';
      setForm(empty);
      setActiveView('New Lead');
      setLoading(false);
      dispatch(clearCurrentLead());
      return undefined;
    }
    if (!id) return undefined;
    setLoading(true);
    dispatch(fetchLead(id))
      .unwrap()
      .then((data) => {
        const mapped = leadToForm(data);
        setForm(mapped);
        setActiveView(location.state?.activeView || mapped.stage || 'New Lead');
      })
      .catch(() => navigate(ROUTES.AGENCY_LEADS))
      .finally(() => setLoading(false));
    return undefined;
  }, [authUser, dispatch, id, isCreate, navigate, location.state]);

  useEffect(() => {
    if (current && id && current.id === id && !isCreate) {
      setForm(leadToForm(current));
    }
  }, [current, id, isCreate]);

  const onHeaderChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'stage') setActiveView(value);
  };

  const onFormDataChange = (section, value) => {
    setForm((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [section]: value,
      },
    }));
  };

  const validate = () => {
    const basic = form.formData?.basicInfo || {};
    if (!String(basic.fullName || '').trim()) {
      window.alert('Full Name is required.');
      return false;
    }
    if (!String(basic.phone || '').trim()) {
      window.alert('Phone Number is required.');
      return false;
    }
    if (!String(basic.inquiryDate || '').trim()) {
      window.alert('Inquiry Date is required.');
      return false;
    }
    if (!String(basic.zipLocation || '').trim()) {
      window.alert('Zip / Location is required.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = formToPayload(form);
    try {
      if (isCreate) {
        const created = await dispatch(addLead(payload)).unwrap();
        navigate(ROUTES.AGENCY_LEADS_DETAIL.replace(':id', created.id), {
          state: { activeView: 'Contacted' },
        });
      } else {
        await dispatch(updateLead({ id, payload })).unwrap();
        if (isEdit) {
          navigate(ROUTES.AGENCY_LEADS_DETAIL.replace(':id', id), {
            state: { activeView },
          });
        }
      }
    } catch {
      // toast in slice
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (isCreate) {
      window.alert('Save the lead before converting to a client.');
      return;
    }
    const ok = await confirmAlert({
      title: 'Convert to client?',
      text: 'Creates a client record from this lead so you can continue with assessment.',
      confirmText: 'Convert',
    });
    if (!ok) return;
    setSaving(true);
    try {
      if (isEdit) {
        await dispatch(updateLead({ id, payload: formToPayload(form) })).unwrap();
      }
      const result = await dispatch(convertLead(id)).unwrap();
      const lead = result?.lead || result;
      setForm(leadToForm(lead));
      setActiveView('Converted');
      navigate(ROUTES.AGENCY_LEADS_DETAIL.replace(':id', id));
    } catch {
      // toast
    } finally {
      setSaving(false);
    }
  };

  const handleContactSubmit = async (payload) => {
    if (isCreate || !id) {
      window.alert('Save the lead first, then log contact.');
      setActiveView('New Lead');
      return;
    }
    setSaving(true);
    try {
      const lead = await dispatch(logLeadContact({ id, payload })).unwrap();
      const mapped = leadToForm(lead);
      setForm(mapped);
      if (payload.callStatus === 'move_next' && payload.nextLevel === 'Schedule Home Assessment') {
        setActiveView('Assessment Scheduled');
      } else {
        setActiveView(mapped.stage || 'Contacted');
      }
    } catch {
      // toast
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSubmit = async (payload) => {
    if (isCreate || !id) {
      window.alert('Save the lead first, then schedule the assessment.');
      return;
    }
    setSaving(true);
    try {
      const result = await dispatch(scheduleLeadAssessment({ id, payload })).unwrap();
      const lead = result?.lead || result;
      setForm(leadToForm(lead));
      setActiveView('Assessment Scheduled');
      if (result?.assessment?.id) {
        navigate(ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', result.assessment.id));
      }
    } catch {
      // toast
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAssessment = async () => {
    setSaving(true);
    try {
      const result = await dispatch(createAssessmentFromLead({
        id,
        payload: {
          assessorName: form.assignedToName || authUser?.fullName || '',
        },
      })).unwrap();
      const lead = result?.lead || result;
      setForm(leadToForm(lead));
      if (result?.assessment?.id) {
        navigate(ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', result.assessment.id));
      }
    } catch {
      // toast
    } finally {
      setSaving(false);
    }
  };

  const handleSelectStep = (step) => {
    setActiveView(step);
    // Keep status dropdown in sync when navigating steps
    setForm((prev) => ({ ...prev, stage: step }));
  };

  const fullName = form.formData?.basicInfo?.fullName || '';
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
    const recipient = form.formData?.careRecipient?.name;
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
  const btnSuccess =
    'inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50';

  const leadForForms = { ...form, id, formData: form.formData, assessmentId: form.assessmentId };

  let stepBody = null;
  if (activeView === 'Contacted') {
    stepBody = (
      <LeadContactedForm
        lead={leadForForms}
        authUser={authUser}
        onSubmit={handleContactSubmit}
        submitting={saving}
        readOnly={disqualified}
      />
    );
  } else if (activeView === 'Assessment Scheduled') {
    stepBody = (
      <div className="space-y-4">
        <ScheduleHomeAssessmentForm
          lead={leadForForms}
          authUser={authUser}
          onSubmit={handleScheduleSubmit}
          submitting={saving}
          readOnly={disqualified || form.stage === 'Converted'}
        />
        {hasAssessment ? (
          <div className="flex justify-end">
            <Link
              to={ROUTES.AGENCY_ASSESSMENTS_EDIT.replace(':id', form.assessmentId)}
              className={btnPrimary}
            >
              <ClipboardPlus size={15} /> Open Assessment
            </Link>
          </div>
        ) : null}
      </div>
    );
  } else {
    // New Lead, Proposal Sent, Converted → overview form
    stepBody = (
      <>
        <LeadFormSections
          form={form}
          onFormDataChange={onFormDataChange}
          onHeaderChange={onHeaderChange}
          readOnly={readOnly}
          onSaveNote={handleSave}
        />
        {!readOnly ? (
          <div className="flex justify-end gap-2">
            <Link to={ROUTES.AGENCY_LEADS} className={btnGhost}>
              Cancel
            </Link>
            <button type="button" disabled={saving} onClick={handleSave} className={btnPrimary}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Lead'}
            </button>
          </div>
        ) : null}
        {activeView === 'Proposal Sent' && !hasAssessment && id && !isCreate ? (
          <div className="flex justify-end">
            <button type="button" disabled={saving} onClick={handleCreateAssessment} className={btnPrimary}>
              <ClipboardPlus size={15} /> Create Assessment
            </button>
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
              {form.stage !== 'Converted' && !disqualified ? (
                <button type="button" disabled={saving} onClick={handleConvert} className={btnSuccess}>
                  <UserCheck size={15} /> Convert to Client
                </button>
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
                      onClick={() => { setMoreOpen(false); setActiveView('Contacted'); }}
                    >
                      Contacted form
                    </button>
                    <button
                      type="button"
                      className="flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => { setMoreOpen(false); setActiveView('Assessment Scheduled'); }}
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
          ) : (
            <>
              <button type="button" disabled={saving} onClick={handleSave} className={btnPrimary}>
                <Save size={15} /> {saving ? 'Saving…' : 'Save Lead'}
              </button>
              {!isCreate && form.stage !== 'Converted' ? (
                <button type="button" disabled={saving} onClick={handleConvert} className={btnSuccess}>
                  <UserCheck size={15} /> Convert to Client
                </button>
              ) : null}
            </>
          )}
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
        onHeaderChange={onHeaderChange}
        readOnly={false}
        preferredStartDate={form.formData?.basicInfo?.preferredStartDate}
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
