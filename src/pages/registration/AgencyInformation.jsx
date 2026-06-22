import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ROUTES } from '../../routes/routes';
import { getInviteSession } from '../../utils/invitationStore';
import { getRegistrationData, updateRegistrationData } from '../../utils/registrationStore';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

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

export default function AgencyInformation() {
  const navigate = useNavigate();
  const inviteSession = getInviteSession();
  const [form, setForm] = useState(() => getRegistrationData());
  const [areaInput, setAreaInput] = useState('');

  useEffect(() => {
    if (!inviteSession) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [inviteSession, navigate]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const handleNext = (e) => {
    e.preventDefault();
    updateRegistrationData(form);
    navigate(ROUTES.REGISTRATION_CREATE_ACCOUNT);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Agency Information</h1>
      <p className="mt-1 text-sm text-gray-500">Please provide your agency details.</p>

      <form onSubmit={handleNext} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Agency Name *</label>
            <input
              type="text"
              required
              value={form.agencyName}
              onChange={(e) => updateField('agencyName', e.target.value)}
              placeholder="Enter agency name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Agency Type *</label>
            <select
              required
              value={form.agencyType}
              onChange={(e) => updateField('agencyType', e.target.value)}
              className={inputClass}
            >
              <option value="">Select agency type</option>
              {AGENCY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Year Established</label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={form.yearEstablished}
              onChange={(e) => updateField('yearEstablished', e.target.value)}
              placeholder="e.g. 2015"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="contact@agency.com"
              className={inputClass}
              readOnly={Boolean(inviteSession?.email)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              placeholder="https://www.example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address *</label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Street, city, state, ZIP"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Service Areas</label>
          <select
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
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Agency Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Brief description of your agency and services..."
            className={inputClass}
          />
        </div>

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
