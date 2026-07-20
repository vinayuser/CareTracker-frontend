import { useState } from 'react';
import {
  CreditCard, FileText, HeartPulse, IdCard, Pill, Users, Upload, Trash2, ExternalLink, Loader2,
} from 'lucide-react';
import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import {
  AUTH_STATUSES, GENDERS, MARITAL_STATUSES, MEDICARE_TYPES,
  PRIMARY_INSURANCE_TYPES, RELATIONSHIPS, REQUIRED_DOCUMENTS,
  hasUploadedDocument,
} from '../../../utils/insuranceIntakeForm';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const readOnlyClass = `${inputClass} cursor-not-allowed bg-gray-50 text-gray-700`;
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const DOC_ICONS = { CreditCard, IdCard, HeartPulse, Users, Pill, FileText };

function Field({ label, required, children, className = '', error }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Section({ n, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{n}</span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chips({ label, options, values, onToggle, single, disabled }) {
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
              disabled={disabled}
              onClick={() => !disabled && onToggle(opt)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                on ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'
              } ${disabled ? 'cursor-not-allowed opacity-70' : 'hover:bg-gray-50'}`}
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
        <button key={t} type="button" onClick={() => onChange(t === 'Yes')} className={`rounded-lg border px-3 py-1.5 text-sm ${value === (t === 'Yes') ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'}`}>{t}</button>
      ))}
    </div>
  );
}

function YesNoNull({ label, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {['Yes', 'No'].map((t) => (
        <button key={t} type="button" onClick={() => onChange(value === (t === 'Yes') ? null : t === 'Yes')} className={`rounded-lg border px-3 py-1.5 text-sm ${value === (t === 'Yes') ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'}`}>{t}</button>
      ))}
    </div>
  );
}

export function InsuranceIntakeStepOne({
  form, clients, clientId, onClientChange, onHeaderChange, onFormDataChange,
  clientInfoLocked = false,
  clientSelectLocked = false,
  errors = {},
}) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const setPhone = (section, field) => (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 15);
    onFormDataChange(section, { [field]: digits });
  };
  const ci = d.clientInfo;
  const pri = d.primaryInsurance;
  const sec = d.secondaryInsurance;
  const rx = d.prescriptionCoverage;
  const locked = Boolean(clientInfoLocked);
  const clientInputClass = locked ? readOnlyClass : inputClass;
  const errorClass = (key) => (errors[key] ? ' border-red-400 focus:border-red-500 focus:ring-red-200' : '');

  const togglePrimaryType = (type) => {
    const types = pri.types || [];
    const next = types.includes(type) ? types.filter((t) => t !== type) : [...types, type];
    onFormDataChange('primaryInsurance', { ...pri, types: next });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-50 to-white p-5">
        <p className="text-center text-lg font-bold uppercase tracking-wide text-primary">Client Insurance Intake Form</p>
        <p className="text-center text-sm text-gray-500">Please complete all information to help us verify your insurance and maximize your benefits.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Intake Date" required error={errors.intakeDate}>
            <input
              type="date"
              value={form.intakeDate || ''}
              onChange={(e) => onHeaderChange('intakeDate', e.target.value)}
              className={`${inputClass}${errorClass('intakeDate')}`}
            />
          </Field>
          <Field label="Intake ID"><input value={form.intakeCode || 'Auto-generated on save'} readOnly className={readOnlyClass} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => onHeaderChange('status', e.target.value)} className={inputClass}>
              {['Draft', 'Submitted', 'Verified'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          {!form.intakeCode && (
            <Field label="Select Client">
              <select
                value={clientId}
                onChange={(e) => onClientChange(e.target.value)}
                disabled={clientSelectLocked}
                className={clientSelectLocked ? readOnlyClass : inputClass}
              >
                <option value="">Choose a client (optional)</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName} ({c.clientCode})</option>)}
              </select>
            </Field>
          )}
        </div>
      </div>

      <Section
        n="1"
        title="Client Information"
        subtitle={locked ? 'Name and address come from the client/assessment. Phone and emergency contact can be updated here.' : undefined}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Client Full Name">
              <input value={ci.clientFullName} onChange={set('clientInfo', 'clientFullName')} readOnly={locked} className={clientInputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of Birth" required={!locked} error={errors.dob}>
                <input
                  type="date"
                  value={ci.dob || ''}
                  onChange={set('clientInfo', 'dob')}
                  readOnly={locked}
                  className={`${clientInputClass}${errorClass('dob')}`}
                />
              </Field>
              <Chips
                label="Gender"
                options={GENDERS}
                values={ci.gender}
                single
                disabled={locked}
                onToggle={(v) => onFormDataChange('clientInfo', { ...ci, gender: ci.gender === v ? '' : v })}
              />
            </div>
            <Field label="Address">
              <input value={ci.address} onChange={set('clientInfo', 'address')} readOnly={locked} className={clientInputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City"><input value={ci.city} onChange={set('clientInfo', 'city')} readOnly={locked} className={clientInputClass} /></Field>
              <Field label="State"><input value={ci.state} onChange={set('clientInfo', 'state')} readOnly={locked} className={clientInputClass} /></Field>
              <Field label="ZIP"><input value={ci.zip} onChange={set('clientInfo', 'zip')} readOnly={locked} className={clientInputClass} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone (Home)" error={errors.phoneHome}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit phone"
                  value={ci.phoneHome}
                  onChange={setPhone('clientInfo', 'phoneHome')}
                  className={`${inputClass}${errorClass('phoneHome')}`}
                />
              </Field>
              <Field label="Phone (Mobile)" required error={errors.phoneMobile}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit phone"
                  value={ci.phoneMobile}
                  onChange={setPhone('clientInfo', 'phoneMobile')}
                  className={`${inputClass}${errorClass('phoneMobile')}`}
                />
              </Field>
            </div>
            <Field label="Email"><input type="email" value={ci.email} onChange={set('clientInfo', 'email')} readOnly={locked} className={clientInputClass} /></Field>
          </div>
          <div className="space-y-4">
            <Chips
              label="Marital Status"
              options={MARITAL_STATUSES}
              values={ci.maritalStatus}
              single
              disabled={locked}
              onToggle={(v) => onFormDataChange('clientInfo', { ...ci, maritalStatus: ci.maritalStatus === v ? '' : v })}
            />
            <Field label="SSN (Last 4)">
              <input value={ci.ssnLast4} onChange={set('clientInfo', 'ssnLast4')} maxLength={4} placeholder="XXXX" readOnly={locked} className={clientInputClass} />
            </Field>
            <Field label="Preferred Language">
              <input value={ci.preferredLanguage} onChange={set('clientInfo', 'preferredLanguage')} readOnly={locked} className={clientInputClass} />
            </Field>
            <Field label="Emergency Contact Name">
              <input value={ci.emergencyContactName} onChange={set('clientInfo', 'emergencyContactName')} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Relationship">
                <input value={ci.emergencyRelationship} onChange={set('clientInfo', 'emergencyRelationship')} className={inputClass} />
              </Field>
              <Field label="Phone" error={errors.emergencyPhone}>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit phone"
                  value={ci.emergencyPhone}
                  onChange={setPhone('clientInfo', 'emergencyPhone')}
                  className={`${inputClass}${errorClass('emergencyPhone')}`}
                />
              </Field>
            </div>
          </div>
        </div>
      </Section>

      <Section n="2" title="Primary Insurance Information">
        <Chips label="Insurance Type" options={PRIMARY_INSURANCE_TYPES} values={pri.types} onToggle={togglePrimaryType} />
        {pri.types?.includes('Other') && (
          <Field label="Other Insurance Type"><input value={pri.otherType} onChange={set('primaryInsurance', 'otherType')} className={inputClass} /></Field>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Insurance Company Name"><input value={pri.companyName} onChange={set('primaryInsurance', 'companyName')} className={inputClass} /></Field>
            <Field label="Member ID / Policy #"><input value={pri.memberId} onChange={set('primaryInsurance', 'memberId')} className={inputClass} /></Field>
            <Field label="Policy Holder Name (if different)"><input value={pri.policyHolderName} onChange={set('primaryInsurance', 'policyHolderName')} className={inputClass} /></Field>
            <Chips label="Relationship to Client" options={RELATIONSHIPS} values={pri.policyHolderRelationship} single onToggle={(v) => onFormDataChange('primaryInsurance', { ...pri, policyHolderRelationship: pri.policyHolderRelationship === v ? '' : v })} />
            {pri.policyHolderRelationship === 'Other' && (
              <Field label="Specify Relationship"><input value={pri.policyHolderRelationshipOther} onChange={set('primaryInsurance', 'policyHolderRelationshipOther')} className={inputClass} /></Field>
            )}
            <Field label="Insurance Phone Number" error={errors.insurancePhone}>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit phone"
                value={pri.insurancePhone}
                onChange={setPhone('primaryInsurance', 'insurancePhone')}
                className={`${inputClass}${errorClass('insurancePhone')}`}
              />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label="Plan Name"><input value={pri.planName} onChange={set('primaryInsurance', 'planName')} className={inputClass} /></Field>
            <Field label="Group #"><input value={pri.groupNumber} onChange={set('primaryInsurance', 'groupNumber')} className={inputClass} /></Field>
            <Field label="Policy Holder Date of Birth"><input type="date" value={pri.policyHolderDob || ''} onChange={set('primaryInsurance', 'policyHolderDob')} className={inputClass} /></Field>
            <Field label="Effective Date"><input type="date" value={pri.effectiveDate || ''} onChange={set('primaryInsurance', 'effectiveDate')} className={inputClass} /></Field>
            <Field label="Claims Address (if known)"><textarea value={pri.claimsAddress} onChange={set('primaryInsurance', 'claimsAddress')} rows={2} className={inputClass} /></Field>
          </div>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section n="3" title="Secondary Insurance (If Applicable)">
          <Field label="Insurance Company Name"><input value={sec.companyName} onChange={set('secondaryInsurance', 'companyName')} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Member ID / Policy #"><input value={sec.memberId} onChange={set('secondaryInsurance', 'memberId')} className={inputClass} /></Field>
            <Field label="Group #"><input value={sec.groupNumber} onChange={set('secondaryInsurance', 'groupNumber')} className={inputClass} /></Field>
          </div>
          <Field label="Policy Holder Name"><input value={sec.policyHolderName} onChange={set('secondaryInsurance', 'policyHolderName')} className={inputClass} /></Field>
          <Field label="Date of Birth"><input type="date" value={sec.dob || ''} onChange={set('secondaryInsurance', 'dob')} className={inputClass} /></Field>
          <Chips label="Relationship to Client" options={RELATIONSHIPS} values={sec.relationship} single onToggle={(v) => onFormDataChange('secondaryInsurance', { ...sec, relationship: sec.relationship === v ? '' : v })} />
        </Section>

        <Section n="4" title="Prescription Coverage">
          <Field label="Rx Insurance Company"><input value={rx.companyName} onChange={set('prescriptionCoverage', 'companyName')} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rx Member ID"><input value={rx.memberId} onChange={set('prescriptionCoverage', 'memberId')} className={inputClass} /></Field>
            <Field label="Rx Group #"><input value={rx.groupNumber} onChange={set('prescriptionCoverage', 'groupNumber')} className={inputClass} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rx BIN #"><input value={rx.bin} onChange={set('prescriptionCoverage', 'bin')} className={inputClass} /></Field>
            <Field label="Rx PCN"><input value={rx.pcn} onChange={set('prescriptionCoverage', 'pcn')} className={inputClass} /></Field>
          </div>
          <Field label="Rx Phone Number" error={errors.rxPhone}>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit phone"
              value={rx.phone}
              onChange={setPhone('prescriptionCoverage', 'phone')}
              className={`${inputClass}${errorClass('rxPhone')}`}
            />
          </Field>
          <Field label="Copay Structure (if known)"><input value={rx.copayStructure} onChange={set('prescriptionCoverage', 'copayStructure')} className={inputClass} /></Field>
        </Section>
      </div>
    </div>
  );
}

export function InsuranceIntakeStepTwo({
  form,
  onFormDataChange,
  errors = {},
  intakeId = null,
  onUploadDocument,
  onRemoveDocument,
  uploadingKey = null,
}) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const setPhone = (section, field) => (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 15);
    onFormDataChange(section, { [field]: digits });
  };
  const med = d.medicare;
  const mcd = d.medicaid;
  const add = d.additionalCoverage;
  const auth = d.authorization;
  const docs = d.requiredDocuments || {};
  const office = d.officeUse;
  const errorClass = (key) => (errors[key] ? ' border-red-400 focus:border-red-500 focus:ring-red-200' : '');
  const [localBusy, setLocalBusy] = useState(null);

  const toggleMedicareType = (type) => {
    const types = med.types || [];
    const next = types.includes(type) ? types.filter((t) => t !== type) : [...types, type];
    onFormDataChange('medicare', { ...med, types: next });
  };

  const handleFilePick = async (key, file) => {
    if (!file || !onUploadDocument) return;
    setLocalBusy(key);
    try {
      await onUploadDocument(key, file);
    } finally {
      setLocalBusy(null);
    }
  };

  const handleRemove = async (key) => {
    if (!onRemoveDocument) return;
    setLocalBusy(key);
    try {
      await onRemoveDocument(key);
    } finally {
      setLocalBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section n="5" title="Medicare Information (If Applicable)">
          <Field label="Medicare Number"><input value={med.number} onChange={set('medicare', 'number')} className={inputClass} /></Field>
          <Chips label="Medicare Type" options={MEDICARE_TYPES} values={med.types} onToggle={toggleMedicareType} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Medicare Part A Effective Date"><input type="date" value={med.partAEffectiveDate || ''} onChange={set('medicare', 'partAEffectiveDate')} className={inputClass} /></Field>
            <Field label="Medicare Part B Effective Date"><input type="date" value={med.partBEffectiveDate || ''} onChange={set('medicare', 'partBEffectiveDate')} className={inputClass} /></Field>
          </div>
          <Field label="Medicare Advantage Plan Name"><input value={med.advantagePlanName} onChange={set('medicare', 'advantagePlanName')} className={inputClass} /></Field>
          <Field label="Plan ID Number"><input value={med.planIdNumber} onChange={set('medicare', 'planIdNumber')} className={inputClass} /></Field>
        </Section>

        <Section n="6" title="Medicaid Information (If Applicable)">
          <Field label="Medicaid Number"><input value={mcd.number} onChange={set('medicaid', 'number')} className={inputClass} /></Field>
          <Field label="State"><input value={mcd.state} onChange={set('medicaid', 'state')} className={inputClass} /></Field>
          <Field label="Managed Care Plan (if any)"><input value={mcd.managedCarePlan} onChange={set('medicaid', 'managedCarePlan')} className={inputClass} /></Field>
          <Field label="Member ID"><input value={mcd.memberId} onChange={set('medicaid', 'memberId')} className={inputClass} /></Field>
          <Field label="Effective Date"><input type="date" value={mcd.effectiveDate || ''} onChange={set('medicaid', 'effectiveDate')} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case Worker Name"><input value={mcd.caseWorkerName} onChange={set('medicaid', 'caseWorkerName')} className={inputClass} /></Field>
            <Field label="Case Worker Phone" error={errors.caseWorkerPhone}>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit phone"
                value={mcd.caseWorkerPhone}
                onChange={setPhone('medicaid', 'caseWorkerPhone')}
                className={`${inputClass}${errorClass('caseWorkerPhone')}`}
              />
            </Field>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section n="7" title="Additional Coverage">
          <YesNoNull label="Veteran Benefits (VA)" value={add.vaBenefits} onChange={(v) => onFormDataChange('additionalCoverage', { ...add, vaBenefits: v })} />
          {add.vaBenefits && <Field label="VA Claim #"><input value={add.vaClaimNumber} onChange={set('additionalCoverage', 'vaClaimNumber')} className={inputClass} /></Field>}
          <YesNoNull label="Long Term Care Insurance" value={add.longTermCare} onChange={(v) => onFormDataChange('additionalCoverage', { ...add, longTermCare: v })} />
          {add.longTermCare && (
            <>
              <Field label="Policy / Claim Number"><input value={add.ltcPolicyClaimNumber} onChange={set('additionalCoverage', 'ltcPolicyClaimNumber')} className={inputClass} /></Field>
              <Field label="Insurance Company"><input value={add.ltcCompany} onChange={set('additionalCoverage', 'ltcCompany')} className={inputClass} /></Field>
            </>
          )}
        </Section>

        <Section n="8" title="Assignment & Authorization">
          <p className="text-sm leading-relaxed text-gray-600">
            I authorize CareTraker to verify my insurance benefits, submit claims, communicate with my insurance company, and release information as necessary to process payment for services.
          </p>
          <Field label="Print Name"><input value={auth.printName} onChange={set('authorization', 'printName')} className={inputClass} /></Field>
          <Field label="Date" required error={errors.authDate}>
            <input
              type="date"
              value={auth.date || ''}
              onChange={set('authorization', 'date')}
              className={`${inputClass}${errorClass('authDate')}`}
            />
          </Field>
          <DigitalSignaturePad label="Signature of Client / Representative" value={auth.signature} onChange={(sig) => onFormDataChange('authorization', { ...auth, signature: sig })} />
        </Section>
      </div>

      <Section n="9" title="Required Documents" subtitle="Upload copies of the documents you have on file (PDF or image)">
        {!intakeId && (
          <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Choosing Upload will save a draft intake automatically so the file can be stored.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REQUIRED_DOCUMENTS.map(({ key, label, icon }) => {
            const Icon = DOC_ICONS[icon] || FileText;
            const entry = docs[key];
            const uploaded = hasUploadedDocument(entry);
            const busy = uploadingKey === key || localBusy === key;
            return (
              <div
                key={key}
                className={`flex flex-col rounded-xl border p-4 transition-colors ${
                  uploaded ? 'border-primary/40 bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-3 flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${uploaded ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className={`mt-0.5 text-xs ${uploaded ? 'text-primary' : 'text-gray-400'}`}>
                      {uploaded ? (entry.originalName || 'Uploaded') : 'No file uploaded'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    !busy
                      ? 'border-primary/30 bg-white text-primary hover:bg-primary/5'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  }`}>
                    {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {uploaded ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf,image/*,.heic"
                      className="hidden"
                      disabled={busy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) handleFilePick(key, file);
                      }}
                    />
                  </label>
                  {uploaded && entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <ExternalLink size={12} /> View
                    </a>
                  ) : null}
                  {uploaded ? (
                    <button
                      type="button"
                      disabled={!intakeId || busy}
                      onClick={() => handleRemove(key)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section n="10" title="For Office Use Only">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Insurance Verified By"><input value={office.verifiedBy} onChange={set('officeUse', 'verifiedBy')} className={inputClass} /></Field>
            <Field label="Date"><input type="date" value={office.date || ''} onChange={set('officeUse', 'date')} className={inputClass} /></Field>
            <YesNoNull label="Coverage Confirmed" value={office.coverageConfirmed} onChange={(v) => onFormDataChange('officeUse', { ...office, coverageConfirmed: v })} />
            <Field label="Notes"><textarea value={office.notes} onChange={set('officeUse', 'notes')} rows={2} className={inputClass} /></Field>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Copay $"><input value={office.copay} onChange={set('officeUse', 'copay')} className={inputClass} /></Field>
              <Field label="Deductible $"><input value={office.deductible} onChange={set('officeUse', 'deductible')} className={inputClass} /></Field>
              <Field label="Coinsurance %"><input value={office.coinsurance} onChange={set('officeUse', 'coinsurance')} className={inputClass} /></Field>
            </div>
            <YesNoNull label="Authorization Required" value={office.authorizationRequired} onChange={(v) => onFormDataChange('officeUse', { ...office, authorizationRequired: v })} />
            <Chips label="Auth Status" options={AUTH_STATUSES} values={office.authStatus} single onToggle={(v) => onFormDataChange('officeUse', { ...office, authStatus: office.authStatus === v ? '' : v })} />
            <Field label="Next Review Date"><input type="date" value={office.nextReviewDate || ''} onChange={set('officeUse', 'nextReviewDate')} className={inputClass} /></Field>
          </div>
        </div>
      </Section>
    </div>
  );
}
