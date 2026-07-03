import {
  CreditCard, FileText, HeartPulse, IdCard, Pill, Users,
} from 'lucide-react';
import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import {
  AUTH_STATUSES, GENDERS, MARITAL_STATUSES, MEDICARE_TYPES,
  PRIMARY_INSURANCE_TYPES, RELATIONSHIPS, REQUIRED_DOCUMENTS,
} from '../../../utils/insuranceIntakeForm';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const DOC_ICONS = { CreditCard, IdCard, HeartPulse, Users, Pill, FileText };

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

function Chips({ label, options, values, onToggle, single }) {
  return (
    <div>
      {label && <p className={labelClass}>{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const on = single ? values === opt : (values || []).includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onToggle(opt)} className={`rounded-xl border px-3 py-2 text-sm font-medium ${on ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt}</button>
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
}) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const ci = d.clientInfo;
  const pri = d.primaryInsurance;
  const sec = d.secondaryInsurance;
  const rx = d.prescriptionCoverage;

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
          <Field label="Intake Date"><input value={form.intakeDate} onChange={(e) => onHeaderChange('intakeDate', e.target.value)} className={inputClass} /></Field>
          <Field label="Intake ID"><input value={form.intakeCode || 'Auto-generated on save'} readOnly className={`${inputClass} bg-gray-50`} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => onHeaderChange('status', e.target.value)} className={inputClass}>
              {['Draft', 'Submitted', 'Verified'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          {!form.intakeCode && (
            <Field label="Select Client">
              <select value={clientId} onChange={(e) => onClientChange(e.target.value)} className={inputClass}>
                <option value="">Choose a client (optional)</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName} ({c.clientCode})</option>)}
              </select>
            </Field>
          )}
        </div>
      </div>

      <Section n="1" title="Client Information">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Client Full Name"><input value={ci.clientFullName} onChange={set('clientInfo', 'clientFullName')} className={inputClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of Birth"><input type="date" value={ci.dob} onChange={set('clientInfo', 'dob')} className={inputClass} /></Field>
              <Chips label="Gender" options={GENDERS} values={ci.gender} single onToggle={(v) => onFormDataChange('clientInfo', { ...ci, gender: ci.gender === v ? '' : v })} />
            </div>
            <Field label="Address"><input value={ci.address} onChange={set('clientInfo', 'address')} className={inputClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City"><input value={ci.city} onChange={set('clientInfo', 'city')} className={inputClass} /></Field>
              <Field label="State"><input value={ci.state} onChange={set('clientInfo', 'state')} className={inputClass} /></Field>
              <Field label="ZIP"><input value={ci.zip} onChange={set('clientInfo', 'zip')} className={inputClass} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone (Home)"><input value={ci.phoneHome} onChange={set('clientInfo', 'phoneHome')} className={inputClass} /></Field>
              <Field label="Phone (Mobile)"><input value={ci.phoneMobile} onChange={set('clientInfo', 'phoneMobile')} className={inputClass} /></Field>
            </div>
            <Field label="Email"><input type="email" value={ci.email} onChange={set('clientInfo', 'email')} className={inputClass} /></Field>
          </div>
          <div className="space-y-4">
            <Chips label="Marital Status" options={MARITAL_STATUSES} values={ci.maritalStatus} single onToggle={(v) => onFormDataChange('clientInfo', { ...ci, maritalStatus: ci.maritalStatus === v ? '' : v })} />
            <Field label="SSN (Last 4)"><input value={ci.ssnLast4} onChange={set('clientInfo', 'ssnLast4')} maxLength={4} placeholder="XXXX" className={inputClass} /></Field>
            <Field label="Preferred Language"><input value={ci.preferredLanguage} onChange={set('clientInfo', 'preferredLanguage')} className={inputClass} /></Field>
            <Field label="Emergency Contact Name"><input value={ci.emergencyContactName} onChange={set('clientInfo', 'emergencyContactName')} className={inputClass} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Relationship"><input value={ci.emergencyRelationship} onChange={set('clientInfo', 'emergencyRelationship')} className={inputClass} /></Field>
              <Field label="Phone"><input value={ci.emergencyPhone} onChange={set('clientInfo', 'emergencyPhone')} className={inputClass} /></Field>
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
            <Field label="Insurance Phone Number"><input value={pri.insurancePhone} onChange={set('primaryInsurance', 'insurancePhone')} className={inputClass} /></Field>
          </div>
          <div className="space-y-4">
            <Field label="Plan Name"><input value={pri.planName} onChange={set('primaryInsurance', 'planName')} className={inputClass} /></Field>
            <Field label="Group #"><input value={pri.groupNumber} onChange={set('primaryInsurance', 'groupNumber')} className={inputClass} /></Field>
            <Field label="Policy Holder Date of Birth"><input type="date" value={pri.policyHolderDob} onChange={set('primaryInsurance', 'policyHolderDob')} className={inputClass} /></Field>
            <Field label="Effective Date"><input type="date" value={pri.effectiveDate} onChange={set('primaryInsurance', 'effectiveDate')} className={inputClass} /></Field>
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
          <Field label="Date of Birth"><input type="date" value={sec.dob} onChange={set('secondaryInsurance', 'dob')} className={inputClass} /></Field>
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
          <Field label="Rx Phone Number"><input value={rx.phone} onChange={set('prescriptionCoverage', 'phone')} className={inputClass} /></Field>
          <Field label="Copay Structure (if known)"><input value={rx.copayStructure} onChange={set('prescriptionCoverage', 'copayStructure')} className={inputClass} /></Field>
        </Section>
      </div>
    </div>
  );
}

export function InsuranceIntakeStepTwo({ form, onFormDataChange }) {
  const d = form.formData;
  const set = (section, field) => (e) => onFormDataChange(section, { [field]: e.target.value });
  const med = d.medicare;
  const mcd = d.medicaid;
  const add = d.additionalCoverage;
  const auth = d.authorization;
  const docs = d.requiredDocuments;
  const office = d.officeUse;

  const toggleMedicareType = (type) => {
    const types = med.types || [];
    const next = types.includes(type) ? types.filter((t) => t !== type) : [...types, type];
    onFormDataChange('medicare', { ...med, types: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section n="5" title="Medicare Information (If Applicable)">
          <Field label="Medicare Number"><input value={med.number} onChange={set('medicare', 'number')} className={inputClass} /></Field>
          <Chips label="Medicare Type" options={MEDICARE_TYPES} values={med.types} onToggle={toggleMedicareType} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Medicare Part A Effective Date"><input type="date" value={med.partAEffectiveDate} onChange={set('medicare', 'partAEffectiveDate')} className={inputClass} /></Field>
            <Field label="Medicare Part B Effective Date"><input type="date" value={med.partBEffectiveDate} onChange={set('medicare', 'partBEffectiveDate')} className={inputClass} /></Field>
          </div>
          <Field label="Medicare Advantage Plan Name"><input value={med.advantagePlanName} onChange={set('medicare', 'advantagePlanName')} className={inputClass} /></Field>
          <Field label="Plan ID Number"><input value={med.planIdNumber} onChange={set('medicare', 'planIdNumber')} className={inputClass} /></Field>
        </Section>

        <Section n="6" title="Medicaid Information (If Applicable)">
          <Field label="Medicaid Number"><input value={mcd.number} onChange={set('medicaid', 'number')} className={inputClass} /></Field>
          <Field label="State"><input value={mcd.state} onChange={set('medicaid', 'state')} className={inputClass} /></Field>
          <Field label="Managed Care Plan (if any)"><input value={mcd.managedCarePlan} onChange={set('medicaid', 'managedCarePlan')} className={inputClass} /></Field>
          <Field label="Member ID"><input value={mcd.memberId} onChange={set('medicaid', 'memberId')} className={inputClass} /></Field>
          <Field label="Effective Date"><input type="date" value={mcd.effectiveDate} onChange={set('medicaid', 'effectiveDate')} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case Worker Name"><input value={mcd.caseWorkerName} onChange={set('medicaid', 'caseWorkerName')} className={inputClass} /></Field>
            <Field label="Case Worker Phone"><input value={mcd.caseWorkerPhone} onChange={set('medicaid', 'caseWorkerPhone')} className={inputClass} /></Field>
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
          <Field label="Date"><input type="date" value={auth.date} onChange={set('authorization', 'date')} className={inputClass} /></Field>
          <DigitalSignaturePad label="Signature of Client / Representative" value={auth.signature} onChange={(sig) => onFormDataChange('authorization', { ...auth, signature: sig })} />
        </Section>
      </div>

      <Section n="9" title="Required Documents" subtitle="Please check which you have provided">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REQUIRED_DOCUMENTS.map(({ key, label, icon }) => {
            const Icon = DOC_ICONS[icon] || FileText;
            const checked = !!docs[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFormDataChange('requiredDocuments', { ...docs, [key]: !checked })}
                className={`flex flex-col items-center rounded-xl border p-4 text-center transition-colors ${checked ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/30'}`}
              >
                <Icon size={28} className="mb-2" />
                <span className="text-sm font-medium">{label}</span>
                <span className={`mt-2 text-xs ${checked ? 'text-primary' : 'text-gray-400'}`}>{checked ? 'Provided' : 'Not provided'}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section n="10" title="For Office Use Only">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Insurance Verified By"><input value={office.verifiedBy} onChange={set('officeUse', 'verifiedBy')} className={inputClass} /></Field>
            <Field label="Date"><input type="date" value={office.date} onChange={set('officeUse', 'date')} className={inputClass} /></Field>
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
            <Field label="Next Review Date"><input type="date" value={office.nextReviewDate} onChange={set('officeUse', 'nextReviewDate')} className={inputClass} /></Field>
          </div>
        </div>
      </Section>
    </div>
  );
}
