import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { ROUTES } from '../../../routes/routes';
import Drawer from '../../ui/Drawer';
import DigitalSignaturePad from '../../ui/DigitalSignaturePad';

const inputClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';
const labelClass = 'mb-1 block text-xs font-medium text-gray-600';

const DEFAULT_SKILLS = [
  'Communication', 'Empathy', 'Professionalism', 'Attendance & Reliability', 'Language Skills',
  'Personal Hygiene', 'Bathing & Grooming', 'Patient Transfer', 'Feeding Assistance',
  'Toileting & Incontinence', 'Medication Reminder', 'Vital Signs', 'Dementia Care',
  'Palliative Care', 'Infection Control', 'Fall Prevention', 'Emergency Response',
  'Documentation', 'Wheelchair Handling', 'Safe Lifting', 'Patient Positioning', 'PPE Usage',
  'Medical Equipment', 'Family Interaction', 'Behaviour', 'Patience', 'Problem Solving',
  'Time Management', 'Client Handling', 'Overall Suitability',
];

const DEFAULT_RECS = [
  { value: 'strong_hire', label: 'Strong Hire' },
  { value: 'hire', label: 'Hire' },
  { value: 'hold', label: 'Hold' },
  { value: 'reject', label: 'Reject' },
];

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function mergeForm(base, saved) {
  if (!saved) return base;
  const legacyRound = saved.roundRemarks && typeof saved.roundRemarks === 'object'
    ? Object.values(saved.roundRemarks).find((r) => r?.remarks || r?.signature)
    : null;
  return {
    ...base,
    ...saved,
    skillRatings: { ...base.skillRatings, ...(saved.skillRatings || {}) },
    stageRemarks: saved.stageRemarks || legacyRound?.remarks || base.stageRemarks || '',
    authorizedSignature: saved.authorizedSignature || legacyRound?.signature || base.authorizedSignature || '',
  };
}

function buildEmptyForm(skills, seed = {}) {
  const emptySkills = skills.reduce((acc, skill) => {
    acc[skill] = { rating: null, remarks: '' };
    return acc;
  }, {});
  const merged = {
    candidateName: '',
    positionApplied: '',
    interviewDate: '',
    experience: '',
    recruiter: '',
    location: '',
    currentCtc: '',
    expectedCtc: '',
    noticePeriod: '',
    joiningAvailability: '',
    skillRatings: emptySkills,
    stageRemarks: '',
    authorizedSignature: '',
    overallScore: '',
    finalRecommendation: '',
    recommendedClientType: '',
    shift: '',
    trainingRequired: '',
    expectedJoining: '',
    finalComments: '',
    ...seed,
    skillRatings: { ...emptySkills, ...(seed.skillRatings || {}) },
  };
  return mergeForm(merged, null);
}

function statusBadgeClass(status) {
  if (status === 'Submitted') return 'bg-emerald-50 text-emerald-800';
  if (status === 'Draft') return 'bg-amber-50 text-amber-800';
  return 'bg-gray-100 text-gray-600';
}

function FeedbackStageForm({
  form,
  setForm,
  options,
  stageName,
}) {
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setSkill = (skill, patch) => {
    setForm((prev) => ({
      ...prev,
      skillRatings: {
        ...prev.skillRatings,
        [skill]: { ...(prev.skillRatings?.[skill] || {}), ...patch },
      },
    }));
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Candidate details</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Candidate Name">
            <input className={inputClass} value={form.candidateName || ''} onChange={(e) => setField('candidateName', e.target.value)} />
          </Field>
          <Field label="Position Applied">
            <input className={inputClass} value={form.positionApplied || ''} onChange={(e) => setField('positionApplied', e.target.value)} />
          </Field>
          <Field label="Interview Date">
            <input type="date" className={inputClass} value={form.interviewDate || ''} onChange={(e) => setField('interviewDate', e.target.value)} />
          </Field>
          <Field label="Experience">
            <input className={inputClass} value={form.experience || ''} onChange={(e) => setField('experience', e.target.value)} />
          </Field>
          <Field label="Recruiter">
            <input className={inputClass} value={form.recruiter || ''} onChange={(e) => setField('recruiter', e.target.value)} />
          </Field>
          <Field label="Location">
            <input className={inputClass} value={form.location || ''} onChange={(e) => setField('location', e.target.value)} />
          </Field>
          <Field label="Current CTC">
            <input className={inputClass} value={form.currentCtc || ''} onChange={(e) => setField('currentCtc', e.target.value)} />
          </Field>
          <Field label="Expected CTC">
            <input className={inputClass} value={form.expectedCtc || ''} onChange={(e) => setField('expectedCtc', e.target.value)} />
          </Field>
          <Field label="Notice Period">
            <input className={inputClass} value={form.noticePeriod || ''} onChange={(e) => setField('noticePeriod', e.target.value)} />
          </Field>
          <Field label="Joining Availability">
            <input className={inputClass} value={form.joiningAvailability || ''} onChange={(e) => setField('joiningAvailability', e.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Skill / Competency ratings</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">Skill / Competency</th>
                {[1, 2, 3, 4, 5].map((n) => (
                  <th key={n} className="w-12 px-1 py-2.5 text-center font-medium">{n}</th>
                ))}
                <th className="px-3 py-2.5 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {options.skills.map((skill) => {
                const row = form.skillRatings?.[skill] || { rating: null, remarks: '' };
                return (
                  <tr key={skill}>
                    <td className="px-3 py-2 font-medium text-gray-800">{skill}</td>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <td key={n} className="px-1 py-2 text-center">
                        <input
                          type="radio"
                          name={`skill-${stageName}-${skill}`}
                          checked={Number(row.rating) === n}
                          onChange={() => setSkill(skill, { rating: n })}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <input
                        className={`${inputClass} py-1.5`}
                        value={row.remarks || ''}
                        onChange={(e) => setSkill(skill, { remarks: e.target.value })}
                        placeholder="Optional"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Round remarks — {stageName || 'Stage'}
        </h3>
        <div className="rounded-xl border border-gray-200 p-4">
          <textarea
            rows={3}
            className={inputClass}
            value={form.stageRemarks || ''}
            onChange={(e) => setField('stageRemarks', e.target.value)}
            placeholder={`Remarks for ${stageName || 'this round'}`}
          />
          <div className="mt-3">
            <DigitalSignaturePad
              label="Authorized Person Signature"
              value={form.authorizedSignature || ''}
              onChange={(value) => setField('authorizedSignature', value)}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Final recommendation</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Overall Score">
            <input className={inputClass} value={form.overallScore || ''} onChange={(e) => setField('overallScore', e.target.value)} placeholder="e.g. 4.2 / 5" />
          </Field>
          <Field label="Final Recommendation">
            <div className="flex flex-wrap gap-3 pt-1">
              {options.recommendations.map((rec) => (
                <label key={rec.value} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={`finalRecommendation-${stageName}`}
                    checked={form.finalRecommendation === rec.value}
                    onChange={() => setField('finalRecommendation', rec.value)}
                    className="accent-primary"
                  />
                  {rec.label}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Recommended Client Type">
            <input className={inputClass} value={form.recommendedClientType || ''} onChange={(e) => setField('recommendedClientType', e.target.value)} />
          </Field>
          <Field label="Shift">
            <input className={inputClass} value={form.shift || ''} onChange={(e) => setField('shift', e.target.value)} />
          </Field>
          <Field label="Training Required">
            <input className={inputClass} value={form.trainingRequired || ''} onChange={(e) => setField('trainingRequired', e.target.value)} />
          </Field>
          <Field label="Expected Joining">
            <input type="date" className={inputClass} value={form.expectedJoining || ''} onChange={(e) => setField('expectedJoining', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Final Comments">
              <textarea
                rows={3}
                className={inputClass}
                value={form.finalComments || ''}
                onChange={(e) => setField('finalComments', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function InterviewFeedbackDrawer({
  open,
  onClose,
  application,
  stageId,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({
    skills: DEFAULT_SKILLS,
    recommendations: DEFAULT_RECS,
  });
  const [stages, setStages] = useState([]);
  const [formsByStage, setFormsByStage] = useState({});
  const [statusByStage, setStatusByStage] = useState({});
  const [activeStageId, setActiveStageId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    if (!open || !application?.id) return undefined;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${application.id}/interview-feedback?all=1`,
        );
        const data = res.data.data;
        if (cancelled) return;

        const skills = data.options?.skills || DEFAULT_SKILLS;
        setOptions({
          skills,
          recommendations: data.options?.recommendations || DEFAULT_RECS,
        });

        const stageList = data.stages || [];
        setStages(stageList);

        const forms = {};
        const statuses = {};
        stageList.forEach((item) => {
          const sid = item.stage.id;
          forms[sid] = buildEmptyForm(skills, item.form_data || item.feedback?.formData || item.feedback?.form_data || {});
          statuses[sid] = item.status || null;
        });
        setFormsByStage(forms);
        setStatusByStage(statuses);

        const preferred = stageId
          || data.application?.current_stage_id
          || stageList.find((s) => s.is_current)?.stage?.id
          || stageList[0]?.stage?.id
          || null;
        setActiveStageId(preferred);
        // Expand every pipeline stage form so all rounds are visible at once
        setExpandedIds(stageList.map((s) => s.stage.id));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load interview feedback');
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [open, application?.id, stageId]);

  const activeStage = useMemo(
    () => stages.find((s) => s.stage.id === activeStageId) || stages[0] || null,
    [stages, activeStageId],
  );

  const setActiveForm = (updater) => {
    if (!activeStageId) return;
    setFormsByStage((prev) => ({
      ...prev,
      [activeStageId]: typeof updater === 'function' ? updater(prev[activeStageId]) : updater,
    }));
  };

  const toggleExpanded = (sid) => {
    setExpandedIds((prev) => (
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    ));
    setActiveStageId(sid);
  };

  const save = async (status) => {
    if (!activeStageId || !formsByStage[activeStageId]) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${application.id}/interview-feedback/${activeStageId}`,
        { status, form_data: formsByStage[activeStageId] },
      );
      toast.success(status === 'Submitted' ? 'Interview feedback submitted' : 'Draft saved');
      setStatusByStage((prev) => ({ ...prev, [activeStageId]: status }));
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = (sid = activeStageId) => {
    if (!application?.id || !sid) return;
    const url = ROUTES.AGENCY_INTERVIEW_FEEDBACK_PRINT
      .replace(':applicationId', application.id)
      .replace(':stageId', sid);
    window.open(url, '_blank');
  };

  const candidateName = application?.candidate
    ? `${application.candidate.first_name || ''} ${application.candidate.last_name || ''}`.trim()
    : formsByStage[activeStageId]?.candidateName || 'Candidate';

  const submittedCount = Object.values(statusByStage).filter((s) => s === 'Submitted').length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="3xl"
      elevated
      title="Interview Assessment Feedback"
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {activeStage ? `Editing: Round ${activeStage.round} — ${activeStage.stage.name}` : ''}
            {statusByStage[activeStageId] ? ` · ${statusByStage[activeStageId]}` : ''}
            {stages.length > 0 ? ` · ${submittedCount}/${stages.length} submitted` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeStageId && (
              <button
                type="button"
                disabled={loading}
                onClick={() => downloadPdf(activeStageId)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            )}
            <button
              type="button"
              disabled={saving || loading || !activeStageId}
              onClick={() => save('Draft')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving || loading || !activeStageId}
              onClick={() => save('Submitted')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading feedback for all stages…
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-600">
              Feedback for <strong className="text-gray-900">{candidateName}</strong>
              {' '}across all pipeline stages
              {stages.length ? ` (${stages.length})` : ''}.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              All {stages.length || ''} pipeline stage forms are listed below. Open each round to view or edit.
              Rating: 1-Poor · 2-Basic · 3-Competent · 4-Good · 5-Excellent
            </p>
          </div>

          {stages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stages.map((item) => {
                const sid = item.stage.id;
                const isActive = sid === activeStageId;
                const status = statusByStage[sid];
                return (
                  <button
                    key={sid}
                    type="button"
                    onClick={() => {
                      setActiveStageId(sid);
                      if (!expandedIds.includes(sid)) {
                        setExpandedIds((prev) => [...prev, sid]);
                      }
                      // Scroll into view after expand
                      requestAnimationFrame(() => {
                        document.getElementById(`feedback-stage-${sid}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      });
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : statusBadgeClass(status)
                    }`}
                  >
                    Round {item.round}: {item.stage.name}
                    {status ? ` · ${status}` : ' · Pending'}
                    {item.is_current ? ' · Current' : ''}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {stages.map((item) => {
              const sid = item.stage.id;
              const expanded = expandedIds.includes(sid);
              const status = statusByStage[sid];
              const isActive = sid === activeStageId;
              const form = formsByStage[sid];

              return (
                <div
                  key={sid}
                  id={`feedback-stage-${sid}`}
                  className={`overflow-hidden rounded-xl border ${
                    isActive ? 'border-primary/40 ring-1 ring-primary/20' : 'border-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(sid)}
                    className="flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3 text-left hover:bg-gray-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Round {item.round}: {item.stage.name}
                        {item.is_current && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Current stage
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {status || 'No feedback yet'}
                        {form?.overallScore ? ` · Score ${form.overallScore}` : ''}
                        {form?.finalRecommendation ? ` · ${form.finalRecommendation}` : ''}
                      </p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {expanded && form && (
                    <div className="border-t border-gray-200 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-gray-500">
                          {isActive
                            ? 'This form is active for Save / Submit below.'
                            : 'Click “Edit this round” to make Save / Submit apply here.'}
                        </p>
                        <div className="flex gap-2">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => setActiveStageId(sid)}
                              className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                            >
                              Edit this round
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => downloadPdf(sid)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Download size={14} />
                            PDF
                          </button>
                        </div>
                      </div>
                      <FeedbackStageForm
                        form={form}
                        setForm={isActive
                          ? setActiveForm
                          : (updater) => {
                              setActiveStageId(sid);
                              setFormsByStage((prev) => ({
                                ...prev,
                                [sid]: typeof updater === 'function' ? updater(prev[sid]) : updater,
                              }));
                            }}
                        options={options}
                        stageName={item.stage.name}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {stages.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-500">
                No pipeline stages configured for this job.
              </p>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
