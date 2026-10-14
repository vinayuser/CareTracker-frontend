import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, UserPlus } from 'lucide-react';
import Drawer from '../../ui/Drawer';
import SubmitButton from '../../ui/SubmitButton';
import { addCandidateToJob, fetchCandidateDirectory, updateCandidate } from '../../../redux/slices/candidatesSlice';
import { fetchHiringPipeline } from '../../../redux/slices/hiringPipelineSlice';
import countryList from '../../../utils/countryList';
import {
  validateCandidateForm,
  parseExperienceValue,
  sanitizeCandidateField,
  candidateFieldMaxLength,
  EXPERIENCE_OPTIONS,
} from '../../../utils/candidateFormValidator';
import { getImageUploadError, MAX_IMAGE_UPLOAD_LABEL } from '../../../utils/imageUploadValidation';
import useSubmitLock from '../../../hooks/useSubmitLock';
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

const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';

function fieldClass(hasError) {
  return hasError ? inputErrorClass : inputClass;
}

function FileField({ label, accept, file, onChange, hint, error }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 px-4 py-6 hover:border-primary/40 hover:bg-primary/5 ${error ? 'border-red-400' : 'border-gray-300'}`}>
        <Upload size={20} className="mb-2 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {file ? file.name : 'Choose file'}
        </span>
        {hint && <span className="mt-1 text-xs text-gray-500">{hint}</span>}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const next = e.target.files?.[0] || null;
            e.target.value = '';
            onChange(next);
          }}
        />
      </label>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function experienceLabel(value) {
  const number = Number(value);
  if (value === '' || value == null || Number.isNaN(number)) return '';
  if (number <= 0) return 'Fresher';
  if (number <= 3) return '1-3 years';
  if (number <= 4) return '3-5 years';
  return '5+ years';
}

export default function AddCandidateDrawer({
  open,
  onClose,
  jobs = [],
  selectedJob = null,
  application = null,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const pipelineStages = useSelector((state) => state.hiringPipeline.stages);
  const directory = useSelector((state) => state.candidates.directory);
  const [mode, setMode] = useState('new');
  const [existingId, setExistingId] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, runLocked] = useSubmitLock();
  const [showFormPicker, setShowFormPicker] = useState(false);

  const editing = Boolean(application?.id);

  useEffect(() => {
    if (!open) return;
    const person = application?.candidate || {};
    setForm({
      ...EMPTY,
      firstName: person.first_name || person.firstName || '',
      lastName: person.last_name || person.lastName || '',
      email: person.email || '',
      phone: person.phone || '',
      location: person.location || '',
      country: person.country || '',
      designation: person.designation || '',
      education: person.education || '',
      experience: experienceLabel(person.experience),
      currentCtc: person.current_ctc ?? person.currentCtc ?? '',
      expectedCtc: person.expected_ctc ?? person.expectedCtc ?? '',
      dateOfBirth: person.date_of_birth || (person.dateOfBirth ? String(person.dateOfBirth).slice(0, 10) : ''),
      summary: person.summary || '',
      skills: person.skills || '',
      jobId: application?.job?.id || application?.jobPostId || selectedJob?.id || '',
    });
    setErrors({});
    setShowFormPicker(false);
    setMode('new');
    setExistingId('');
    if (!editing) {
      dispatch(fetchHiringPipeline());
      dispatch(fetchCandidateDirectory());
    }
  }, [open, selectedJob, application, editing, dispatch]);

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
    const raw = e?.target ? e.target.value : e;
    const value = sanitizeCandidateField(field, raw);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const max = candidateFieldMaxLength;

  const setFile = (field) => (file) => {
    if (field === 'profilePic' && file) {
      const message = getImageUploadError(file);
      if (message) {
        setErrors((prev) => ({ ...prev, profilePic: message }));
        setForm((prev) => ({ ...prev, profilePic: null }));
        return;
      }
    }
    setForm((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const job = useMemo(
    () => jobs.find((j) => j.id === form.jobId) || selectedJob,
    [jobs, form.jobId, selectedJob],
  );

  const availablePeople = useMemo(
    () => (directory || []).filter((person) => (person.availability || 'Available') === 'Available'),
    [directory],
  );

  const submitCandidate = (documentCodes) => runLocked(async () => {
    try {
      if (mode === 'existing' && !editing) {
        await dispatch(addCandidateToJob({
          candidate_id: existingId,
          job_id: form.jobId,
          document_codes: documentCodes || [],
        })).unwrap();
        setShowFormPicker(false);
        onSuccess?.();
        onClose();
        return;
      }
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

      if (editing) {
        await dispatch(updateCandidate({ id: application.id, payload: data })).unwrap();
      } else {
        await dispatch(addCandidateToJob(data)).unwrap();
      }
      setShowFormPicker(false);
      onSuccess?.();
      onClose();
    } catch {
      // toast in slice
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'existing' && !editing) {
      const nextErrors = {};
      if (!form.jobId) nextErrors.jobId = 'Select a job';
      if (!existingId) nextErrors.existingId = 'Select a candidate';
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    } else {
      const nextErrors = validateCandidateForm(form);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }

    if (!editing && firstStageDocuments.length > 0) {
      setShowFormPicker(true);
      return;
    }
    await submitCandidate([]);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Candidate' : 'Add Candidate'}
      width="xl"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <SubmitButton
            type="submit"
            form="add-candidate-form"
            loading={loading}
            icon={UserPlus}
            loadingLabel={editing ? 'Saving...' : 'Adding...'}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {editing ? 'Save changes' : mode === 'existing' ? 'Assign to job' : 'Add Candidate'}
          </SubmitButton>
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

        {!editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === 'new' ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700'}`}
            >
              New candidate
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === 'existing' ? 'bg-primary text-white' : 'border border-gray-300 text-gray-700'}`}
            >
              Existing candidate
            </button>
          </div>
        )}

        {mode === 'existing' && !editing ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Available candidate *</label>
            <select value={existingId} onChange={(e) => setExistingId(e.target.value)} className={fieldClass(errors.existingId)}>
              <option value="">Select candidate</option>
              {availablePeople.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.first_name || person.firstName} {person.last_name || person.lastName} · {person.email}
                </option>
              ))}
            </select>
            {errors.existingId && <p className="mt-1 text-xs text-red-600">{errors.existingId}</p>}
            {availablePeople.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No candidates are marked Available. Set a candidate to Available on the Candidates page to assign them to another job.</p>
            )}
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Job *</label>
          <select value={form.jobId} onChange={set('jobId')} className={fieldClass(errors.jobId)} disabled={!!selectedJob || editing}>
            <option value="">Select job</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.job_title || j.jobTitle}
              </option>
            ))}
            {editing && form.jobId && !jobs.some((j) => j.id === form.jobId) ? (
              <option value={form.jobId}>{application?.job?.job_title || 'Current job'}</option>
            ) : null}
          </select>
          {errors.jobId && <p className="mt-1 text-xs text-red-600">{errors.jobId}</p>}
        </div>

        {(mode === 'new' || editing) && (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">First Name *</label>
            <input value={form.firstName} onChange={set('firstName')} maxLength={max('firstName')} className={fieldClass(errors.firstName)} />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Last Name *</label>
            <input value={form.lastName} onChange={set('lastName')} maxLength={max('lastName')} className={fieldClass(errors.lastName)} />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Location *</label>
            <input value={form.location} onChange={set('location')} maxLength={max('location')} className={fieldClass(errors.location)} />
            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Country *</label>
            <select value={form.country} onChange={set('country')} className={fieldClass(errors.country)}>
              <option value="">Select country</option>
              {countryList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Designation *</label>
            <input value={form.designation} onChange={set('designation')} maxLength={max('designation')} className={fieldClass(errors.designation)} />
            {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Education *</label>
            <input value={form.education} onChange={set('education')} maxLength={max('education')} className={fieldClass(errors.education)} />
            {errors.education && <p className="mt-1 text-xs text-red-600">{errors.education}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Work Experience *</label>
            <select value={form.experience} onChange={set('experience')} className={fieldClass(errors.experience)}>
              <option value="">Select experience</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.experience && <p className="mt-1 text-xs text-red-600">{errors.experience}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={set('phone')}
              maxLength={max('phone')}
              className={fieldClass(errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} maxLength={max('email')} className={fieldClass(errors.email)} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={fieldClass(errors.dateOfBirth)} />
            {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current CTC</label>
            <input
              inputMode="decimal"
              value={form.currentCtc}
              onChange={set('currentCtc')}
              maxLength={max('currentCtc')}
              className={fieldClass(errors.currentCtc)}
              placeholder="0.00"
            />
            {errors.currentCtc && <p className="mt-1 text-xs text-red-600">{errors.currentCtc}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected CTC</label>
            <input
              inputMode="decimal"
              value={form.expectedCtc}
              onChange={set('expectedCtc')}
              maxLength={max('expectedCtc')}
              className={fieldClass(errors.expectedCtc)}
              placeholder="0.00"
            />
            {errors.expectedCtc && <p className="mt-1 text-xs text-red-600">{errors.expectedCtc}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Summary</label>
            <input value={form.summary} onChange={set('summary')} maxLength={max('summary')} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Skills</label>
            <input value={form.skills} onChange={set('skills')} maxLength={max('skills')} className={inputClass} placeholder="e.g. CPR, First Aid, Patient Care" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FileField
            label="Upload Profile Pic"
            accept=".jpg,.jpeg,.png"
            file={form.profilePic}
            onChange={setFile('profilePic')}
            hint={`JPG, JPEG, or PNG — max ${MAX_IMAGE_UPLOAD_LABEL}`}
            error={errors.profilePic}
          />
          <FileField
            label="Upload Resume"
            accept=".pdf"
            file={form.resume}
            onChange={setFile('resume')}
            hint="PDF only — max 10 MB"
            error={errors.resume}
          />
        </div>
        </>
        )}
      </form>

      <SelectFormsToSendModal
        open={showFormPicker}
        onClose={() => !loading && setShowFormPicker(false)}
        onConfirm={submitCandidate}
        title="Select forms for first stage"
        stageName={firstStage?.name || ''}
        candidateName={
          mode === 'existing'
            ? `${availablePeople.find((person) => person.id === existingId)?.first_name || ''} ${availablePeople.find((person) => person.id === existingId)?.last_name || ''}`.trim()
            : `${form.firstName} ${form.lastName}`.trim()
        }
        documents={firstStageDocuments}
        confirmLabel="Add & send selected"
        allowSkip
        submitting={loading}
      />
    </Drawer>
  );
}
