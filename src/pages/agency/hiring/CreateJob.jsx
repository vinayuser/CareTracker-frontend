import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Save, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import TagInput from '../../../components/agency/hiring/TagInput';
import SubmitButton from '../../../components/ui/SubmitButton';
import {
  JOB_TITLES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  KEYWORDS_BY_TITLE,
  CURRENCIES,
} from '../../../data/createJobDropdown';
import {
  createJob,
  updateJob,
  fetchJob,
  generateJobAi,
  clearSelectedJob,
} from '../../../redux/slices/jobsSlice';
import { ROUTES } from '../../../routes/routes';
import useSubmitLock from '../../../hooks/useSubmitLock';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100';

function fieldClass(hasError) {
  return hasError ? inputErrorClass : inputClass;
}

const EMPTY_FORM = {
  job_title: '',
  job_code: '',
  job_workplace: 'onsite',
  job_location: '',
  job_department: '',
  job_function: '',
  employment_type: '',
  experience: '',
  education: '',
  keywords: [],
  annual_salary_from: '',
  annual_salary_to: '',
  currency: 'USD',
  job_description: '',
  job_requirements: '',
  job_benefits: '',
};

function buildJobAiPayload(values) {
  const payload = {};
  const stringFields = [
    'job_title', 'job_code', 'job_workplace', 'job_location', 'job_department',
    'job_function', 'employment_type', 'experience', 'education', 'currency',
  ];
  stringFields.forEach((key) => {
    const v = values[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') payload[key] = String(v).trim();
  });
  if (values.annual_salary_from !== '') payload.annual_salary_from = Number(values.annual_salary_from);
  if (values.annual_salary_to !== '') payload.annual_salary_to = Number(values.annual_salary_to);
  if (values.keywords?.length) payload.keywords = values.keywords;
  return payload;
}

export default function CreateJob({ editId = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selected, aiLoading } = useSelector((state) => state.jobs);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showAiCard, setShowAiCard] = useState(true);
  const [saving, runLocked] = useSubmitLock();

  const keywordSuggestions = useMemo(
    () => KEYWORDS_BY_TITLE[form.job_title] || [],
    [form.job_title],
  );

  useEffect(() => {
    if (editId) {
      dispatch(fetchJob(editId));
    }
    return () => dispatch(clearSelectedJob());
  }, [dispatch, editId]);

  useEffect(() => {
    if (!editId || !selected) return;
    setForm({
      job_title: selected.job_title || '',
      job_code: selected.job_code || '',
      job_workplace: selected.job_workplace || 'onsite',
      job_location: selected.job_location || '',
      job_department: selected.job_department || '',
      job_function: selected.job_function || '',
      employment_type: selected.employment_type || '',
      experience: selected.experience || '',
      education: selected.education || '',
      keywords: selected.keywordsArray || [],
      annual_salary_from: selected.from_salary ?? '',
      annual_salary_to: selected.to_salary ?? '',
      currency: selected.currency || 'USD',
      job_description: selected.description || '',
      job_requirements: selected.requirements || '',
      job_benefits: selected.benefits || '',
    });
  }, [editId, selected]);

  const salaryCheckTimer = useRef(null);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field] || errors.annual_salary_from || errors.annual_salary_to) {
      setErrors((prev) => ({ ...prev, [field]: undefined, annual_salary_from: undefined, annual_salary_to: undefined }));
    }
  };

  useEffect(() => {
    if (salaryCheckTimer.current) clearTimeout(salaryCheckTimer.current);
    const from = form.annual_salary_from;
    const to = form.annual_salary_to;
    if (from === '' || to === '') return undefined;
    salaryCheckTimer.current = setTimeout(() => {
      if (Number(from) > Number(to)) {
        setErrors((prev) => ({
          ...prev,
          annual_salary_to: 'Must be greater than or equal to salary from',
        }));
      }
    }, 600);
    return () => {
      if (salaryCheckTimer.current) clearTimeout(salaryCheckTimer.current);
    };
  }, [form.annual_salary_from, form.annual_salary_to]);

  const validate = () => {
    const next = {};
    if (!form.job_title) next.job_title = 'Job title is required';
    if (!String(form.job_code || '').trim()) next.job_code = 'Job code is required';
    if (!String(form.job_location || '').trim()) next.job_location = 'Office location is required';
    if (!form.job_department) next.job_department = 'Department is required';
    if (!String(form.job_function || '').trim()) next.job_function = 'Job function is required';
    if (!form.employment_type) next.employment_type = 'Employment type is required';
    if (!form.experience) next.experience = 'Experience is required';
    if (!form.education) next.education = 'Education is required';
    if (!form.keywords.length) next.keywords = 'Add at least one keyword';
    if (!form.annual_salary_from) next.annual_salary_from = 'Salary from is required';
    if (!form.annual_salary_to) next.annual_salary_to = 'Salary to is required';
    if (form.annual_salary_from && form.annual_salary_to && Number(form.annual_salary_from) > Number(form.annual_salary_to)) {
      next.annual_salary_from = 'Cannot be greater than salary to';
    }
    if (!String(form.job_description || '').trim()) next.job_description = 'About the role is required';
    if (!String(form.job_requirements || '').trim()) next.job_requirements = 'Requirements are required';
    if (!String(form.job_benefits || '').trim()) next.job_benefits = 'Benefits are required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAiGenerate = async () => {
    const payload = buildJobAiPayload(form);
    if (!Object.keys(payload).length) {
      toast.warning('Fill at least one detail (e.g. job title) before generating.');
      return;
    }
    const result = await dispatch(generateJobAi(payload));
    if (generateJobAi.fulfilled.match(result)) {
      setForm((prev) => ({
        ...prev,
        job_description: result.payload.job_description || '',
        job_requirements: result.payload.job_requirements || '',
        job_benefits: result.payload.job_benefits || '',
      }));
      toast.success('Description, requirements, and benefits filled from AI.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      requestAnimationFrame(() => {
        document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    const payload = {
      ...form,
      annual_salary_from: Number(form.annual_salary_from),
      annual_salary_to: Number(form.annual_salary_to),
    };
    return runLocked(async () => {
      try {
        if (editId) {
          await dispatch(updateJob({ id: editId, payload })).unwrap();
        } else {
          await dispatch(createJob(payload)).unwrap();
        }
        navigate(ROUTES.AGENCY_JOBS);
      } catch {
        // toast in slice
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{editId ? 'Edit Job' : 'Create Job'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Post a new role. The agency hiring pipeline is applied automatically.
          </p>
        </div>
        <Link to={ROUTES.AGENCY_JOBS} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Back to Jobs
        </Link>
      </div>

      {showAiCard && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
          <div>
            <p className="font-medium text-violet-900">Generate personalized job description with AI</p>
            <p className="text-sm text-violet-700">Fill in job details, then let AI draft the role description.</p>
          </div>
          <button type="button" onClick={() => setShowAiCard(false)} className="text-sm text-violet-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Job Title & Department</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Job Title *</label>
              <select value={form.job_title} onChange={(e) => setField('job_title', e.target.value)} className={fieldClass(errors.job_title)} data-field-error={errors.job_title ? 'true' : undefined}>
                <option value="">Select title</option>
                {JOB_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.job_title && <p className="mt-1 text-xs text-red-600">{errors.job_title}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Job Code *</label>
              <input value={form.job_code} onChange={(e) => setField('job_code', e.target.value)} className={fieldClass(errors.job_code)} data-field-error={errors.job_code ? 'true' : undefined} />
              {errors.job_code && <p className="mt-1 text-xs text-red-600">{errors.job_code}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Department *</label>
              <select value={form.job_department} onChange={(e) => setField('job_department', e.target.value)} className={fieldClass(errors.job_department)} data-field-error={errors.job_department ? 'true' : undefined}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.job_department && <p className="mt-1 text-xs text-red-600">{errors.job_department}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Job Function *</label>
              <input value={form.job_function} onChange={(e) => setField('job_function', e.target.value)} className={fieldClass(errors.job_function)} data-field-error={errors.job_function ? 'true' : undefined} />
              {errors.job_function && <p className="mt-1 text-xs text-red-600">{errors.job_function}</p>}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Workplace & Location</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            {['onsite', 'hybrid', 'remote'].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="workplace"
                  checked={form.job_workplace === type}
                  onChange={() => setField('job_workplace', type)}
                  className="text-primary focus:ring-primary"
                />
                {type === 'onsite' ? 'On-site' : type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Office Location *</label>
            <input value={form.job_location} onChange={(e) => setField('job_location', e.target.value)} className={fieldClass(errors.job_location)} data-field-error={errors.job_location ? 'true' : undefined} />
            {errors.job_location && <p className="mt-1 text-xs text-red-600">{errors.job_location}</p>}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Employment Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Employment Type *</label>
              <select value={form.employment_type} onChange={(e) => setField('employment_type', e.target.value)} className={fieldClass(errors.employment_type)} data-field-error={errors.employment_type ? 'true' : undefined}>
                <option value="">Select type</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.employment_type && <p className="mt-1 text-xs text-red-600">{errors.employment_type}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Experience *</label>
              <select value={form.experience} onChange={(e) => setField('experience', e.target.value)} className={fieldClass(errors.experience)} data-field-error={errors.experience ? 'true' : undefined}>
                <option value="">Select experience</option>
                {EXPERIENCE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              {errors.experience && <p className="mt-1 text-xs text-red-600">{errors.experience}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Education *</label>
              <select value={form.education} onChange={(e) => setField('education', e.target.value)} className={fieldClass(errors.education)} data-field-error={errors.education ? 'true' : undefined}>
                <option value="">Select education</option>
                {EDUCATION_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              {errors.education && <p className="mt-1 text-xs text-red-600">{errors.education}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Keywords *</label>
              <div data-field-error={errors.keywords ? 'true' : undefined}>
                <TagInput
                  value={form.keywords}
                  onChange={(keywords) => setField('keywords', keywords)}
                  suggestions={keywordSuggestions}
                  invalid={Boolean(errors.keywords)}
                />
              </div>
              {errors.keywords && <p className="mt-1 text-xs text-red-600">{errors.keywords}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Salary From *</label>
              <input
                type="number"
                min="0"
                max={form.annual_salary_to || undefined}
                value={form.annual_salary_from}
                onChange={(e) => setField('annual_salary_from', e.target.value)}
                className={fieldClass(errors.annual_salary_from)}
                data-field-error={errors.annual_salary_from ? 'true' : undefined}
              />
              {errors.annual_salary_from && <p className="mt-1 text-xs text-red-600">{errors.annual_salary_from}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Salary To *</label>
              <input
                type="number"
                min={form.annual_salary_from || '0'}
                value={form.annual_salary_to}
                onChange={(e) => setField('annual_salary_to', e.target.value)}
                className={fieldClass(errors.annual_salary_to)}
                data-field-error={errors.annual_salary_to ? 'true' : undefined}
              />
              {errors.annual_salary_to && <p className="mt-1 text-xs text-red-600">{errors.annual_salary_to}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Currency *</label>
              <select value={form.currency} onChange={(e) => setField('currency', e.target.value)} className={inputClass}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Job Description</h2>
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <Sparkles size={16} />
              {aiLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">About the role *</label>
              <textarea rows={4} maxLength={600} value={form.job_description} onChange={(e) => setField('job_description', e.target.value)} className={fieldClass(errors.job_description)} data-field-error={errors.job_description ? 'true' : undefined} />
              {errors.job_description && <p className="mt-1 text-xs text-red-600">{errors.job_description}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Requirements *</label>
              <textarea rows={4} maxLength={600} value={form.job_requirements} onChange={(e) => setField('job_requirements', e.target.value)} className={fieldClass(errors.job_requirements)} data-field-error={errors.job_requirements ? 'true' : undefined} />
              {errors.job_requirements && <p className="mt-1 text-xs text-red-600">{errors.job_requirements}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Benefits *</label>
              <textarea rows={4} maxLength={600} value={form.job_benefits} onChange={(e) => setField('job_benefits', e.target.value)} className={fieldClass(errors.job_benefits)} data-field-error={errors.job_benefits ? 'true' : undefined} />
              {errors.job_benefits && <p className="mt-1 text-xs text-red-600">{errors.job_benefits}</p>}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link to={ROUTES.AGENCY_JOBS} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <SubmitButton
            type="submit"
            loading={saving}
            icon={Save}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {editId ? 'Update Job' : 'Create Job'}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
