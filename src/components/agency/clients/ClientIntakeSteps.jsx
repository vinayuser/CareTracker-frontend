import {
  ASSISTIVE_DEVICES,
  CARE_FREQUENCIES,
  GENDERS,
  HOME_ACCESSIBILITY,
  LIVING_ARRANGEMENTS,
  MARITAL_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_RESPONSIBILITIES,
  PREFERRED_DAYS,
  PREFERRED_TIMES,
  RESIDENCE_TYPES,
  SERVICE_TYPES,
} from '../../../constants/clientIntakeOptions';

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';

export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

function Field({ label, required, children, className = '', error }) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionCard({ number, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {number}
        </span>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ChipGroup({ label, options, values, onToggle, single = false }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = single ? values === option : values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoField({ label, value, onChange, descriptionValue, onDescriptionChange, descriptionPlaceholder }) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <div className="flex gap-2">
        {[
          { label: 'Yes', val: true },
          { label: 'No', val: false },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.val)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              value === opt.val
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {value && (
        <Field label="If yes, please describe">
          <input
            value={descriptionValue}
            onChange={onDescriptionChange}
            placeholder={descriptionPlaceholder}
            className={inputClass}
          />
        </Field>
      )}
    </div>
  );
}

export function ClientIntakeStepOne({ form, onChange, errors = {} }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-white p-5 sm:p-6">
        <p className="text-lg font-semibold text-gray-900">Client Intake Form</p>
        <p className="mt-1 text-sm text-gray-500">Step 1 of 2 — personal, emergency, and health information</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Intake Date">
            <input type="date" value={form.intakeDate} onChange={set('intakeDate')} className={inputClass} />
          </Field>
          <Field label="Intake ID">
            <input value={form.intakeId} onChange={set('intakeId')} placeholder="Optional reference" className={inputClass} />
          </Field>
        </div>
      </div>

      <SectionCard number="1" title="Client Information" subtitle="Basic demographics and contact details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName}>
            <input value={form.firstName} onChange={set('firstName')} className={inputClass} placeholder="First name" />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <input value={form.lastName} onChange={set('lastName')} className={inputClass} placeholder="Last name" />
          </Field>
          <Field label="Preferred Name">
            <input value={form.preferredName} onChange={set('preferredName')} className={inputClass} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <ChipGroup label="Gender" options={GENDERS} values={form.gender} single onToggle={(opt) => onChange('gender', form.gender === opt ? '' : opt)} />
          </div>
          <div className="sm:col-span-2">
            <ChipGroup label="Marital Status" options={MARITAL_STATUSES} values={form.maritalStatus} single onToggle={(opt) => onChange('maritalStatus', form.maritalStatus === opt ? '' : opt)} />
          </div>
          <Field label="SSN (Last 4)">
            <input value={form.ssnLast4} onChange={set('ssnLast4')} maxLength={4} placeholder="XXXX" className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </Field>
          <Field label="Street Address" className="sm:col-span-2">
            <input value={form.streetAddress} onChange={set('streetAddress')} className={inputClass} />
          </Field>
          <Field label="Apt / Suite"><input value={form.aptSuite} onChange={set('aptSuite')} className={inputClass} /></Field>
          <Field label="City"><input value={form.city} onChange={set('city')} className={inputClass} /></Field>
          <Field label="State"><input value={form.state} onChange={set('state')} className={inputClass} /></Field>
          <Field label="Zip Code"><input value={form.zipCode} onChange={set('zipCode')} className={inputClass} /></Field>
          <Field label="Phone (Home)"><input value={form.phoneHome} onChange={set('phoneHome')} className={inputClass} /></Field>
          <Field label="Phone (Mobile)"><input value={form.phone} onChange={set('phone')} className={inputClass} /></Field>
          <Field label="Preferred Language"><input value={form.preferredLanguage} onChange={set('preferredLanguage')} className={inputClass} /></Field>
          <Field label="Ethnicity"><input value={form.ethnicity} onChange={set('ethnicity')} className={inputClass} /></Field>
          <Field label="Race"><input value={form.race} onChange={set('race')} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard number="2" title="Emergency Contact" subtitle="Primary and alternate contacts">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Primary</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name"><input value={form.emergencyContactName} onChange={set('emergencyContactName')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} className={inputClass} /></Field>
          <Field label="Phone"><input value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} className={inputClass} /></Field>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alternate</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name"><input value={form.alternateContactName} onChange={set('alternateContactName')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={form.alternateContactRelationship} onChange={set('alternateContactRelationship')} className={inputClass} /></Field>
          <Field label="Phone"><input value={form.alternateContactPhone} onChange={set('alternateContactPhone')} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <SectionCard number="3" title="Health Information" subtitle="Physicians, insurance, and medical history">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Physician Name"><input value={form.physicianName} onChange={set('physicianName')} className={inputClass} /></Field>
          <Field label="Physician Phone"><input value={form.physicianPhone} onChange={set('physicianPhone')} className={inputClass} /></Field>
          <Field label="Last Visit"><input type="date" value={form.lastVisitDate} onChange={set('lastVisitDate')} className={inputClass} /></Field>
          <Field label="Pharmacy"><input value={form.pharmacyName} onChange={set('pharmacyName')} className={inputClass} /></Field>
          <Field label="Pharmacy Phone"><input value={form.pharmacyPhone} onChange={set('pharmacyPhone')} className={inputClass} /></Field>
          <Field label="Preferred Hospital"><input value={form.preferredHospital} onChange={set('preferredHospital')} className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Insurance Provider"><input value={form.insuranceProvider} onChange={set('insuranceProvider')} className={inputClass} /></Field>
          <Field label="Member ID"><input value={form.insuranceMemberId} onChange={set('insuranceMemberId')} className={inputClass} /></Field>
          <Field label="Group #"><input value={form.insuranceGroupNumber} onChange={set('insuranceGroupNumber')} className={inputClass} /></Field>
        </div>
        <Field label="Medical Conditions / Diagnoses">
          <textarea value={form.medicalConditions} onChange={set('medicalConditions')} rows={3} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Allergies"><textarea value={form.allergies} onChange={set('allergies')} rows={3} className={inputClass} /></Field>
          <Field label="Current Medications"><textarea value={form.currentMedications} onChange={set('currentMedications')} rows={3} className={inputClass} /></Field>
        </div>
        <Field label="Special Diet / Restrictions">
          <textarea value={form.specialDiet} onChange={set('specialDiet')} rows={2} className={inputClass} />
        </Field>
      </SectionCard>
    </div>
  );
}

export function ClientIntakeStepTwo({ form, onChange }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  const toggleArray = (field, option) => {
    const current = form[field] || [];
    onChange(field, current.includes(option) ? current.filter((i) => i !== option) : [...current, option]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <p className="text-lg font-semibold text-gray-900">Care & Authorization</p>
        <p className="mt-1 text-sm text-gray-500">Step 2 of 2 — living situation, care needs, payment, and office details</p>
      </div>

      <SectionCard number="4" title="Living Situation" subtitle="Home environment and safety">
        <ChipGroup label="Living Arrangement" options={LIVING_ARRANGEMENTS} values={form.livingArrangements} onToggle={(opt) => toggleArray('livingArrangements', opt)} />
        <ChipGroup label="Home Accessibility" options={HOME_ACCESSIBILITY} values={form.homeAccessibility} onToggle={(opt) => toggleArray('homeAccessibility', opt)} />
        <ChipGroup label="Type of Residence" options={RESIDENCE_TYPES} values={form.residenceType} single onToggle={(opt) => onChange('residenceType', form.residenceType === opt ? '' : opt)} />
        <ChipGroup label="Assistive Devices" options={ASSISTIVE_DEVICES} values={form.assistiveDevices} onToggle={(opt) => toggleArray('assistiveDevices', opt)} />
        <YesNoField label="Pets" value={form.hasPets} onChange={(val) => onChange('hasPets', val)} descriptionValue={form.petsDescription} onDescriptionChange={set('petsDescription')} descriptionPlaceholder="Describe pets" />
        <YesNoField label="Fall history (past 6 months)" value={form.fallHistory} onChange={(val) => onChange('fallHistory', val)} descriptionValue={form.fallHistoryDescription} onDescriptionChange={set('fallHistoryDescription')} />
      </SectionCard>

      <SectionCard number="5" title="Care & Support Needs" subtitle="Services and scheduling preferences">
        <ChipGroup label="Type of care / services" options={SERVICE_TYPES} values={form.serviceTypes} onToggle={(opt) => toggleArray('serviceTypes', opt)} />
        <YesNoField label="Mobility assistance needed?" value={form.mobilityAssistanceNeeded} onChange={(val) => onChange('mobilityAssistanceNeeded', val)} descriptionValue={form.mobilityAssistanceDescription} onDescriptionChange={set('mobilityAssistanceDescription')} />
        <YesNoField label="Personal care assistance needed?" value={form.personalCareAssistanceNeeded} onChange={(val) => onChange('personalCareAssistanceNeeded', val)} descriptionValue={form.personalCareAssistanceDescription} onDescriptionChange={set('personalCareAssistanceDescription')} />
        <ChipGroup label="Frequency" options={CARE_FREQUENCIES} values={form.careFrequency} single onToggle={(opt) => onChange('careFrequency', form.careFrequency === opt ? '' : opt)} />
        <ChipGroup label="Preferred Days" options={PREFERRED_DAYS} values={form.preferredDays} onToggle={(opt) => toggleArray('preferredDays', opt)} />
        <ChipGroup label="Preferred Times" options={PREFERRED_TIMES} values={form.preferredTimes} onToggle={(opt) => toggleArray('preferredTimes', opt)} />
        <Field label="Special requests or notes">
          <textarea value={form.careNotes} onChange={set('careNotes')} rows={3} className={inputClass} />
        </Field>
      </SectionCard>

      <SectionCard number="6" title="Financial & Payment" subtitle="Billing and payment method">
        <ChipGroup label="Payment responsibility" options={PAYMENT_RESPONSIBILITIES} values={form.paymentResponsibility} single onToggle={(opt) => onChange('paymentResponsibility', form.paymentResponsibility === opt ? '' : opt)} />
        {form.paymentResponsibility === 'Other' && (
          <Field label="Other (specify)"><input value={form.paymentResponsibilityOther} onChange={set('paymentResponsibilityOther')} className={inputClass} /></Field>
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Billing address (if different)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address" className="sm:col-span-2"><input value={form.billingStreetAddress} onChange={set('billingStreetAddress')} className={inputClass} /></Field>
          <Field label="City"><input value={form.billingCity} onChange={set('billingCity')} className={inputClass} /></Field>
          <Field label="State"><input value={form.billingState} onChange={set('billingState')} className={inputClass} /></Field>
          <Field label="Zip"><input value={form.billingZip} onChange={set('billingZip')} className={inputClass} /></Field>
        </div>
        <ChipGroup label="Payment method" options={PAYMENT_METHODS} values={form.paymentMethods} onToggle={(opt) => toggleArray('paymentMethods', opt)} />
      </SectionCard>

      <SectionCard number="7" title="Authorization & Consent" subtitle="Client or representative signature">
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
          I certify that the information provided is accurate to the best of my knowledge and authorize
          the agency to contact me regarding care services.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Signature"><input value={form.authorizationSignature} onChange={set('authorizationSignature')} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={form.authorizationDate} onChange={set('authorizationDate')} className={inputClass} /></Field>
          <Field label="Printed name"><input value={form.authorizationPrintedName} onChange={set('authorizationPrintedName')} className={inputClass} /></Field>
          <Field label="Relationship (if not client)"><input value={form.authorizationRelationship} onChange={set('authorizationRelationship')} className={inputClass} /></Field>
        </div>
      </SectionCard>

      <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold text-gray-600">8</span>
          <div>
            <h3 className="text-base font-semibold text-gray-900">For Office Use Only</h3>
            <p className="mt-0.5 text-sm text-gray-500">Internal tracking and assignment</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Intake completed by"><input value={form.intakeCompletedBy} onChange={set('intakeCompletedBy')} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={form.intakeCompletedDate} onChange={set('intakeCompletedDate')} className={inputClass} /></Field>
          <Field label="Assigned to"><input value={form.assignedTo} onChange={set('assignedTo')} className={inputClass} /></Field>
          <Field label="Admission date"><input type="date" value={form.admissionDate} onChange={set('admissionDate')} className={inputClass} /></Field>
          <Field label="Care plan start"><input type="date" value={form.carePlanStartDate} onChange={set('carePlanStartDate')} className={inputClass} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={inputClass}>
              {['Active', 'Inactive', 'Pending'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Internal notes" className="sm:col-span-2">
            <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputClass} />
          </Field>
        </div>
      </section>
    </div>
  );
}
