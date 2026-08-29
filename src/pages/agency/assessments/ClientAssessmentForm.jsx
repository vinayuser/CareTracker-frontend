import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ClipboardList, Download, Printer, Save } from 'lucide-react';
import AssessmentPacketFormList from '../../../components/agency/assessments/AssessmentPacketFormList';
import AssessmentFormsDownloadModal from '../../../components/agency/assessments/AssessmentFormsDownloadModal';
import { AssessmentPacketFormView } from '../../../components/agency/assessments/packet/AssessmentPacketFormViews';
import SubmitButton from '../../../components/ui/SubmitButton';
import { addAssessment, fetchAssessment, updateAssessment } from '../../../redux/slices/assessmentsSlice';
import {
  EMPTY_ASSESSMENT,
  assessmentToForm,
  buildEmptyFormData,
  joinClientName,
  todayIso,
} from '../../../utils/assessmentForm';
import {
  ASSESSMENT_PACKET_FORMS,
  getPacketFormMeta,
  getPacketProgress,
  isPacketFormEditable,
  mergePacketForms,
  syncClinicalFromPacket,
} from '../../../utils/assessmentPacket';
import { ROUTES } from '../../../routes/routes';
import useSubmitLock from '../../../hooks/useSubmitLock';
import {
  fillAssessmentPacketPdf,
  openPdfBytes,
} from '../../../utils/assessmentPacketPdfFill';
import { toast } from 'react-toastify';

function applyLeadPrefill(prefill) {
  const base = {
    ...EMPTY_ASSESSMENT,
    assessmentDate: todayIso(),
    formData: buildEmptyFormData(),
  };
  if (!prefill) return base;
  const firstName = prefill.firstName || '';
  const lastName = prefill.lastName || '';
  const clientName = joinClientName(firstName, lastName);
  const forms = { ...base.formData.forms };
  forms['110'] = {
    ...forms['110'],
    firstName,
    lastName,
    clientName,
    date: todayIso(),
    phone: prefill.clientPhone || '',
    cellPhone: prefill.clientPhone || '',
    email: prefill.clientEmail || '',
    primaryCarePhysician: prefill.physicianName || '',
    diagnoses: [prefill.primaryDiagnosis || '', ...Array(9).fill('')].slice(0, 10),
    pertinentInfoDetails: prefill.careNotes || '',
    allergicReactions: prefill.allergies ? 'YES' : '',
    allergies: prefill.allergies
      ? [{ allergy: prefill.allergies, reaction: '' }, { allergy: '', reaction: '' }, { allergy: '', reaction: '' }]
      : forms['110'].allergies,
  };
  forms['400'] = { ...forms['400'], clientName, dob: '' };
  forms['7000'] = { ...forms['7000'], clientName, date: todayIso() };
  forms['7050'] = { ...forms['7050'], clientName };
  forms['1009'] = { ...forms['1009'], clientName };
  forms['1081'] = { ...forms['1081'], clientName };
  forms['1083'] = { ...forms['1083'], firstName, lastName };
  forms['790'] = { ...forms['790'], clientName };

  return {
    ...base,
    formData: syncClinicalFromPacket({
      ...base.formData,
      forms,
      leadMeta: prefill.leadMeta || {
        leadId: prefill.leadId || null,
        leadCode: prefill.leadCode || '',
      },
    }),
  };
}

function buildPayload(form) {
  const synced = syncClinicalFromPacket(form.formData);
  const ci = synced.clientInfo || {};
  return {
    assessorName: form.assessorName,
    assessorTitle: form.assessorTitle,
    assessorPhoto: form.assessorPhoto,
    assessmentDate: form.assessmentDate,
    assessmentTypes: form.assessmentTypes,
    formData: {
      ...synced,
      clientInfo: {
        ...ci,
        firstName: String(ci.firstName || '').trim(),
        lastName: String(ci.lastName || '').trim(),
        clientName: joinClientName(ci.firstName, ci.lastName) || ci.clientName,
      },
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
  const [activeCode, setActiveCode] = useState(null);
  const [form, setForm] = useState(EMPTY_ASSESSMENT);
  const [assessmentCode, setAssessmentCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, runLocked] = useSubmitLock();
  const [printingCode, setPrintingCode] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const activeMeta = useMemo(() => (activeCode ? getPacketFormMeta(activeCode) : null), [activeCode]);
  const progress = useMemo(() => getPacketProgress(form.formData), [form.formData]);

  useEffect(() => {
    if (!isEdit) {
      setForm(applyLeadPrefill(location.state?.leadPrefill));
      setActiveCode(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    dispatch(fetchAssessment(id)).unwrap()
      .then((data) => {
        setForm(assessmentToForm(data));
        setAssessmentCode(data.assessmentCode || '');
        setActiveCode(null);
      })
      .catch(() => navigate(ROUTES.AGENCY_ASSESSMENTS))
      .finally(() => setLoading(false));
  }, [dispatch, id, isEdit, location.state, navigate]);

  const onPacketChange = (patch) => {
    if (!activeCode) return;
    setForm((prev) => {
      const nextForms = {
        ...prev.formData.forms,
        [activeCode]: {
          ...(prev.formData.forms?.[activeCode] || {}),
          ...patch,
        },
      };
      return {
        ...prev,
        formData: syncClinicalFromPacket({
          ...prev.formData,
          forms: nextForms,
        }),
      };
    });
    if (activeCode === '110') {
      setErrors((e) => {
        const n = { ...e };
        if (patch?.firstName !== undefined || patch?.clientName !== undefined) delete n.firstName;
        if (patch?.lastName !== undefined) delete n.lastName;
        return n;
      });
    }
  };

  const validateForm110 = () => {
    const f110 = form.formData.forms?.['110'] || {};
    const first = String(f110.firstName || '').trim() || String(f110.clientName || '').trim().split(/\s+/)[0];
    const last = String(f110.lastName || '').trim()
      || String(f110.clientName || '').trim().split(/\s+/).slice(1).join(' ');
    const e = {};
    if (!first) e.firstName = 'Client first name is required on Physical Assessment';
    if (!last && !f110.clientName) e.lastName = 'Client last name is required on Physical Assessment';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSaveForm = () => runLocked(async () => {
    if (!activeCode) return;
    if (!isPacketFormEditable(activeCode)) {
      toast.info('This form is not available yet');
      return;
    }
    if (activeCode === '110' && !validateForm110()) return;

    const now = new Date().toISOString();
    const nextForm = {
      ...form,
      formData: {
        ...form.formData,
        formMeta: {
          ...(form.formData.formMeta || {}),
          [activeCode]: { status: 'saved', savedAt: now },
        },
      },
    };
    // Keep clinical sync after marking status
    nextForm.formData = syncClinicalFromPacket(nextForm.formData);
    setForm(nextForm);

    const payload = buildPayload(nextForm);
    const successMessage = `Form ${activeCode} saved`;
    try {
      if (isEdit) {
        await dispatch(updateAssessment({ id, payload, successMessage })).unwrap();
        setActiveCode(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const created = await dispatch(addAssessment({ ...payload, successMessage })).unwrap();
      const newId = created.id || created._id;
      if (!newId) throw new Error('Assessment created without id');
      navigate(`/agency/assessments/${newId}/edit`, { replace: true });
    } catch { /* toast from slice */ }
  });

  const handlePrintForm = async (code) => {
    if (!isPacketFormEditable(code)) {
      toast.info('This form is not available yet');
      return;
    }
    setPrintingCode(code);
    try {
      const forms = mergePacketForms(form.formData?.forms || {});
      const bytes = await fillAssessmentPacketPdf(code, forms[code] || {});
      openPdfBytes(bytes, `assessment-form-${code}.pdf`);
    } catch (err) {
      toast.error(err?.message || `Could not print form ${code}`);
    } finally {
      setPrintingCode(null);
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading assessment...</div>;
  }

  const clientLabel = form.formData?.clientInfo?.clientName
    || joinClientName(form.formData?.forms?.['110']?.firstName, form.formData?.forms?.['110']?.lastName)
    || 'New client';

  /* ── Single form editor ── */
  if (activeCode && activeMeta) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 pb-10">
        <button
          type="button"
          onClick={() => setActiveCode(null)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to form list
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Form {activeCode}</p>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{activeMeta.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{clientLabel}</p>
          </div>
          <button
            type="button"
            disabled={printingCode === activeCode}
            onClick={() => handlePrintForm(activeCode)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            <Printer size={16} /> {printingCode === activeCode ? 'Preparing…' : 'Print form'}
          </button>
        </div>

        {(errors.firstName || errors.lastName) ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errors.firstName || errors.lastName}
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <AssessmentPacketFormView
            code={activeCode}
            data={form.formData.forms?.[activeCode] || {}}
            onChange={onPacketChange}
            shared={{
              assessmentDate: form.assessmentDate,
              assessorName: form.assessorName,
              agencyName,
            }}
          />

          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => setActiveCode(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Cancel
            </button>
            <SubmitButton
              loading={submitting}
              onClick={handleSaveForm}
              icon={Save}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              Save this form
            </SubmitButton>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form list (default) ── */
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      <Link to={ROUTES.AGENCY_ASSESSMENTS} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {isEdit ? 'Assessment Packet' : 'New Assessment Packet'}
            </h1>
            <p className="text-sm text-gray-500">{clientLabel}</p>
            <p className="mt-1 text-xs text-gray-500">
              Open each form to fill and save. Use download all to get every filled official PDF.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDownloadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-primary/30 hover:text-primary"
        >
          <Download size={16} />
          Download all forms
        </button>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/5 to-white px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-gray-800">
            {progress.saved} of {progress.total} required form{progress.total === 1 ? '' : 's'} saved
          </span>
          <span className="text-xs text-gray-500">
            {progress.packetTotal} forms in packet
            {progress.started > 0 ? ` · ${progress.started} in progress` : ''}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-primary/10">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((progress.saved / Math.max(progress.total, 1)) * 100)}%` }}
          />
        </div>
      </div>

      <AssessmentPacketFormList
        formData={form.formData}
        printingCode={printingCode}
        onPrintForm={handlePrintForm}
        onOpenForm={(code) => {
          if (!isPacketFormEditable(code)) {
            toast.info('This form will be enabled later');
            return;
          }
          setErrors({});
          setActiveCode(code);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          {ASSESSMENT_PACKET_FORMS.length} forms in packet
        </p>
        <Link
          to={ROUTES.AGENCY_ASSESSMENTS}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover"
        >
          Done
        </Link>
      </div>

      <AssessmentFormsDownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        assessment={{
          id: isEdit ? id : undefined,
          assessmentCode,
          clientName: clientLabel,
          formData: form.formData,
        }}
      />
    </div>
  );
}
