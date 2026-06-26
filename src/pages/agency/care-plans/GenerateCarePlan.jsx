import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  MapPin,
  Phone,
  Pencil,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  UserRound,
  Home,
} from 'lucide-react';
import CarePlanStepper from '../../../components/agency/care-plans/CarePlanStepper';
import { CarePlanIconBadge } from '../../../components/agency/care-plans/carePlanIcons';
import {
  ASSESSMENT_FIELDS,
  CARE_OVERVIEW_CATEGORIES,
  DEFAULT_SERVICES,
  SERVICE_DURATIONS,
  SERVICE_FREQUENCIES,
  SERVICE_PROVIDERS,
  buildDefaultAssessment,
  getServiceIcon,
} from '../../../constants/carePlanOptions';
import { fetchClients } from '../../../redux/slices/clientsSlice';
import {
  createCarePlan,
  fetchCarePlan,
  updateCarePlan,
} from '../../../redux/slices/carePlansSlice';
import { ROUTES } from '../../../routes/routes';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const selectClass = 'w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100';

function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-2 text-sm">
      {Icon && <Icon size={15} className="mt-0.5 shrink-0 text-violet-400" />}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 text-gray-800">{value || '—'}</p>
      </div>
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={selectClass}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

export default function GenerateCarePlan() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { list: clients } = useSelector((state) => state.clients);
  const { selected: existingPlan } = useSelector((state) => state.carePlans);

  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState(searchParams.get('clientId') || '');
  const [assessment, setAssessment] = useState(buildDefaultAssessment());
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [services, setServices] = useState(DEFAULT_SERVICES.map((s) => ({ ...s })));
  const [effectiveDate, setEffectiveDate] = useState(formatDisplayDate());
  const [reviewDate, setReviewDate] = useState(formatDisplayDate(addMonths(new Date(), 1)));
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    dispatch(fetchClients());
    if (isEdit) {
      dispatch(fetchCarePlan(id)).finally(() => setLoading(false));
    }
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (!existingPlan || !isEdit) return;
    setClientId(existingPlan.clientId);
    setAssessment({ ...buildDefaultAssessment(), ...existingPlan.assessment });
    setAssessmentNotes(existingPlan.assessmentNotes || '');
    setServices(
      existingPlan.services?.length
        ? existingPlan.services.map((s) => ({ icon: getServiceIcon(s.category), ...s }))
        : DEFAULT_SERVICES.map((x) => ({ ...x })),
    );
    setEffectiveDate(existingPlan.effectiveDate || formatDisplayDate());
    setReviewDate(existingPlan.reviewDate || formatDisplayDate(addMonths(new Date(), 1)));
  }, [existingPlan, isEdit]);

  const client = useMemo(
    () => clients.find((c) => c.id === clientId) || existingPlan?.client || null,
    [clients, clientId, existingPlan],
  );

  const updateService = (index, field, value) => {
    setServices((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addCustomService = () => {
    setServices((prev) => [...prev, {
      enabled: true,
      icon: 'Sparkles',
      category: 'Custom Service',
      description: '',
      frequency: 'As needed',
      duration: '30 mins',
      provider: 'Care Giver',
      notes: '',
    }]);
  };

  const removeService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const payload = {
    clientId,
    status: 'Active',
    effectiveDate,
    reviewDate,
    assessment,
    assessmentNotes,
    services: services.map(({ icon, ...rest }) => rest),
  };

  const handleSubmit = async () => {
    if (!clientId) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await dispatch(updateCarePlan({ id, payload })).unwrap();
      } else {
        await dispatch(createCarePlan(payload)).unwrap();
      }
      navigate(ROUTES.AGENCY_CARE_PLANS);
    } catch {
      // toast in slice
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading care plan...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Generate Care Plan</h1>
          <p className="mt-1 text-sm text-gray-500">Create a personalized care plan for your client</p>
        </div>
        <Link
          to={ROUTES.AGENCY_CARE_PLANS}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Back to Care Plans
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <CarePlanStepper currentStep={step} />

        {step === 1 && (
          <div className="space-y-6">
            {!isEdit && (
              <div className="max-w-md">
                <label className="mb-2 block text-sm font-semibold text-gray-800">Select Client *</label>
                <div className="relative">
                  <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectClass}>
                    <option value="">Choose a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.clientCode})</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            {client ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 lg:col-span-3">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
                        {client.firstName?.[0]}{client.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{client.fullName}</h3>
                        <p className="text-sm font-medium text-violet-600">{client.clientCode}</p>
                      </div>
                    </div>
                    <Link
                      to={ROUTES.AGENCY_CLIENTS_EDIT.replace(':id', client.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoRow
                      label="Age / Gender"
                      value={`${client.age ? `${client.age} Years` : '—'}${client.gender ? ` · ${client.gender}` : ''}`}
                      icon={UserRound}
                    />
                    <InfoRow label="Phone" value={client.phone} icon={Phone} />
                    <InfoRow label="Address" value={client.address} icon={MapPin} />
                    <InfoRow label="Living Arrangement" value={client.livingArrangement} icon={Home} />
                  </div>

                  <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900">Medical & Status Info</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InfoRow label="Primary Diagnosis" value={client.primaryDiagnosis} />
                      <InfoRow label="Allergies" value={client.allergies} />
                      <InfoRow label="Mobility" value={client.mobility} />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900">Emergency Contact</h4>
                    <p className="text-sm text-gray-800">
                      {client.emergencyContactName || '—'}
                      {client.emergencyContactRelationship ? ` · ${client.emergencyContactRelationship}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">{client.emergencyContactPhone || '—'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6 lg:col-span-2">
                  <h4 className="mb-5 text-base font-bold text-gray-900">Care Plan Overview</h4>
                  <ul className="space-y-4">
                    {CARE_OVERVIEW_CATEGORIES.map((item) => (
                      <li key={item.key} className="flex items-center gap-3">
                        <CarePlanIconBadge name={item.icon} size={17} className="h-9 w-9 rounded-lg" />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-12 text-center">
                <CarePlanIconBadge name="User" className="mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Select a client to view their information</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Assessment Information</h3>
              <p className="mt-1 text-sm text-gray-500">Evaluate the client across key care categories</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ASSESSMENT_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <CarePlanIconBadge name={field.icon} size={17} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{field.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{field.description}</p>
                    </div>
                  </div>
                  <SelectField
                    value={assessment[field.key] || field.default}
                    onChange={(e) => setAssessment((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    options={field.options}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
              <label className="mb-2 block text-sm font-semibold text-gray-900">Notes</label>
              <textarea
                value={assessmentNotes}
                onChange={(e) => setAssessmentNotes(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Add any additional notes or observations..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Service Details</h3>
                <p className="mt-1 text-sm text-gray-500">Define services, frequency, and care providers</p>
              </div>
              <button
                type="button"
                onClick={addCustomService}
                className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                <Plus size={16} /> Add Custom Service
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-[1000px] w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">Service Category</th>
                    <th className="px-4 py-3">Service Description</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Notes / Instructions</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {services.map((service, index) => (
                    <tr key={index} className={service.enabled ? 'hover:bg-violet-50/30' : 'opacity-45'}>
                      <td className="px-4 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={service.enabled}
                          onChange={(e) => updateService(index, 'enabled', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <CarePlanIconBadge
                            name={service.icon || getServiceIcon(service.category)}
                            size={15}
                            className="h-8 w-8 rounded-lg"
                          />
                          <span className="font-semibold text-gray-900">{service.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <SelectField
                          value={service.frequency}
                          onChange={(e) => updateService(index, 'frequency', e.target.value)}
                          options={SERVICE_FREQUENCIES}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <SelectField
                          value={service.duration}
                          onChange={(e) => updateService(index, 'duration', e.target.value)}
                          options={SERVICE_DURATIONS}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <SelectField
                          value={service.provider}
                          onChange={(e) => updateService(index, 'provider', e.target.value)}
                          options={SERVICE_PROVIDERS}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          value={service.notes}
                          onChange={(e) => updateService(index, 'notes', e.target.value)}
                          className={inputClass}
                          placeholder="Instructions"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
              <Info size={18} className="mt-0.5 shrink-0 text-violet-600" />
              <p>
                Care plan will be effective from <strong>{effectiveDate}</strong> and will be reviewed on a monthly basis or as needed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Effective Date</label>
                <input value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Review Date</label>
                <input value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && client && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
              <h3 className="text-lg font-bold text-gray-900">{client.fullName}</h3>
              <p className="text-sm text-violet-700">{client.clientCode} · Effective {effectiveDate}</p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Assessment Summary</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ASSESSMENT_FIELDS.map((field) => (
                  <div key={field.key} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CarePlanIconBadge name={field.icon} size={14} className="h-7 w-7 rounded-lg" />
                      <p className="text-xs font-semibold text-gray-500">{field.label}</p>
                    </div>
                    <p className="text-sm font-bold text-violet-700">{assessment[field.key]}</p>
                  </div>
                ))}
              </div>
              {assessmentNotes && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="mb-1 font-semibold text-gray-900">Notes</p>
                  {assessmentNotes}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">
                Services ({services.filter((s) => s.enabled).length} enabled)
              </h4>
              <div className="space-y-3">
                {services.filter((s) => s.enabled).map((service, index) => (
                  <div key={index} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4">
                    <CarePlanIconBadge name={service.icon || getServiceIcon(service.category)} size={16} />
                    <div>
                      <p className="font-semibold text-gray-900">{service.category}</p>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="mt-1 text-xs font-medium text-violet-600">
                        {service.frequency} · {service.duration} · {service.provider}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <Link
                to={ROUTES.AGENCY_CARE_PLANS}
                className="inline-block rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </Link>
            )}
          </div>
          <div>
            {step < 4 ? (
              <button
                type="button"
                disabled={step === 1 && !clientId}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 disabled:opacity-50"
              >
                {step === 1 ? 'Next: Assessment' : step === 2 ? 'Next: Service Details' : 'Next: Review & Generate'}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || !clientId}
                onClick={handleSubmit}
                className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : isEdit ? 'Update Care Plan' : 'Generate Care Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
