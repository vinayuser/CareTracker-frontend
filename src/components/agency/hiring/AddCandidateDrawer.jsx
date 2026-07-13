import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import { addCandidateToJob } from '../../../redux/slices/candidatesSlice';
import { fetchHiringPipeline } from '../../../redux/slices/hiringPipelineSlice';
import countryList from '../../../utils/countryList';
import {
  validateCandidateForm,
  parseExperienceValue,
  EXPERIENCE_OPTIONS,
} from '../../../utils/candidateFormValidator';
import SelectFormsToSendModal from './SelectFormsToSendModal';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  country: '',
  designation: '',
  education: '',
  experience: '',
  currentCtc: '',
  expectedCtc: '',
  dateOfBirth: '',
  summary: '',
  skills: '',
  profilePic: null,
  resume: null,
  jobId: '',
};

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

function FileField({ label, accept, file, onChange, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 hover:border-primary/40 hover:bg-primary/5">
        <Upload size={20} className="mb-2 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {file ? file.name : 'Choose file'}
        </span>
        {hint && <span className="mt-1 text-xs text-gray-500">{hint}</span>}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

export default function AddCandidateDrawer({ open, onClose, jobs = [], selectedJob = null, onSuccess }) {
  const dispatch = useDispatch();
  const pipelineStages = useSelector((state) => state.hiringPipeline.stages);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFormPicker, setShowFormPicker] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY,
      jobId: selectedJob?.id || '',
    });
    setErrors({});
    setShowFormPicker(false);
    dispatch(fetchHiringPipeline());
  }, [open, selectedJob, dispatch]);

  const firstStage = useMemo(() => {
    const sorted = [...(pipelineStages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    return sorted[0] || null;
  }, [pipelineStages]);

  const firstStageDocuments = useMemo(() => (
    (firstStage?.documents || []).map((d) => ({
      code: d.code,
      name: d.name,
      is_required: d.isRequired !== false && d.is_required !== false,
    }))
  ), [firstStage]);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setFile = (field) => (file) => {
    setForm((prev) => ({ ...prev, [field]: file }));
  };

  const job = useMemo(
    () => jobs.find((j) => j.id === form.jobId) || selectedJob,
    [jobs, form.jobId, selectedJob],
  );

  const submitCandidate = async (documentCodes) => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('first_name', form.firstName.trim());
      data.append('last_name', form.lastName.trim());
      data.append('email', form.email.trim());
      data.append('phone', form.phone.trim());
      data.append('location', form.location.trim());
      data.append('country', form.country.trim());
      data.append('designation', form.designation.trim());
      data.append('education', form.education.trim());
      data.append('experience', String(parseExperienceValue(form.experience)));
      data.append('current_ctc', String(Number(form.currentCtc) || 0));
      data.append('expected_ctc', String(Number(form.expectedCtc) || 0));
      data.append('job_id', form.jobId);
      data.append('document_codes', JSON.stringify(documentCodes || []));
      if (form.dateOfBirth) data.append('date_of_birth', form.dateOfBirth);
      if (form.summary.trim()) data.append('summary', form.summary.trim());
      if (form.skills.trim()) data.append('skills', form.skills.trim());
      if (form.profilePic) data.append('profile_pic', form.profilePic);
      if (form.resume) data.append('resume', form.resume);

      await dispatch(addCandidateToJob(data)).unwrap();
      setShowFormPicker(false);
      onSuccess?.();
      onClose();
    } catch {
      // toast in slice
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateCandidateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (firstStageDocuments.length > 0) {
      setShowFormPicker(true);
      return;
    }
    await submitCandidate([]);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Candidate"
      width="xl"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-candidate-form"
            disabled={loading}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? 'Adding...' : 'Add Candidate'}
          </button>
        </div>
      }
    >
      <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-5">
        {job && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            Applying for: <strong>{job.job_title || job.jobTitle}</strong>
            {(job.job_workplace || job.job_location) && (
              <span className="text-primary/80">
                {' '}
                · {job.job_workplace || ''} · {job.job_location || job.jobLocation || ''}
              </span>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Job *</label>
          <select value={form.jobId} onChange={set('jobId')} className={inputClass} disabled={!!selectedJob}>
            <option value="">Select job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.job_title || j.jobTitle}
              </option>
            ))}
          </select>
          {errors.jobId && <p className="mt-1 text-xs text-red-600">{errors.jobId}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name *</label>
            <input value={form.firstName} onChange={set('firstName')} className={inputClass} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name *</label>
            <input value={form.lastName} onChange={set('lastName')} className={inputClass} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Location *</label>
            <input value={form.location} onChange={set('location')} className={inputClass} />
            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Country *</label>
            <select value={form.country} onChange={set('country')} className={inputClass}>
              <option value="">Select country</option>
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Designation *</label>
            <input value={form.designation} onChange={set('designation')} className={inputClass} />
            {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Education *</label>
            <input value={form.education} onChange={set('education')} className={inputClass} />
            {errors.education && <p className="mt-1 text-xs text-red-600">{errors.education}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Work Experience *</label>
            <select value={form.experience} onChange={set('experience')} className={inputClass}>
              <option value="">Select experience</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.experience && <p className="mt-1 text-xs text-red-600">{errors.experience}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number *</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} maxLength={10} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current CTC</label>
            <input type="number" min="0" value={form.currentCtc} onChange={set('currentCtc')} className={inputClass} />
            {errors.currentCtc && <p className="mt-1 text-xs text-red-600">{errors.currentCtc}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected CTC</label>
            <input type="number" min="0" value={form.expectedCtc} onChange={set('expectedCtc')} className={inputClass} />
            {errors.expectedCtc && <p className="mt-1 text-xs text-red-600">{errors.expectedCtc}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Summary</label>
            <input value={form.summary} onChange={set('summary')} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Skills</label>
            <input value={form.skills} onChange={set('skills')} className={inputClass} placeholder="e.g. CPR, First Aid, Patient Care" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FileField
            label="Upload Profile Pic"
            accept=".jpg,.jpeg,.png"
            file={form.profilePic}
            onChange={setFile('profilePic')}
            hint="JPG, JPEG, or PNG — max 5 MB"
          />
          <FileField
            label="Upload Resume"
            accept=".pdf"
            file={form.resume}
            onChange={setFile('resume')}
            hint="PDF only — max 10 MB"
          />
        </div>
      </form>

      <SelectFormsToSendModal
        open={showFormPicker}
        onClose={() => !loading && setShowFormPicker(false)}
        onConfirm={submitCandidate}
        title="Select forms for first stage"
        stageName={firstStage?.name || ''}
        candidateName={`${form.firstName} ${form.lastName}`.trim()}
        documents={firstStageDocuments}
        confirmLabel="Add & send selected"
        allowSkip
        submitting={loading}
      />
    </Drawer>
  );
}
