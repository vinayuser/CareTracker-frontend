import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import AssessorPhotoUpload from '../../ui/AssessorPhotoUpload';
import { CarePlanIconBadge } from './carePlanIcons';
import {
  CARE_NEED_AREAS, GENDERS, REVIEW_FREQUENCIES, RISK_LEVELS,
} from '../../../utils/carePlanForm';
import { carePlanFieldMaxLength } from '../../../utils/carePlanFormValidation';
import { RELATIONSHIPS } from '../../../utils/leadForm';
import { Fragment } from 'react';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100';
const inputErrorClass = 'w-full rounded-xl border border-red-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200';
const readOnlyClass = 'w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const lockShellClass = 'pointer-events-none select-none [&_input]:bg-gray-50 [&_textarea]:bg-gray-50 [&_select]:bg-gray-50 [&_button]:cursor-default [&_canvas]:cursor-default';

function fieldClass(hasError) {
  return hasError ? inputErrorClass : inputClass;
}

function LockShell({ locked, children, className = '' }) {
  if (!locked) return children;
  return (
    <div className={`${lockShellClass} ${className}`.trim()} aria-disabled="true">
      {children}
    </div>
  );
}

function Field({ label, required, children, className = '', error }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function ReadField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className={labelClass}>{label}</p>
      <div className={readOnlyClass}>{value || '—'}</div>
    </div>
  );
}

function InputOrRead({
  label, value, onChange, readOnly, type = 'text', rows, className = '',
  fieldKey = '', error = '', inputMode, placeholder,
}) {
  if (readOnly) {
    return <ReadField label={label} value={value} className={className} />;
  }
  const maxLength = fieldKey ? carePlanFieldMaxLength(fieldKey) : undefined;
  return (
    <Field label={label} className={className} error={error}>
      {rows ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          className={fieldClass(error)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          inputMode={inputMode}
          className={fieldClass(error)}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

function Section({ n, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">{n}</span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chips({ label, options, values, onToggle, single, disabled = false }) {
  if (disabled) {
    const display = single ? values : (values || []).join(', ');
    return (
      <div>
        {label && <p className={labelClass}>{label}</p>}
        <div className={readOnlyClass}>{display || '—'}</div>
      </div>
    );
  }
  return (
    <div>
      {label && <p className={labelClass}>{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = single ? values === opt : (values || []).includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${on ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {['Yes', 'No'].map((t) => (
        <button key={t} type="button" onClick={() => onChange(t === 'Yes')} className={`rounded-lg border px-3 py-1.5 text-sm ${value === (t === 'Yes') ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200'}`}>{t}</button>
      ))}
    </div>
  );
}

function YesNoNull({ label, value, onChange, disabled = false }) {
  if (disabled) {
    const display = value === true ? 'Yes' : value === false ? 'No' : '—';
    return (
      <div>
        <p className={labelClass}>{label}</p>
        <div className={readOnlyClass}>{display}</div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {['Yes', 'No'].map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(value === (t === 'Yes') ? null : t === 'Yes')}
          className={`rounded-lg border px-3 py-1.5 text-sm ${value === (t === 'Yes') ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function CarePlanStepOne({
  form, clients, clientId, onClientChange, onHeaderChange, onFormDataChange, agencyName = '',
  clientInfoLocked = false,
  readOnly = false,
  errors = {},
}) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const patch = (section, field) => (value) => onFormDataChange(section, { [field]: value });
  const ci = d.clientInfo;
  const med = d.medicalInfo;
  const sup = d.supplementary;
  const assessor = d.assessor;
  const locked = Boolean(clientInfoLocked) || readOnly;
  const max = carePlanFieldMaxLength;

  return (
    <LockShell locked={readOnly}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5">
          <p className="text-center text-lg font-bold uppercase tracking-wide text-violet-800">Care Plan</p>
          <p className="text-center text-sm text-gray-500">Person-Centered. Compassionate. Consistent.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReadField label="Agency Name" value={agencyName} />
            <ReadField label="Plan ID" value={form.planCode || 'Auto-generated on save'} />
            <Field label="Effective Date">
              <input type="date" value={form.effectiveDate} onChange={(e) => onHeaderChange('effectiveDate', e.target.value)} className={inputClass} readOnly={readOnly} />
            </Field>
            <Field label="Review Date">
              <input type="date" value={form.reviewDate} onChange={(e) => onHeaderChange('reviewDate', e.target.value)} className={inputClass} readOnly={readOnly} />
            </Field>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Client ID">
              <input
                value={ci.clientId || clients.find((c) => String(c.id) === String(clientId))?.clientCode || ''}
                onChange={set('clientInfo', 'clientId')}
                maxLength={max('clientId')}
                className={inputClass}
                readOnly={readOnly}
              />
            </Field>
            <Field label="Version">
              <input value={form.version || 'v1'} readOnly className={`${inputClass} bg-gray-50 text-gray-600`} title="Version is updated automatically on save" />
            </Field>
            {!form.planCode && !readOnly && (
              <Field label="Select Client *" error={errors.clientId}>
                <select value={clientId} onChange={(e) => onClientChange(e.target.value)} className={fieldClass(errors.clientId)}>
                  <option value="">Choose a client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName} ({c.clientCode})</option>)}
                </select>
              </Field>
            )}
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border-2 border-violet-700">
            <div className="bg-violet-700 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
              Care Plan Assessor
            </div>
            <div className="flex flex-col gap-4 bg-violet-50/40 p-4 lg:flex-row lg:items-start">
              <div className="flex w-full shrink-0 flex-col items-center border-b border-violet-200 pb-4 lg:w-48 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
                <AssessorPhotoUpload
                  label=""
                  shape="square"
                  layout="stack"
                  className="w-full"
                  value={assessor.photo}
                  onChange={(photo) => onFormDataChange('assessor', { ...assessor, photo })}
                  readOnly={readOnly}
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input value={assessor.name} onChange={set('assessor', 'name')} maxLength={max('name')} className={inputClass} readOnly={readOnly} />
                </Field>
                <Field label="Title">
                  <input value={assessor.title} onChange={set('assessor', 'title')} maxLength={max('title')} className={inputClass} placeholder="Care Assessment Specialist" readOnly={readOnly} />
                </Field>
                <Field label="Phone" error={errors['assessor.phone']}>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="(555) 123-4567"
                    value={assessor.phone}
                    onChange={set('assessor', 'phone')}
                    maxLength={max('phone')}
                    className={fieldClass(errors['assessor.phone'])}
                    readOnly={readOnly}
                  />
                </Field>
                <Field label="Email" error={errors['assessor.email']}>
                  <input
                    type="email"
                    value={assessor.email}
                    onChange={set('assessor', 'email')}
                    maxLength={max('email')}
                    className={fieldClass(errors['assessor.email'])}
                    readOnly={readOnly}
                  />
                </Field>
                <Field label="Date Assessed" className="sm:col-span-2">
                  <input type="date" value={assessor.dateAssessed} onChange={set('assessor', 'dateAssessed')} className={inputClass} readOnly={readOnly} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        <Section
          n="1"
          title="Client Information"
          subtitle={locked ? 'From the client record — display only. Update the client profile to change these.' : 'Basic demographics and emergency contact'}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputOrRead label="Client Name" fieldKey="clientName" value={ci.clientName} onChange={patch('clientInfo', 'clientName')} readOnly={locked} className="sm:col-span-2" />
            <InputOrRead label="Date of Birth" type="date" value={ci.dob} onChange={patch('clientInfo', 'dob')} readOnly={locked} />
            <InputOrRead label="Address" fieldKey="address" value={ci.address} onChange={patch('clientInfo', 'address')} readOnly={locked} className="sm:col-span-2" />
            <InputOrRead label="City" fieldKey="city" value={ci.city} onChange={patch('clientInfo', 'city')} readOnly={locked} />
            <InputOrRead label="State" fieldKey="state" value={ci.state} onChange={patch('clientInfo', 'state')} readOnly={locked} placeholder="TX" />
            <InputOrRead label="ZIP" fieldKey="zip" value={ci.zip} onChange={patch('clientInfo', 'zip')} readOnly={locked} error={errors['clientInfo.zip']} inputMode="numeric" placeholder="78701" />
            <InputOrRead label="Phone" fieldKey="phone" type="tel" value={ci.phone} onChange={patch('clientInfo', 'phone')} readOnly={locked} error={errors['clientInfo.phone']} inputMode="tel" placeholder="(555) 123-4567" />
            <InputOrRead label="Email" fieldKey="email" type="email" value={ci.email} onChange={patch('clientInfo', 'email')} readOnly={locked} error={errors['clientInfo.email']} />
            <InputOrRead label="Primary Language" fieldKey="primaryLanguage" value={ci.primaryLanguage} onChange={patch('clientInfo', 'primaryLanguage')} readOnly={locked} />
            <Chips
              label="Gender"
              options={GENDERS}
              values={ci.gender}
              single
              disabled={locked}
              onToggle={(g) => onFormDataChange('clientInfo', { gender: ci.gender === g ? '' : g })}
            />
            <InputOrRead label="Marital Status" fieldKey="maritalStatus" value={ci.maritalStatus} onChange={patch('clientInfo', 'maritalStatus')} readOnly={locked} />
            <InputOrRead label="Emergency Contact" fieldKey="emergencyContact" value={ci.emergencyContact} onChange={patch('clientInfo', 'emergencyContact')} readOnly={locked} />
            {locked ? (
              <InputOrRead label="Relationship" fieldKey="emergencyRelationship" value={ci.emergencyRelationship} onChange={patch('clientInfo', 'emergencyRelationship')} readOnly={locked} />
            ) : (
              <Field label="Relationship">
                <select
                  className={inputClass}
                  value={ci.emergencyRelationship || ''}
                  onChange={(e) => onFormDataChange('clientInfo', { emergencyRelationship: e.target.value })}
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  {ci.emergencyRelationship && !RELATIONSHIPS.includes(ci.emergencyRelationship) ? (
                    <option value={ci.emergencyRelationship}>{ci.emergencyRelationship}</option>
                  ) : null}
                </select>
              </Field>
            )}
            <InputOrRead label="Emergency Phone" fieldKey="emergencyPhone" type="tel" value={ci.emergencyPhone} onChange={patch('clientInfo', 'emergencyPhone')} readOnly={locked} error={errors['clientInfo.emergencyPhone']} inputMode="tel" placeholder="(555) 123-4567" />
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section n="2" title="Medical Information">
            <Field label="Primary Diagnosis / Condition">
              <textarea value={med.primaryDiagnosis} onChange={set('medicalInfo', 'primaryDiagnosis')} rows={2} maxLength={max('primaryDiagnosis')} className={inputClass} readOnly={readOnly} />
            </Field>
            <Field label="Other Diagnoses / Conditions">
              <textarea value={med.otherDiagnoses} onChange={set('medicalInfo', 'otherDiagnoses')} rows={2} maxLength={max('otherDiagnoses')} className={inputClass} readOnly={readOnly} />
            </Field>
            <Field label="Allergies">
              <input value={med.allergies} onChange={set('medicalInfo', 'allergies')} maxLength={max('allergies')} className={inputClass} readOnly={readOnly} />
            </Field>
            <Field label="Physician / Provider">
              <input value={med.physician} onChange={set('medicalInfo', 'physician')} maxLength={max('physician')} className={inputClass} readOnly={readOnly} />
            </Field>
            <Field label="Physician Phone" error={errors['medicalInfo.physicianPhone']}>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(555) 123-4567"
                value={med.physicianPhone}
                onChange={set('medicalInfo', 'physicianPhone')}
                maxLength={max('physicianPhone')}
                className={fieldClass(errors['medicalInfo.physicianPhone'])}
                readOnly={readOnly}
              />
            </Field>
            <Field label="Special Instructions / Precautions">
              <textarea value={med.specialInstructions} onChange={set('medicalInfo', 'specialInstructions')} rows={2} maxLength={max('specialInstructions')} className={inputClass} readOnly={readOnly} />
            </Field>
          </Section>

          <Section n="3" title="Client Goals" subtitle="What matters most">
            {d.clientGoals.map((goal, i) => (
              <Field key={i} label={`${i + 1}.`}>
                <input
                  value={goal}
                  onChange={(e) => {
                    const goals = [...d.clientGoals];
                    goals[i] = e.target.value;
                    onFormDataChange('clientGoals', goals, true);
                  }}
                  maxLength={100}
                  className={inputClass}
                  readOnly={readOnly}
                />
              </Field>
            ))}
          </Section>

          <Section n="4" title="Supplementary Items">
            <YesNoNull label="Advance Directives on File" value={sup.advanceDirectives} onChange={(v) => onFormDataChange('supplementary', { advanceDirectives: v })} disabled={readOnly} />
            <YesNoNull label="DNR / POLST" value={sup.dnrPolst} onChange={(v) => onFormDataChange('supplementary', { dnrPolst: v })} disabled={readOnly} />
            <Field label="Preferred Hospital"><input value={sup.preferredHospital} onChange={set('supplementary', 'preferredHospital')} maxLength={max('preferredHospital')} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Household Members / Caregivers"><input value={sup.householdMembers} onChange={set('supplementary', 'householdMembers')} maxLength={max('householdMembers')} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Preferred Pharmacy"><input value={sup.preferredPharmacy} onChange={set('supplementary', 'preferredPharmacy')} maxLength={max('preferredPharmacy')} className={inputClass} readOnly={readOnly} /></Field>
            <YesNoNull label="Transportation Needs" value={sup.transportationNeeds} onChange={(v) => onFormDataChange('supplementary', { transportationNeeds: v })} disabled={readOnly} />
            <YesNoNull label="Interpreter Needed" value={sup.interpreterNeeded} onChange={(v) => onFormDataChange('supplementary', { interpreterNeeded: v })} disabled={readOnly} />
            <Field label="Health Insurance"><input value={sup.healthInsurance} onChange={set('supplementary', 'healthInsurance')} maxLength={max('healthInsurance')} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Policy / ID #"><input value={sup.policyId} onChange={set('supplementary', 'policyId')} maxLength={max('policyId')} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Cultural / Spiritual Considerations"><textarea value={sup.culturalSpiritual} onChange={set('supplementary', 'culturalSpiritual')} rows={2} maxLength={max('culturalSpiritual')} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Other Notes"><textarea value={sup.otherNotes} onChange={set('supplementary', 'otherNotes')} rows={2} maxLength={max('otherNotes')} className={inputClass} readOnly={readOnly} /></Field>
          </Section>
        </div>
      </div>
    </LockShell>
  );
}

export function CarePlanStepTwo({
  form,
  onFormDataChange,
  caregivers = [],
  agencyMembers = [],
  readOnly = false,
  clientSignatureEditable = false,
}) {
  const d = form.formData;
  const risk = d.riskAssessment;
  const review = d.carePlanReview;
  const auth = d.authorization;
  const sig = d.signatures;
  const clientName = d.clientInfo?.clientName || '';

  const caregiverOptions = caregivers
    .filter((c) => c.status !== 'Inactive')
    .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

  const memberOptions = agencyMembers
    .filter((m) => m?.name)
    .slice()
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const resolveStaffId = (row) => {
    if (row.responsibleStaffId) return row.responsibleStaffId;
    if (!row.responsibleStaff) return '';
    const match = caregiverOptions.find((c) => c.fullName === row.responsibleStaff);
    return match?.id || '';
  };

  const updateCareNeed = (index, patch) => {
    const rows = [...d.careNeeds];
    rows[index] = { ...rows[index], ...patch };
    onFormDataChange('careNeeds', rows, true);
  };

  const toggleIntervention = (rowIndex, key) => {
    const row = d.careNeeds[rowIndex];
    const interventions = { ...row.interventions, [key]: !row.interventions[key] };
    updateCareNeed(rowIndex, { interventions });
  };

  const sigBlocks = [
    { key: 'clientRep', label: 'Client / Legal Representative' },
    { key: 'agencyStaff', label: 'Agency Staff / Care Coordinator' },
    { key: 'supervisor', label: 'Supervisor / Manager' },
  ];

  return (
    <div className="space-y-6">
      <LockShell locked={readOnly}>
        <Section n="5" title="Care Needs & Interventions" subtitle="Goals, services, frequency, staff, and visit timing for schedules">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b bg-violet-50 text-left text-xs font-semibold uppercase tracking-wide text-violet-800">
                  <th className="px-3 py-3">Area of Need</th>
                  <th className="px-3 py-3">Goals / Expected Outcomes</th>
                  <th className="px-3 py-3">Interventions / Services</th>
                  <th className="px-3 py-3 w-28">Frequency</th>
                  <th className="px-3 py-3 w-40">Responsible Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {d.careNeeds.map((row, i) => {
                  const areaDef = CARE_NEED_AREAS.find((a) => a.key === row.areaKey) || CARE_NEED_AREAS[i];
                  const days = row.scheduleDays || [];
                  return (
                    <Fragment key={row.areaKey}>
                    <tr className="align-top">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <CarePlanIconBadge name={row.icon || areaDef?.icon} size={16} className="h-8 w-8 rounded-lg" />
                          <span className="font-semibold text-gray-900">{row.areaLabel}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <textarea value={row.goalsOutcomes} onChange={(e) => updateCareNeed(i, { goalsOutcomes: e.target.value })} rows={3} className={inputClass} readOnly={readOnly} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1.5">
                          {areaDef?.interventions.map((int) => (
                            <label key={int.key} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                              <input type="checkbox" checked={!!row.interventions[int.key]} onChange={() => toggleIntervention(i, int.key)} className="rounded border-gray-300 text-violet-600" disabled={readOnly} />
                              {int.label}
                            </label>
                          ))}
                          {(row.interventions.other || row.interventions.custom) && (
                            <input value={row.interventions.otherText || ''} onChange={(e) => updateCareNeed(i, { interventions: { ...row.interventions, otherText: e.target.value } })} placeholder="Specify other..." className={inputClass} readOnly={readOnly} />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3"><input value={row.frequency} onChange={(e) => updateCareNeed(i, { frequency: e.target.value })} className={inputClass} readOnly={readOnly} /></td>
                      <td className="px-3 py-3">
                        {readOnly ? (
                          <div className={readOnlyClass}>{row.responsibleStaff || '—'}</div>
                        ) : (
                          <select
                            value={resolveStaffId(row)}
                            onChange={(e) => {
                              const selected = caregiverOptions.find((c) => c.id === e.target.value);
                              updateCareNeed(i, {
                                responsibleStaffId: e.target.value,
                                responsibleStaff: selected?.fullName || '',
                              });
                            }}
                            className={inputClass}
                          >
                            <option value="">Select caregiver</option>
                            {caregiverOptions.map((cg) => (
                              <option key={cg.id} value={cg.id}>
                                {cg.fullName}{cg.status !== 'Active' ? ` (${cg.status})` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                    {(resolveStaffId(row) || (readOnly && (row.scheduleDays?.length || row.startTime || row.endTime))) && (
                      <tr className="bg-violet-50/40">
                        <td colSpan={5} className="px-3 py-3">
                          <div className="grid gap-3 sm:grid-cols-4">
                            <div className="sm:col-span-2">
                              <p className="mb-1.5 text-xs font-medium text-gray-600">Visit days</p>
                              <div className="flex flex-wrap gap-1.5">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                  const active = days.includes(day);
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => {
                                        const next = active ? days.filter((d) => d !== day) : [...days, day];
                                        updateCareNeed(i, { scheduleDays: next });
                                      }}
                                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                                        active ? 'bg-violet-600 text-white' : 'border border-gray-200 bg-white text-gray-600'
                                      }`}
                                    >
                                      {day}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-gray-600">Start</p>
                              <input type="time" value={row.startTime || ''} onChange={(e) => updateCareNeed(i, { startTime: e.target.value })} className={inputClass} readOnly={readOnly} />
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-gray-600">End</p>
                              <input type="time" value={row.endTime || ''} onChange={(e) => updateCareNeed(i, { endTime: e.target.value })} className={inputClass} readOnly={readOnly} />
                            </div>
                            <div>
                              <p className="mb-1.5 text-xs font-medium text-gray-600">Clock-in grace</p>
                              {readOnly ? (
                                <div className={readOnlyClass}>{row.graceMinutes || 15} minutes</div>
                              ) : (
                                <select
                                  value={row.graceMinutes || 15}
                                  onChange={(e) => updateCareNeed(i, { graceMinutes: Number(e.target.value) })}
                                  className={inputClass}
                                >
                                  <option value={15}>15 minutes</option>
                                  <option value={30}>30 minutes</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Section n="6" title="Risk Assessment">
            {['fallRisk', 'skinRisk', 'elopementRisk'].map((key) => (
              <div key={key}>
                <p className="mb-1.5 text-sm font-medium text-gray-700">{key === 'fallRisk' ? 'Fall Risk' : key === 'skinRisk' ? 'Skin Risk' : 'Elopement Risk'}</p>
                <Chips options={RISK_LEVELS} values={risk[key]} single disabled={readOnly} onToggle={(v) => onFormDataChange('riskAssessment', { ...risk, [key]: risk[key] === v ? '' : v })} />
              </div>
            ))}
            <Field label="Other Risk(s)"><input value={risk.otherRisks} onChange={(e) => onFormDataChange('riskAssessment', { ...risk, otherRisks: e.target.value })} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Risk Notes / Plan"><textarea value={risk.riskNotes} onChange={(e) => onFormDataChange('riskAssessment', { ...risk, riskNotes: e.target.value })} rows={2} className={inputClass} readOnly={readOnly} /></Field>
          </Section>

          <Section n="7" title="Care Plan Review">
            <p className="text-sm text-gray-600">This care plan will be reviewed:</p>
            <Chips options={REVIEW_FREQUENCIES} values={review.frequencies} disabled={readOnly} onToggle={(f) => {
              const arr = review.frequencies || [];
              onFormDataChange('carePlanReview', { ...review, frequencies: arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f] });
            }} />
            {review.frequencies?.includes('Other') && (
              <Field label="Other (specify)"><input value={review.frequencyOther} onChange={(e) => onFormDataChange('carePlanReview', { ...review, frequencyOther: e.target.value })} className={inputClass} readOnly={readOnly} /></Field>
            )}
            <Field label="Next Review Date"><input type="date" value={review.nextReviewDate} onChange={(e) => onFormDataChange('carePlanReview', { ...review, nextReviewDate: e.target.value })} className={inputClass} readOnly={readOnly} /></Field>
            <Field label="Reason for Review"><textarea value={review.reasonForReview} onChange={(e) => onFormDataChange('carePlanReview', { ...review, reasonForReview: e.target.value })} rows={2} className={inputClass} readOnly={readOnly} /></Field>
          </Section>

          <Section n="8" title="Authorization">
            <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
              I have reviewed this care plan and agree with the goals and interventions.
            </p>
            <Field label="Client / Legal Representative Name"><input value={auth.representativeName} onChange={(e) => onFormDataChange('authorization', { ...auth, representativeName: e.target.value })} className={inputClass} readOnly={readOnly} /></Field>
            <DigitalSignaturePad label="Signature" value={auth.signature} onChange={(v) => onFormDataChange('authorization', { ...auth, signature: v })} readOnly={readOnly} />
            <Field label="Date"><input type="date" value={auth.date} onChange={(e) => onFormDataChange('authorization', { ...auth, date: e.target.value })} className={inputClass} readOnly={readOnly} /></Field>
          </Section>
        </div>
      </LockShell>

      <Section
        n="9"
        title="Signatures"
        subtitle={clientSignatureEditable
          ? 'Review the plan above, then sign as Client / Legal Representative'
          : 'Digital signatures for client, agency staff, and supervisor'}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {sigBlocks.map(({ key, label }) => {
            const editable = key === 'clientRep' && clientSignatureEditable;
            const locked = readOnly && !editable;
            return (
              <div
                key={key}
                className={`space-y-3 rounded-xl border p-4 ${
                  editable ? 'border-violet-300 bg-violet-50/40 ring-2 ring-violet-100' : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <p className="text-sm font-semibold text-violet-800">{label}</p>
                {editable && (
                  <p className="rounded-lg bg-white/80 px-2.5 py-1.5 text-xs text-violet-700">
                    This is the only section you can edit. Sign below, then submit.
                  </p>
                )}
                <LockShell locked={locked}>
                  <div className="space-y-3">
                    <Field label="Name">
                      {key === 'clientRep' ? (
                        <input
                          value={sig[key]?.name || clientName || ''}
                          onChange={(e) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], name: e.target.value } })}
                          className={inputClass}
                          readOnly={locked || (!clientSignatureEditable && Boolean(clientName))}
                          placeholder="Client name"
                        />
                      ) : locked ? (
                        <div className={readOnlyClass}>{sig[key]?.name || '—'}</div>
                      ) : (
                        <select
                          value={
                            memberOptions.some((m) => m.name === (sig[key]?.name || ''))
                              ? (sig[key]?.name || '')
                              : (sig[key]?.name ? `__custom__:${sig[key].name}` : '')
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            const name = raw.startsWith('__custom__:') ? raw.slice('__custom__:'.length) : raw;
                            onFormDataChange('signatures', {
                              ...sig,
                              [key]: { ...sig[key], name },
                            });
                          }}
                          className={inputClass}
                        >
                          <option value="">Select agency member</option>
                          {memberOptions.map((m) => (
                            <option key={m.id} value={m.name}>
                              {m.name}{m.role ? ` (${m.role})` : ''}
                            </option>
                          ))}
                          {sig[key]?.name && !memberOptions.some((m) => m.name === sig[key].name) ? (
                            <option value={`__custom__:${sig[key].name}`}>{sig[key].name}</option>
                          ) : null}
                        </select>
                      )}
                    </Field>
                    <DigitalSignaturePad
                      label="Signature"
                      value={sig[key]?.signature || ''}
                      onChange={(v) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], signature: v } })}
                      readOnly={locked}
                    />
                    <Field label="Date">
                      <input
                        type="date"
                        value={sig[key]?.date || ''}
                        onChange={(e) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], date: e.target.value } })}
                        className={inputClass}
                        readOnly={locked}
                      />
                    </Field>
                  </div>
                </LockShell>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
