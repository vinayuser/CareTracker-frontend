import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getInviteSession } from '../../utils/invitationStore';
import { getRegistrationData, updateRegistrationData } from '../../utils/registrationStore';
import {
  formatUsPhone,
  normalizeWebsite,
  validateAgencyInformation,
} from '../../utils/agencyInformationValidation';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const inputErrorClass =
  'w-full rounded-lg border border-red-400 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const errorClass = 'mt-1 text-xs text-red-600';

const AGENCY_TYPES = [
  'Home Care Agency',
  'Home Health Agency',
  'Hospice Care',
  'Personal Care Services',
  'Companion Care',
  'Skilled Nursing',
];

const SERVICE_AREA_OPTIONS = [
  'Los Angeles County',
  'Orange County',
  'San Diego County',
  'Bay Area',
  'Sacramento',
  'Phoenix Metro',
  'Dallas-Fort Worth',
  'Houston Metro',
  'Miami-Dade',
  'New York City',
  'Chicago Metro',
  'Atlanta Metro',
];

const fieldClass = (hasError) => (hasError ? inputErrorClass : inputClass);

export default function AgencyInformation() {
  const navigate = useNavigate();
  const inviteSession = getInviteSession();
  const [form, setForm] = useState(() => {
    const saved = getRegistrationData();
    return {
      ...saved,
      phone: formatUsPhone(saved.phone || ''),
    };
  });
  const [areaInput, setAreaInput] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!inviteSession) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [inviteSession, navigate]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const addServiceArea = (area) => {
    if (!area || form.serviceAreas.includes(area)) return;
    updateField('serviceAreas', [...form.serviceAreas, area]);
    setAreaInput('');
  };

  const removeServiceArea = (area) => {
    updateField(
      'serviceAreas',
      form.serviceAreas.filter((item) => item !== area),
    );
  };

  const showError = (field) => Boolean(touched[field] && errors[field]);

  const handleNext = (e) => {
    e.preventDefault();
    const { valid, errors: nextErrors } = validateAgencyInformation(form);
    setErrors(nextErrors);
    setTouched({
      agencyName: true,
      agencyType: true,
      yearEstablished: true,
      email: true,
      phone: true,
      website: true,
      address: true,
      description: true,
    });
    if (!valid) return;

    updateRegistrationData({
      ...form,
      agencyName: form.agencyName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: formatUsPhone(form.phone),
      website: normalizeWebsite(form.website),
      address: form.address.trim(),
      description: form.description.trim(),
      yearEstablished: String(form.yearEstablished || '').trim(),
    });
    navigate(ROUTES.REGISTRATION_CREATE_ACCOUNT);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Agency Information</h1>
      <p className="mt-1 text-sm text-gray-500">Please provide your agency details.</p>

      <form onSubmit={handleNext} className="mt-8 space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="agencyName">Agency Name *</label>
            <input
              id="agencyName"
              type="text"
              autoComplete="organization"
              maxLength={120}
              value={form.agencyName}
              onChange={(e) => updateField('agencyName', e.target.value)}
              onBlur={() => markTouched('agencyName')}
              placeholder="Enter agency name"
              className={fieldClass(showError('agencyName'))}
              aria-invalid={showError('agencyName')}
            />
            {showError('agencyName') && <p className={errorClass}>{errors.agencyName}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="agencyType">Agency Type *</label>
            <select
              id="agencyType"
              value={form.agencyType}
              onChange={(e) => updateField('agencyType', e.target.value)}
              onBlur={() => markTouched('agencyType')}
              className={fieldClass(showError('agencyType'))}
              aria-invalid={showError('agencyType')}
            >
              <option value="">Select agency type</option>
              {AGENCY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {showError('agencyType') && <p className={errorClass}>{errors.agencyType}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="yearEstablished">Year Established</label>
            <input
              id="yearEstablished"
              type="number"
              inputMode="numeric"
              min="1900"
              max={new Date().getFullYear()}
              step="1"
              value={form.yearEstablished}
              onChange={(e) => updateField('yearEstablished', e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
              onBlur={() => markTouched('yearEstablished')}
              placeholder="e.g. 2015"
              className={fieldClass(showError('yearEstablished'))}
              aria-invalid={showError('yearEstablished')}
            />
            {showError('yearEstablished') && <p className={errorClass}>{errors.yearEstablished}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => markTouched('email')}
              placeholder="contact@agency.com"
              className={fieldClass(showError('email'))}
              readOnly={Boolean(inviteSession?.email)}
              aria-invalid={showError('email')}
            />
            {showError('email') && <p className={errorClass}>{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={14}
              value={form.phone}
              onChange={(e) => updateField('phone', formatUsPhone(e.target.value))}
              onBlur={() => markTouched('phone')}
              placeholder="(555) 123-4567"
              className={fieldClass(showError('phone'))}
              aria-invalid={showError('phone')}
            />
            {showError('phone') && <p className={errorClass}>{errors.phone}</p>}
            {!showError('phone') && (
              <p className="mt-1 text-xs text-gray-400">US format: (555) 123-4567</p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="website">Website</label>
            <input
              id="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              onBlur={() => {
                markTouched('website');
                if (form.website.trim()) {
                  updateField('website', normalizeWebsite(form.website));
                }
              }}
              placeholder="https://www.example.com"
              className={fieldClass(showError('website'))}
              aria-invalid={showError('website')}
            />
            {showError('website') && <p className={errorClass}>{errors.website}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="address">Address *</label>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            maxLength={250}
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            onBlur={() => markTouched('address')}
            placeholder="123 Main St, City, ST 12345"
            className={fieldClass(showError('address'))}
            aria-invalid={showError('address')}
          />
          {showError('address') && <p className={errorClass}>{errors.address}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="serviceAreas">Service Areas</label>
          <select
            id="serviceAreas"
            value={areaInput}
            onChange={(e) => {
              setAreaInput(e.target.value);
              if (e.target.value) addServiceArea(e.target.value);
            }}
            className={inputClass}
          >
            <option value="">Select service areas</option>
            {SERVICE_AREA_OPTIONS.filter((area) => !form.serviceAreas.includes(area)).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          {form.serviceAreas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.serviceAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => removeServiceArea(area)}
                    className="rounded-full hover:bg-primary/20"
                    aria-label={`Remove ${area}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="description">Agency Description *</label>
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            onBlur={() => markTouched('description')}
            placeholder="Brief description of your agency and services..."
            className={fieldClass(showError('description'))}
            aria-invalid={showError('description')}
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            {showError('description') ? (
              <p className={errorClass}>{errors.description}</p>
            ) : (
              <span className="text-xs text-gray-400">Min. 20 characters</span>
            )}
            <span className="text-xs text-gray-400">{String(form.description || '').length}/2000</span>
          </div>
        </div>

        {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Please fix the highlighted fields before continuing.
          </p>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
