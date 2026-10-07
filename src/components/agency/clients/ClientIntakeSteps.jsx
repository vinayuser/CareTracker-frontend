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
import { RELATIONSHIPS } from '../../../utils/leadForm';
import { clientFieldMaxLength } from '../../../utils/clientFormValidation';
import AssessorPhotoUpload from '../../ui/AssessorPhotoUpload';
import DigitalSignaturePad from '../../ui/DigitalSignaturePad';

export const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';

const inputErrorClass =
  'w-full rounded-xl border border-red-400 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200';

export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

function fieldClass(hasError) {
  return hasError ? inputErrorClass : inputClass;
}

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

function TextInput({
  field,
  form,
  onChange,
  errors = {},
  type = 'text',
  placeholder,
  className,
  inputMode,
}) {
  const maxLength = clientFieldMaxLength(field);
  const error = errors[field];
  return (
    <input
      type={type}
      value={form[field] || ''}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={inputMode || (type === 'tel' ? 'tel' : undefined)}
      className={className || fieldClass(error)}
    />
  );
}

function Textarea({ field, form, onChange, errors = {}, rows = 3, placeholder }) {
  const maxLength = clientFieldMaxLength(field);
  const error = errors[field];
  const len = String(form[field] || '').length;
  return (
    <>
      <textarea
        value={form[field] || ''}
        onChange={(e) => onChange(field, e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={fieldClass(error)}
      />
      {maxLength ? (
        <p className="mt-1 text-right text-[11px] text-gray-400">{len}/{maxLength}</p>
      ) : null}
    </>
  );
}

function RelationshipSelect({ field, form, onChange, errors = {} }) {
  const value = form[field] || '';
  return (
    <select
      className={fieldClass(errors[field])}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
    >
      <option value="">Select relationship</option>
      {RELATIONSHIPS.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
      {value && !RELATIONSHIPS.includes(value) ? (
        <option value={value}>{value}</option>
      ) : null}
    </select>
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

function YesNoField({
  label,
  value,
  onChange,
  descriptionField,
  form,
  onFieldChange,
  descriptionPlaceholder,
  errors = {},
}) {
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
      {value && descriptionField ? (
        <Field label="If yes, please describe" error={errors[descriptionField]}>
          <TextInput
            field={descriptionField}
            form={form}
            onChange={onFieldChange}
            errors={errors}
            placeholder={descriptionPlaceholder}
          />
        </Field>
      ) : null}
    </div>
  );
}

export function ClientIntakeStepOne({ form, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-white p-5 sm:p-6">
        <p className="text-lg font-semibold text-gray-900">Client Intake Form</p>
        <p className="mt-1 text-sm text-gray-500">Step 1 of 2 — personal, emergency, and health information</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Intake Date">
            <input type="date" value={form.intakeDate} onChange={(e) => onChange('intakeDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Intake ID" error={errors.intakeId}>
            <TextInput field="intakeId" form={form} onChange={onChange} errors={errors} placeholder="Optional reference" />
          </Field>
        </div>
      </div>

      <SectionCard number="1" title="Client Information" subtitle="Basic demographics and contact details">
        <AssessorPhotoUpload
          label="Client Photo"
          value={form.profilePic || ''}
          onChange={(photo) => onChange('profilePic', photo)}
          shape="circle"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName}>
            <TextInput field="firstName" form={form} onChange={onChange} errors={errors} placeholder="First name" />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <TextInput field="lastName" form={form} onChange={onChange} errors={errors} placeholder="Last name" />
          </Field>
          <Field label="Preferred Name" error={errors.preferredName}>
            <TextInput field="preferredName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <ChipGroup label="Gender" options={GENDERS} values={form.gender} single onToggle={(opt) => onChange('gender', form.gender === opt ? '' : opt)} />
          </div>
          <div className="sm:col-span-2">
            <ChipGroup label="Marital Status" options={MARITAL_STATUSES} values={form.maritalStatus} single onToggle={(opt) => onChange('maritalStatus', form.maritalStatus === opt ? '' : opt)} />
          </div>
          <Field label="SSN (Last 4)" error={errors.ssnLast4}>
            <TextInput field="ssnLast4" form={form} onChange={onChange} errors={errors} inputMode="numeric" placeholder="XXXX" />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput field="email" form={form} onChange={onChange} errors={errors} type="email" />
          </Field>
          <Field label="Street Address" className="sm:col-span-2" error={errors.streetAddress}>
            <TextInput field="streetAddress" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Apt / Suite" error={errors.aptSuite}>
            <TextInput field="aptSuite" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="City" error={errors.city}>
            <TextInput field="city" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="State" error={errors.state}>
            <TextInput field="state" form={form} onChange={onChange} errors={errors} placeholder="TX" />
          </Field>
          <Field label="Zip Code" error={errors.zipCode}>
            <TextInput field="zipCode" form={form} onChange={onChange} errors={errors} inputMode="numeric" placeholder="78701" />
          </Field>
          <Field label="Phone (Home)" error={errors.phoneHome}>
            <TextInput field="phoneHome" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
          <Field label="Phone (Mobile)" error={errors.phone}>
            <TextInput field="phone" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
          <Field label="Preferred Language" error={errors.preferredLanguage}>
            <TextInput field="preferredLanguage" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Ethnicity" error={errors.ethnicity}>
            <TextInput field="ethnicity" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Race" error={errors.race}>
            <TextInput field="race" form={form} onChange={onChange} errors={errors} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard number="2" title="Emergency Contact" subtitle="Primary and alternate contacts">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Primary</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name" error={errors.emergencyContactName}>
            <TextInput field="emergencyContactName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Relationship" error={errors.emergencyContactRelationship}>
            <RelationshipSelect field="emergencyContactRelationship" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Phone" error={errors.emergencyContactPhone}>
            <TextInput field="emergencyContactPhone" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alternate</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name" error={errors.alternateContactName}>
            <TextInput field="alternateContactName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Relationship" error={errors.alternateContactRelationship}>
            <RelationshipSelect field="alternateContactRelationship" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Phone" error={errors.alternateContactPhone}>
            <TextInput field="alternateContactPhone" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard number="3" title="Health Information" subtitle="Physicians, insurance, and medical history">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Physician Name" error={errors.physicianName}>
            <TextInput field="physicianName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Physician Phone" error={errors.physicianPhone}>
            <TextInput field="physicianPhone" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
          <Field label="Last Visit">
            <input type="date" value={form.lastVisitDate} onChange={(e) => onChange('lastVisitDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Pharmacy" error={errors.pharmacyName}>
            <TextInput field="pharmacyName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Pharmacy Phone" error={errors.pharmacyPhone}>
            <TextInput field="pharmacyPhone" form={form} onChange={onChange} errors={errors} type="tel" placeholder="(555) 123-4567" />
          </Field>
          <Field label="Preferred Hospital" error={errors.preferredHospital}>
            <TextInput field="preferredHospital" form={form} onChange={onChange} errors={errors} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Insurance Provider" error={errors.insuranceProvider}>
            <TextInput field="insuranceProvider" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Member ID" error={errors.insuranceMemberId}>
            <TextInput field="insuranceMemberId" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Group #" error={errors.insuranceGroupNumber}>
            <TextInput field="insuranceGroupNumber" form={form} onChange={onChange} errors={errors} />
          </Field>
        </div>
        <Field label="Medical Conditions / Diagnoses" error={errors.medicalConditions}>
          <Textarea field="medicalConditions" form={form} onChange={onChange} errors={errors} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Allergies" error={errors.allergies}>
            <Textarea field="allergies" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Current Medications" error={errors.currentMedications}>
            <Textarea field="currentMedications" form={form} onChange={onChange} errors={errors} />
          </Field>
        </div>
        <Field label="Special Diet / Restrictions" error={errors.specialDiet}>
          <Textarea field="specialDiet" form={form} onChange={onChange} errors={errors} rows={2} />
        </Field>
      </SectionCard>
    </div>
  );
}

export function ClientIntakeStepTwo({ form, onChange, errors = {} }) {
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
        <YesNoField
          label="Pets"
          value={form.hasPets}
          onChange={(val) => onChange('hasPets', val)}
          descriptionField="petsDescription"
          form={form}
          onFieldChange={onChange}
          descriptionPlaceholder="Describe pets"
          errors={errors}
        />
        <YesNoField
          label="Fall history (past 6 months)"
          value={form.fallHistory}
          onChange={(val) => onChange('fallHistory', val)}
          descriptionField="fallHistoryDescription"
          form={form}
          onFieldChange={onChange}
          errors={errors}
        />
      </SectionCard>

      <SectionCard number="5" title="Care & Support Needs" subtitle="Services and scheduling preferences">
        <ChipGroup label="Type of care / services" options={SERVICE_TYPES} values={form.serviceTypes} onToggle={(opt) => toggleArray('serviceTypes', opt)} />
        <YesNoField
          label="Mobility assistance needed?"
          value={form.mobilityAssistanceNeeded}
          onChange={(val) => onChange('mobilityAssistanceNeeded', val)}
          descriptionField="mobilityAssistanceDescription"
          form={form}
          onFieldChange={onChange}
          errors={errors}
        />
        <YesNoField
          label="Personal care assistance needed?"
          value={form.personalCareAssistanceNeeded}
          onChange={(val) => onChange('personalCareAssistanceNeeded', val)}
          descriptionField="personalCareAssistanceDescription"
          form={form}
          onFieldChange={onChange}
          errors={errors}
        />
        <ChipGroup label="Frequency" options={CARE_FREQUENCIES} values={form.careFrequency} single onToggle={(opt) => onChange('careFrequency', form.careFrequency === opt ? '' : opt)} />
        <ChipGroup label="Preferred Days" options={PREFERRED_DAYS} values={form.preferredDays} onToggle={(opt) => toggleArray('preferredDays', opt)} />
        <ChipGroup label="Preferred Times" options={PREFERRED_TIMES} values={form.preferredTimes} onToggle={(opt) => toggleArray('preferredTimes', opt)} />
        <Field label="Special requests or notes" error={errors.careNotes}>
          <Textarea field="careNotes" form={form} onChange={onChange} errors={errors} />
        </Field>
      </SectionCard>

      <SectionCard number="6" title="Financial & Payment" subtitle="Billing and payment method">
        <ChipGroup label="Payment responsibility" options={PAYMENT_RESPONSIBILITIES} values={form.paymentResponsibility} single onToggle={(opt) => onChange('paymentResponsibility', form.paymentResponsibility === opt ? '' : opt)} />
        {form.paymentResponsibility === 'Other' && (
          <Field label="Other (specify)" error={errors.paymentResponsibilityOther}>
            <TextInput field="paymentResponsibilityOther" form={form} onChange={onChange} errors={errors} />
          </Field>
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Billing address (if different)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address" className="sm:col-span-2" error={errors.billingStreetAddress}>
            <TextInput field="billingStreetAddress" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="City" error={errors.billingCity}>
            <TextInput field="billingCity" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="State" error={errors.billingState}>
            <TextInput field="billingState" form={form} onChange={onChange} errors={errors} placeholder="TX" />
          </Field>
          <Field label="Zip" error={errors.billingZip}>
            <TextInput field="billingZip" form={form} onChange={onChange} errors={errors} inputMode="numeric" placeholder="78701" />
          </Field>
        </div>
        <ChipGroup label="Payment method" options={PAYMENT_METHODS} values={form.paymentMethods} onToggle={(opt) => toggleArray('paymentMethods', opt)} />
      </SectionCard>

      <SectionCard number="7" title="Authorization & Consent" subtitle="Client or representative signature">
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
          I certify that the information provided is accurate to the best of my knowledge and authorize
          the agency to contact me regarding care services.
        </p>
        <div className="sm:col-span-2">
          <DigitalSignaturePad
            label="Signature"
            value={form.authorizationSignature || ''}
            onChange={(sig) => onChange('authorizationSignature', sig)}
          />
          {errors.authorizationSignature ? (
            <p className="mt-1 text-xs text-red-600">{errors.authorizationSignature}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date">
            <input type="date" value={form.authorizationDate} onChange={(e) => onChange('authorizationDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Printed name" error={errors.authorizationPrintedName}>
            <TextInput field="authorizationPrintedName" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Relationship (if not client)" className="sm:col-span-2" error={errors.authorizationRelationship}>
            <RelationshipSelect field="authorizationRelationship" form={form} onChange={onChange} errors={errors} />
          </Field>
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
          <Field label="Intake completed by" error={errors.intakeCompletedBy}>
            <TextInput field="intakeCompletedBy" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Date">
            <input type="date" value={form.intakeCompletedDate} onChange={(e) => onChange('intakeCompletedDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Assigned to" error={errors.assignedTo}>
            <TextInput field="assignedTo" form={form} onChange={onChange} errors={errors} />
          </Field>
          <Field label="Admission date">
            <input type="date" value={form.admissionDate} onChange={(e) => onChange('admissionDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Care plan start">
            <input type="date" value={form.carePlanStartDate} onChange={(e) => onChange('carePlanStartDate', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => onChange('status', e.target.value)} className={inputClass}>
              {['Active', 'Inactive', 'Pending'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Internal notes" className="sm:col-span-2" error={errors.notes}>
            <Textarea field="notes" form={form} onChange={onChange} errors={errors} rows={2} />
          </Field>
        </div>
      </section>
    </div>
  );
}
