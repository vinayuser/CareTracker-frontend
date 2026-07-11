import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
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

export default function InterviewFeedbackDrawer({
  open,
  onClose,
  application,
  stageId,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [options, setOptions] = useState({
    skills: DEFAULT_SKILLS,
    recommendations: DEFAULT_RECS,
  });
  const [pipelineRounds, setPipelineRounds] = useState([]);
  const [meta, setMeta] = useState({ stageName: '', status: null });
  const [resolvedStageId, setResolvedStageId] = useState(stageId);

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

  useEffect(() => {
    if (!open || !application?.id) return undefined;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const query = stageId ? `?stage_id=${encodeURIComponent(stageId)}` : '';
        const res = await axiosInstance.get(
          `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${application.id}/interview-feedback${query}`,
        );
        const data = res.data.data;
        if (cancelled) return;

        const skills = data.options?.skills || DEFAULT_SKILLS;
        setOptions({
          skills,
          recommendations: data.options?.recommendations || DEFAULT_RECS,
        });
        setPipelineRounds(data.pipeline_rounds || []);

        const emptySkills = skills.reduce((acc, skill) => {
          acc[skill] = { rating: null, remarks: '' };
          return acc;
        }, {});

        const base = {
          ...(data.prefill || {}),
          skillRatings: { ...emptySkills, ...(data.prefill?.skillRatings || {}) },
          stageRemarks: data.prefill?.stageRemarks || '',
          authorizedSignature: data.prefill?.authorizedSignature || '',
        };

        setForm(mergeForm(base, data.feedback?.formData || data.feedback?.form_data));
        setMeta({
          stageName: data.stage?.name || '',
          status: data.feedback?.status || null,
        });
        setResolvedStageId(data.stage?.id || stageId);
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

  const save = async (status) => {
    if (!form || !resolvedStageId) return;
    setSaving(true);
    try {
      await axiosInstance.put(
        `${API_ROUTES.AGENCY.JOB_APPLICATIONS.INTERVIEW_FEEDBACK}/${application.id}/interview-feedback/${resolvedStageId}`,
        { status, form_data: form },
      );
      toast.success(status === 'Submitted' ? 'Interview feedback submitted' : 'Draft saved');
      setMeta((prev) => ({ ...prev, status }));
      onSaved?.();
      if (status === 'Submitted') onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = () => {
    if (!application?.id || !resolvedStageId) return;
    const url = ROUTES.AGENCY_INTERVIEW_FEEDBACK_PRINT
      .replace(':applicationId', application.id)
      .replace(':stageId', resolvedStageId);
    window.open(url, '_blank');
  };

  const candidateName = application?.candidate
    ? `${application.candidate.first_name || ''} ${application.candidate.last_name || ''}`.trim()
    : form?.candidateName || 'Candidate';

  const otherRounds = pipelineRounds.filter((r) => r.stage_id !== String(resolvedStageId));

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
            {meta.stageName ? `Round / Stage: ${meta.stageName}` : ''}
            {meta.status ? ` · ${meta.status}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {resolvedStageId && (
              <button
                type="button"
                disabled={loading}
                onClick={downloadPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            )}
            <button
              type="button"
              disabled={saving || loading || !form}
              onClick={() => save('Draft')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving || loading || !form}
              onClick={() => save('Submitted')}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    >
      {loading || !form ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading form…
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <p className="text-sm text-gray-600">
              Feedback for <strong className="text-gray-900">{candidateName}</strong>
              {meta.stageName ? (
                <>
                  {' '}· Round: <strong className="text-gray-900">{meta.stageName}</strong>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Pipeline rounds match your hiring stages
              {pipelineRounds.length ? ` (${pipelineRounds.length})` : ''}.
              {' '}Rating: 1-Poor · 2-Basic · 3-Competent · 4-Good · 5-Excellent
            </p>
          </div>

          {pipelineRounds.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Pipeline rounds</h3>
              <div className="flex flex-wrap gap-2">
                {pipelineRounds.map((round) => {
                  const isCurrent = round.stage_id === String(resolvedStageId);
                  return (
                    <span
                      key={round.stage_id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                        isCurrent
                          ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                          : round.status === 'Submitted'
                            ? 'bg-emerald-50 text-emerald-800'
                            : round.status === 'Draft'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Round {round.round}: {round.stage_name}
                      {round.status ? ` · ${round.status}` : ' · Pending'}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

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
                              name={`skill-${skill}`}
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
              Round remarks — {meta.stageName || 'Current stage'}
            </h3>
            <div className="rounded-xl border border-gray-200 p-4">
              <textarea
                rows={3}
                className={inputClass}
                value={form.stageRemarks || ''}
                onChange={(e) => setField('stageRemarks', e.target.value)}
                placeholder={`Remarks for ${meta.stageName || 'this round'}`}
              />
              <div className="mt-3">
                <DigitalSignaturePad
                  label="Authorized Person Signature"
                  value={form.authorizedSignature || ''}
                  onChange={(value) => setField('authorizedSignature', value)}
                />
              </div>
            </div>

            {otherRounds.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Other rounds</p>
                {otherRounds.map((round) => (
                  <div key={round.stage_id} className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">
                        Round {round.round}: {round.stage_name}
                      </p>
                      <span className="text-xs text-gray-500">{round.status || 'Pending'}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      {round.remarks || 'No remarks yet for this round.'}
                    </p>
                    {round.signature?.startsWith('data:image') && (
                      <img src={round.signature} alt="" className="mt-2 h-12 max-w-[200px] object-contain" />
                    )}
                  </div>
                ))}
              </div>
            )}
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
                        name="finalRecommendation"
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
      )}
    </Drawer>
  );
}
