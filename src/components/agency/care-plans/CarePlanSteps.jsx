import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import AssessorPhotoUpload from '../../ui/AssessorPhotoUpload';
import { CarePlanIconBadge } from './carePlanIcons';
import {
  CARE_NEED_AREAS, GENDERS, REVIEW_FREQUENCIES, RISK_LEVELS,
} from '../../../utils/carePlanForm';
import { Fragment } from 'react';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
    </div>
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

function Chips({ label, options, values, onToggle, single }) {
  return (
    <div>
      {label && <p className={labelClass}>{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = single ? values === opt : (values || []).includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onToggle(opt)} className={`rounded-xl border px-3 py-2 text-sm font-medium ${on ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt}</button>
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

function YesNoNull({ label, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {['Yes', 'No'].map((t) => (
        <button key={t} type="button" onClick={() => onChange(value === (t === 'Yes') ? null : t === 'Yes')} className={`rounded-lg border px-3 py-1.5 text-sm ${value === (t === 'Yes') ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200'}`}>{t}</button>
      ))}
    </div>
  );
}

export function CarePlanStepOne({
  form, clients, clientId, onClientChange, onHeaderChange, onFormDataChange, agencyName = '',
}) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const ci = d.clientInfo;
  const med = d.medicalInfo;
  const sup = d.supplementary;
  const assessor = d.assessor;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5">
        <p className="text-center text-lg font-bold uppercase tracking-wide text-violet-800">Care Plan</p>
        <p className="text-center text-sm text-gray-500">Person-Centered. Compassionate. Consistent.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Agency Name"><input value={agencyName} readOnly className={`${inputClass} bg-gray-50`} /></Field>
          <Field label="Plan ID"><input value={form.planCode || 'Auto-generated on save'} readOnly className={`${inputClass} bg-gray-50`} /></Field>
          <Field label="Effective Date"><input value={form.effectiveDate} onChange={(e) => onHeaderChange('effectiveDate', e.target.value)} className={inputClass} /></Field>
          <Field label="Review Date"><input value={form.reviewDate} onChange={(e) => onHeaderChange('reviewDate', e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Client ID"><input value={ci.clientId} onChange={set('clientInfo', 'clientId')} className={inputClass} /></Field>
          <Field label="Version"><input value={form.version} onChange={(e) => onHeaderChange('version', e.target.value)} className={inputClass} /></Field>
          {!form.planCode && (
            <Field label="Select Client *">
              <select value={clientId} onChange={(e) => onClientChange(e.target.value)} className={inputClass}>
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
          <div className="flex flex-col gap-4 bg-violet-50/40 p-4 sm:flex-row sm:items-stretch">
            <div className="flex shrink-0 items-center justify-center border-b border-violet-200 pb-4 sm:w-36 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <AssessorPhotoUpload
                label=""
                shape="square"
                value={assessor.photo}
                onChange={(photo) => onFormDataChange('assessor', { ...assessor, photo })}
              />
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label="Name"><input value={assessor.name} onChange={set('assessor', 'name')} className={inputClass} /></Field>
              <Field label="Title"><input value={assessor.title} onChange={set('assessor', 'title')} className={inputClass} placeholder="Care Assessment Specialist" /></Field>
              <Field label="Phone"><input value={assessor.phone} onChange={set('assessor', 'phone')} className={inputClass} /></Field>
              <Field label="Email"><input type="email" value={assessor.email} onChange={set('assessor', 'email')} className={inputClass} /></Field>
              <Field label="Date Assessed" className="sm:col-span-2">
                <input type="date" value={assessor.dateAssessed} onChange={set('assessor', 'dateAssessed')} className={inputClass} />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <Section n="1" title="Client Information" subtitle="Basic demographics and emergency contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client Name" className="sm:col-span-2"><input value={ci.clientName} onChange={set('clientInfo', 'clientName')} className={inputClass} /></Field>
          <Field label="Date of Birth"><input type="date" value={ci.dob} onChange={set('clientInfo', 'dob')} className={inputClass} /></Field>
          <Field label="Address" className="sm:col-span-2"><input value={ci.address} onChange={set('clientInfo', 'address')} className={inputClass} /></Field>
          <Field label="City"><input value={ci.city} onChange={set('clientInfo', 'city')} className={inputClass} /></Field>
          <Field label="State"><input value={ci.state} onChange={set('clientInfo', 'state')} className={inputClass} /></Field>
          <Field label="ZIP"><input value={ci.zip} onChange={set('clientInfo', 'zip')} className={inputClass} /></Field>
          <Field label="Phone"><input value={ci.phone} onChange={set('clientInfo', 'phone')} className={inputClass} /></Field>
          <Field label="Email"><input type="email" value={ci.email} onChange={set('clientInfo', 'email')} className={inputClass} /></Field>
          <Field label="Primary Language"><input value={ci.primaryLanguage} onChange={set('clientInfo', 'primaryLanguage')} className={inputClass} /></Field>
          <Chips label="Gender" options={GENDERS} values={ci.gender} single onToggle={(g) => onFormDataChange('clientInfo', { gender: ci.gender === g ? '' : g })} />
          <Field label="Marital Status"><input value={ci.maritalStatus} onChange={set('clientInfo', 'maritalStatus')} className={inputClass} /></Field>
          <Field label="Emergency Contact"><input value={ci.emergencyContact} onChange={set('clientInfo', 'emergencyContact')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={ci.emergencyRelationship} onChange={set('clientInfo', 'emergencyRelationship')} className={inputClass} /></Field>
          <Field label="Emergency Phone"><input value={ci.emergencyPhone} onChange={set('clientInfo', 'emergencyPhone')} className={inputClass} /></Field>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section n="2" title="Medical Information">
          <Field label="Primary Diagnosis / Condition"><textarea value={med.primaryDiagnosis} onChange={set('medicalInfo', 'primaryDiagnosis')} rows={2} className={inputClass} /></Field>
          <Field label="Other Diagnoses / Conditions"><textarea value={med.otherDiagnoses} onChange={set('medicalInfo', 'otherDiagnoses')} rows={2} className={inputClass} /></Field>
          <Field label="Allergies"><input value={med.allergies} onChange={set('medicalInfo', 'allergies')} className={inputClass} /></Field>
          <Field label="Physician / Provider"><input value={med.physician} onChange={set('medicalInfo', 'physician')} className={inputClass} /></Field>
          <Field label="Physician Phone"><input value={med.physicianPhone} onChange={set('medicalInfo', 'physicianPhone')} className={inputClass} /></Field>
          <Field label="Special Instructions / Precautions"><textarea value={med.specialInstructions} onChange={set('medicalInfo', 'specialInstructions')} rows={2} className={inputClass} /></Field>
        </Section>

        <Section n="3" title="Client Goals" subtitle="What matters most">
          {d.clientGoals.map((goal, i) => (
            <Field key={i} label={`${i + 1}.`}>
              <input value={goal} onChange={(e) => {
                const goals = [...d.clientGoals];
                goals[i] = e.target.value;
                onFormDataChange('clientGoals', goals, true);
              }} className={inputClass} />
            </Field>
          ))}
        </Section>

        <Section n="4" title="Supplementary Items">
          <YesNoNull label="Advance Directives on File" value={sup.advanceDirectives} onChange={(v) => onFormDataChange('supplementary', { advanceDirectives: v })} />
          <YesNoNull label="DNR / POLST" value={sup.dnrPolst} onChange={(v) => onFormDataChange('supplementary', { dnrPolst: v })} />
          <Field label="Preferred Hospital"><input value={sup.preferredHospital} onChange={set('supplementary', 'preferredHospital')} className={inputClass} /></Field>
          <Field label="Household Members / Caregivers"><input value={sup.householdMembers} onChange={set('supplementary', 'householdMembers')} className={inputClass} /></Field>
          <Field label="Preferred Pharmacy"><input value={sup.preferredPharmacy} onChange={set('supplementary', 'preferredPharmacy')} className={inputClass} /></Field>
          <YesNoNull label="Transportation Needs" value={sup.transportationNeeds} onChange={(v) => onFormDataChange('supplementary', { transportationNeeds: v })} />
          <YesNoNull label="Interpreter Needed" value={sup.interpreterNeeded} onChange={(v) => onFormDataChange('supplementary', { interpreterNeeded: v })} />
          <Field label="Health Insurance"><input value={sup.healthInsurance} onChange={set('supplementary', 'healthInsurance')} className={inputClass} /></Field>
          <Field label="Policy / ID #"><input value={sup.policyId} onChange={set('supplementary', 'policyId')} className={inputClass} /></Field>
          <Field label="Cultural / Spiritual Considerations"><textarea value={sup.culturalSpiritual} onChange={set('supplementary', 'culturalSpiritual')} rows={2} className={inputClass} /></Field>
          <Field label="Other Notes"><textarea value={sup.otherNotes} onChange={set('supplementary', 'otherNotes')} rows={2} className={inputClass} /></Field>
        </Section>
      </div>
    </div>
  );
}

export function CarePlanStepTwo({ form, onFormDataChange, caregivers = [] }) {
  const d = form.formData;
  const risk = d.riskAssessment;
  const review = d.carePlanReview;
  const auth = d.authorization;
  const sig = d.signatures;

  const caregiverOptions = caregivers
    .filter((c) => c.status !== 'Inactive')
    .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

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

  return (
    <div className="space-y-6">
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
                      <textarea value={row.goalsOutcomes} onChange={(e) => updateCareNeed(i, { goalsOutcomes: e.target.value })} rows={3} className={inputClass} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1.5">
                        {areaDef?.interventions.map((int) => (
                          <label key={int.key} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={!!row.interventions[int.key]} onChange={() => toggleIntervention(i, int.key)} className="rounded border-gray-300 text-violet-600" />
                            {int.label}
                          </label>
                        ))}
                        {(row.interventions.other || row.interventions.custom) && (
                          <input value={row.interventions.otherText || ''} onChange={(e) => updateCareNeed(i, { interventions: { ...row.interventions, otherText: e.target.value } })} placeholder="Specify other..." className={inputClass} />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3"><input value={row.frequency} onChange={(e) => updateCareNeed(i, { frequency: e.target.value })} className={inputClass} /></td>
                    <td className="px-3 py-3">
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
                    </td>
                  </tr>
                  {resolveStaffId(row) && (
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
                            <input type="time" value={row.startTime || ''} onChange={(e) => updateCareNeed(i, { startTime: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-medium text-gray-600">End</p>
                            <input type="time" value={row.endTime || ''} onChange={(e) => updateCareNeed(i, { endTime: e.target.value })} className={inputClass} />
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-medium text-gray-600">Clock-in grace</p>
                            <select
                              value={row.graceMinutes || 15}
                              onChange={(e) => updateCareNeed(i, { graceMinutes: Number(e.target.value) })}
                              className={inputClass}
                            >
                              <option value={15}>15 minutes</option>
                              <option value={30}>30 minutes</option>
                            </select>
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
              <Chips options={RISK_LEVELS} values={risk[key]} single onToggle={(v) => onFormDataChange('riskAssessment', { ...risk, [key]: risk[key] === v ? '' : v })} />
            </div>
          ))}
          <Field label="Other Risk(s)"><input value={risk.otherRisks} onChange={(e) => onFormDataChange('riskAssessment', { ...risk, otherRisks: e.target.value })} className={inputClass} /></Field>
          <Field label="Risk Notes / Plan"><textarea value={risk.riskNotes} onChange={(e) => onFormDataChange('riskAssessment', { ...risk, riskNotes: e.target.value })} rows={2} className={inputClass} /></Field>
        </Section>

        <Section n="7" title="Care Plan Review">
          <p className="text-sm text-gray-600">This care plan will be reviewed:</p>
          <Chips options={REVIEW_FREQUENCIES} values={review.frequencies} onToggle={(f) => {
            const arr = review.frequencies || [];
            onFormDataChange('carePlanReview', { ...review, frequencies: arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f] });
          }} />
          {review.frequencies?.includes('Other') && (
            <Field label="Other (specify)"><input value={review.frequencyOther} onChange={(e) => onFormDataChange('carePlanReview', { ...review, frequencyOther: e.target.value })} className={inputClass} /></Field>
          )}
          <Field label="Next Review Date"><input type="date" value={review.nextReviewDate} onChange={(e) => onFormDataChange('carePlanReview', { ...review, nextReviewDate: e.target.value })} className={inputClass} /></Field>
          <Field label="Reason for Review"><textarea value={review.reasonForReview} onChange={(e) => onFormDataChange('carePlanReview', { ...review, reasonForReview: e.target.value })} rows={2} className={inputClass} /></Field>
        </Section>

        <Section n="8" title="Authorization">
          <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
            I have reviewed this care plan and agree with the goals and interventions.
          </p>
          <Field label="Client / Legal Representative Name"><input value={auth.representativeName} onChange={(e) => onFormDataChange('authorization', { ...auth, representativeName: e.target.value })} className={inputClass} /></Field>
          <DigitalSignaturePad label="Signature" value={auth.signature} onChange={(v) => onFormDataChange('authorization', { ...auth, signature: v })} />
          <Field label="Date"><input type="date" value={auth.date} onChange={(e) => onFormDataChange('authorization', { ...auth, date: e.target.value })} className={inputClass} /></Field>
        </Section>
      </div>

      <Section n="9" title="Signatures" subtitle="Digital signatures for client, agency staff, and supervisor">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { key: 'clientRep', label: 'Client / Legal Representative' },
            { key: 'agencyStaff', label: 'Agency Staff / Care Coordinator' },
            { key: 'supervisor', label: 'Supervisor / Manager' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <p className="text-sm font-semibold text-violet-800">{label}</p>
              <Field label="Name"><input value={sig[key]?.name || ''} onChange={(e) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], name: e.target.value } })} className={inputClass} /></Field>
              <DigitalSignaturePad label="Signature" value={sig[key]?.signature || ''} onChange={(v) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], signature: v } })} />
              <Field label="Date"><input type="date" value={sig[key]?.date || ''} onChange={(e) => onFormDataChange('signatures', { ...sig, [key]: { ...sig[key], date: e.target.value } })} className={inputClass} /></Field>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
