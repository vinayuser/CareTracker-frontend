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
  applyClientIdentityToForm110,
  assessmentToForm,
  buildEmptyFormData,
  clientRecordToForm110Fields,
  joinClientName,
  todayIso,
} from '../../../utils/assessmentForm';
import {
  PACKET_MAX_INPUT,
  PACKET_MAX_TEXTAREA,
} from '../../../components/agency/assessments/packet/PacketFields';
import {
  ASSESSMENT_PACKET_FORMS,
  getPacketFormMeta,
  getPacketProgress,
  isPacketFormEditable,
  mergePacketForms,
  prefillPacketFormFromClient,
  syncClinicalFromPacket,
} from '../../../utils/assessmentPacket';
import { externalizeDataImages } from '../../../utils/assessmentSignatures';
import { validateForm110 } from '../../../utils/form110Validation';
import { ROUTES } from '../../../routes/routes';
import useSubmitLock from '../../../hooks/useSubmitLock';
import useScrollToTopOnChange from '../../../hooks/useScrollToTopOnChange';
import {
  fillAssessmentPacketPdf,
  openPdfBytes,
} from '../../../utils/assessmentPacketPdfFill';
import { getAgencyBranding } from '../../../utils/agencyBranding';
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
  forms['324'] = {
    ...forms['324'],
    clientName,
    client: {
      ...(forms['324'].client || {}),
      printedName: clientName,
      date: todayIso(),
    },
  };

  const withLead = syncClinicalFromPacket({
    ...base.formData,
    forms,
    leadMeta: prefill.leadMeta || {
      leadId: prefill.leadId || null,
      leadCode: prefill.leadCode || '',
    },
  });

  return {
    ...base,
    formData: applyClientIdentityToForm110(withLead, null, todayIso(), ''),
  };
}

const FORM110_LOCKED_KEYS = new Set([
  'firstName', 'lastName', 'clientName', 'dob', 'sex',
  'address', 'phone', 'cellPhone', 'email', 'city', 'state', 'zip',
]);

function clampPacketString(value, max) {
  if (typeof value !== 'string') return value;
  return value.length > max ? value.slice(0, max) : value;
}

function isSignatureFieldKey(key = '') {
  return /signature|photo|logo|path|url/i.test(String(key));
}

function isSignatureLikeValue(value) {
  if (typeof value !== 'string' || !value) return false;
  return value.startsWith('data:image')
    || value.startsWith('/uploads/')
    || value.startsWith('/api/uploads/')
    || /^https?:\/\//i.test(value);
}

/** Radio / select fields store full option labels — never truncate (many ADL labels exceed 40 chars). */
const PACKET_ENUM_KEYS = new Set([
  'eating', 'bathing', 'toileting', 'dressing', 'ambulation', 'livesWith',
  'riskLevel', 'advancedDirective', 'billingCycle', 'pertinentInfoYesNo',
  'priority', 'priorityLevel', 'codeStatus', 'sex',
]);

function isEnumFieldKey(key = '') {
  return PACKET_ENUM_KEYS.has(String(key));
}

/** Enforce max lengths on packet form patches (40 input / 100 textarea-ish). Never truncate signatures/uploads/enum labels. */
function clampPacketPatch(patch = {}, textareaKeys = []) {
  const textArea = new Set(textareaKeys);
  const out = {};
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (isSignatureFieldKey(key) || isSignatureLikeValue(value) || isEnumFieldKey(key)) {
        out[key] = value;
        return;
      }
      out[key] = clampPacketString(value, textArea.has(key) ? PACKET_MAX_TEXTAREA : PACKET_MAX_INPUT);
      return;
    }
    if (Array.isArray(value)) {
      // Checkbox rows store option labels; do not truncate (e.g. systems-review strings).
      out[key] = value.map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return clampPacketPatch(item, textareaKeys);
        }
        return item;
      });
      return;
    }
    if (value && typeof value === 'object') {
      out[key] = clampPacketPatch(value, textareaKeys);
      return;
    }
    out[key] = value;
  });
  return out;
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
  const agencyLogo = authUser?.agencyLogo ?? '';
  const agencyBranding = getAgencyBranding(authUser);
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

  useScrollToTopOnChange(activeCode);

  // Only reload when the assessment id / create mode changes — not when authUser object identity churns
  // (that was wiping in-progress signatures on Form 110).
  const authUserKey = authUser?.id || authUser?.email || '';
  useEffect(() => {
    const defaultAssessor = authUser?.fullName || authUser?.name || authUser?.email || '';
    if (!isEdit) {
      const base = applyLeadPrefill(location.state?.leadPrefill);
      const assessorName = base.assessorName || defaultAssessor;
      setForm({
        ...base,
        assessorName,
        formData: applyClientIdentityToForm110(
          base.formData,
          null,
          base.assessmentDate || todayIso(),
          assessorName,
        ),
      });
      setActiveCode(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    dispatch(fetchAssessment(id)).unwrap()
      .then((data) => {
        if (cancelled) return;
        const mapped = assessmentToForm(data);
        const assessorName = mapped.assessorName || defaultAssessor;
        setForm({
          ...mapped,
          assessorName,
          formData: applyClientIdentityToForm110(
            mapped.formData,
            mapped.client,
            mapped.assessmentDate,
            assessorName,
          ),
        });
        setAssessmentCode(data.assessmentCode || '');
        setActiveCode(null);
      })
      .catch(() => {
        if (!cancelled) navigate(ROUTES.AGENCY_ASSESSMENTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authUserKey is the stable identity for defaults
  }, [dispatch, id, isEdit, location.state, navigate, authUserKey]);

  const onPacketChange = (patch) => {
    if (!activeCode) return;
    const textareaKeys = [
      'notes', 'comments', 'adviceGiven', 'otherProblemsList', 'pertinentInfoDetails',
      'coordinatorNotes', 'other', 'medicalRecordsFrom',
      'hospitalAdmissions', 'surgeries', 'ongoingProblems',
      'pcpAddress', 'pharmacyAddress', 'address',
    ];
    let safePatch = clampPacketPatch(patch, textareaKeys);
    // Never allow editing client identity on Form 110 (or mirrored quote helpers).
    if (activeCode === '110') {
      safePatch = { ...safePatch };
      FORM110_LOCKED_KEYS.forEach((key) => {
        delete safePatch[key];
      });
    }
    setForm((prev) => {
      const nextForms = {
        ...prev.formData.forms,
        [activeCode]: {
          ...(prev.formData.forms?.[activeCode] || {}),
          ...safePatch,
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
        Object.keys(safePatch || {}).forEach((key) => {
          if (n[key]) delete n[key];
        });
        if (safePatch?.allergicReactions === 'NO') delete n.allergies;
        if (safePatch?.allergies !== undefined) delete n.allergies;
        return n;
      });
    }
  };

  const runValidateForm110 = () => {
    const { valid, errors: next } = validateForm110(form.formData.forms?.['110'] || {});
    setErrors(next);
    return valid;
  };

  const handleSaveForm = () => runLocked(async () => {
    if (!activeCode) return;
    if (!isPacketFormEditable(activeCode)) {
      toast.info('This form is not available yet');
      return;
    }
    if (activeCode === '110' && !runValidateForm110()) return;

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
    try {
      nextForm.formData = await externalizeDataImages(nextForm.formData);
      if (typeof nextForm.assessorPhoto === 'string' && nextForm.assessorPhoto.startsWith('data:image/')) {
        nextForm.assessorPhoto = await externalizeDataImages(nextForm.assessorPhoto);
      }
    } catch {
      toast.error('Could not upload signatures. Save again once the signature upload finishes.');
      return;
    }
    setForm(nextForm);

    const payload = buildPayload(nextForm);
    const successMessage = `Form ${activeCode} saved`;
    try {
      if (isEdit) {
        await dispatch(updateAssessment({ id, payload, successMessage })).unwrap();
        setActiveCode(null);
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
      const bytes = await fillAssessmentPacketPdf(code, forms[code] || {}, {
        agencyBranding,
        assessmentDate: form.assessmentDate,
      });
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

        {Object.keys(errors).length > 0 ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Please fix the highlighted fields before saving.
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <AssessmentPacketFormView
            code={activeCode}
            data={form.formData.forms?.[activeCode] || {}}
            onChange={onPacketChange}
            errors={errors}
            shared={{
              assessmentDate: form.assessmentDate,
              assessorName: form.assessorName,
              agencyName,
              agencyLogo,
              agencyBranding,
              clientId: form.clientId,
              clientSnapshot: clientRecordToForm110Fields(form.client, form.formData),
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
          setForm((prev) => {
            const withClient = applyClientIdentityToForm110(
              prev.formData,
              prev.client,
              prev.assessmentDate,
              prev.assessorName,
            );
            const forms = withClient.forms || {};
            const filled = prefillPacketFormFromClient(code, forms, {
              formData: withClient,
              assessmentDate: prev.assessmentDate,
              assessorName: prev.assessorName,
            });
            return {
              ...prev,
              formData: syncClinicalFromPacket({
                ...withClient,
                forms: { ...forms, [code]: filled },
              }),
            };
          });
          setActiveCode(code);
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
