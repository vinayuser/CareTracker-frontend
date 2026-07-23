import {
  Phone, Mail, MapPin, Calendar, Plus,
} from 'lucide-react';
import {
  PREFERRED_CONTACT_METHODS,
  LEAD_SOURCES,
  CAMPAIGNS,
  RELATIONSHIPS,
  GENDERS,
  MEDICAL_CONDITION_OPTIONS,
  CARE_TYPES,
  CARE_REQUIRED_FOR,
  PRIMARY_NEEDS,
  CARE_SCHEDULES,
  PREFERRED_TIMES,
  buildEmptyLeadFormData,
} from '../../../utils/leadForm';

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-default disabled:bg-slate-50';
const labelClass = 'mb-1.5 block text-[13px] font-medium text-slate-600';

function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function IconInput({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative">
      <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input {...props} className={`${inputClass} pl-9 ${className}`} />
    </div>
  );
}

function SectionCard({ title, children, action, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/90 px-5 py-3">
        <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ChipSelect({ options, values = [], onToggle, readOnly }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            disabled={readOnly}
            onClick={() => onToggle(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              active
                ? 'bg-primary/10 text-primary ring-1 ring-primary/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } disabled:cursor-default`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-slate-800">{value || '-'}</span>
    </div>
  );
}

export default function LeadFormSections({
  form,
  onFormDataChange,
  onHeaderChange,
  readOnly = false,
  onSaveNote,
}) {
  const empty = buildEmptyLeadFormData();
  const d = form?.formData || empty;
  const basic = d.basicInfo || empty.basicInfo;
  const recipient = d.careRecipient || empty.careRecipient;
  const family = d.familyRep || empty.familyRep;
  const care = d.careSummary || empty.careSummary;

  const patch = (section, key, value) => {
    onFormDataChange(section, { ...d[section], [key]: value });
  };

  const toggleChip = (section, key, opt) => {
    const arr = d[section][key] || [];
    const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
    patch(section, key, next);
  };

  const basicCard = (
    <SectionCard title="Basic Information">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input disabled={readOnly} value={basic.fullName} onChange={(e) => patch('basicInfo', 'fullName', e.target.value)} className={inputClass} placeholder="Robert Johnson" />
        </Field>
        <Field label="Relationship">
          <select disabled={readOnly} value={basic.relationship} onChange={(e) => patch('basicInfo', 'relationship', e.target.value)} className={inputClass}>
            <option value="">Select relationship</option>
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Phone Number" required>
          <IconInput icon={Phone} disabled={readOnly} value={basic.phone} onChange={(e) => patch('basicInfo', 'phone', e.target.value)} placeholder="+1 (415) 555-7890" />
        </Field>
        <Field label="Email">
          <IconInput icon={Mail} type="email" disabled={readOnly} value={basic.email} onChange={(e) => patch('basicInfo', 'email', e.target.value)} placeholder="name@email.com" />
        </Field>
        <Field label="Alternate Number">
          <IconInput icon={Phone} disabled={readOnly} value={basic.alternateNumber} onChange={(e) => patch('basicInfo', 'alternateNumber', e.target.value)} placeholder="+1 (415) 555-4411" />
        </Field>
        <Field label="Preferred Contact Method">
          <select disabled={readOnly} value={basic.preferredContactMethod} onChange={(e) => patch('basicInfo', 'preferredContactMethod', e.target.value)} className={inputClass}>
            {PREFERRED_CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Lead Source">
          <select disabled={readOnly} value={basic.leadSource} onChange={(e) => patch('basicInfo', 'leadSource', e.target.value)} className={inputClass}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Campaign">
          <select disabled={readOnly} value={basic.campaign} onChange={(e) => patch('basicInfo', 'campaign', e.target.value)} className={inputClass}>
            {CAMPAIGNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Inquiry Date" required>
          <IconInput icon={Calendar} type="date" disabled={readOnly} value={basic.inquiryDate} onChange={(e) => patch('basicInfo', 'inquiryDate', e.target.value)} />
        </Field>
        <Field label="Preferred Start Date">
          <IconInput icon={Calendar} type="date" disabled={readOnly} value={basic.preferredStartDate} onChange={(e) => patch('basicInfo', 'preferredStartDate', e.target.value)} />
        </Field>
        <Field label="Zip / Location" required className="sm:col-span-2">
          <IconInput icon={MapPin} disabled={readOnly} value={basic.zipLocation} onChange={(e) => patch('basicInfo', 'zipLocation', e.target.value)} placeholder="San Jose, CA 95124, USA" />
        </Field>
      </div>
    </SectionCard>
  );

  const recipientCard = (
    <SectionCard title="Care Recipient Details">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input disabled={readOnly} value={recipient.name} onChange={(e) => patch('careRecipient', 'name', e.target.value)} className={inputClass} placeholder="Mary Johnson" />
        </Field>
        <Field label="Age / DOB">
          <input disabled={readOnly} value={recipient.ageOrDob} onChange={(e) => patch('careRecipient', 'ageOrDob', e.target.value)} className={inputClass} placeholder="82 Years (12 May 1944)" />
        </Field>
        <Field label="Gender">
          <select disabled={readOnly} value={recipient.gender} onChange={(e) => patch('careRecipient', 'gender', e.target.value)} className={inputClass}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Doctor / Clinic">
          <input disabled={readOnly} value={recipient.doctorClinic} onChange={(e) => patch('careRecipient', 'doctorClinic', e.target.value)} className={inputClass} placeholder="City Care Medical Center" />
        </Field>
        <Field label="Medical Conditions" className="sm:col-span-2">
          <ChipSelect
            options={MEDICAL_CONDITION_OPTIONS}
            values={recipient.medicalConditions || []}
            readOnly={readOnly}
            onToggle={(opt) => toggleChip('careRecipient', 'medicalConditions', opt)}
          />
        </Field>
        <Field label="Allergies" className="sm:col-span-2">
          <input disabled={readOnly} value={recipient.allergies} onChange={(e) => patch('careRecipient', 'allergies', e.target.value)} className={inputClass} placeholder="No Known Allergies" />
        </Field>
      </div>
    </SectionCard>
  );

  const familyCard = (
    <SectionCard title="Family / Representative Details">
      {readOnly ? (
        <div>
          <InfoRow label="Name" value={family.name} />
          <InfoRow label="Relationship" value={family.relationship} />
          <InfoRow label="Phone" value={family.phone} />
          <InfoRow label="Email" value={family.email} />
          <InfoRow label="Address" value={family.address} />
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={Boolean(family.sameAsLeadAddress)} readOnly className="rounded border-slate-300 text-primary" />
            Same as Lead Address
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input value={family.name} onChange={(e) => patch('familyRep', 'name', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Relationship">
            <select value={family.relationship} onChange={(e) => patch('familyRep', 'relationship', e.target.value)} className={inputClass}>
              <option value="">Select</option>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Phone">
            <IconInput icon={Phone} value={family.phone} onChange={(e) => patch('familyRep', 'phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <IconInput icon={Mail} type="email" value={family.email} onChange={(e) => patch('familyRep', 'email', e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <IconInput icon={MapPin} value={family.address} onChange={(e) => patch('familyRep', 'address', e.target.value)} placeholder="2458 Willow Road, San Jose, CA 95124, USA" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(family.sameAsLeadAddress)}
              onChange={(e) => {
                const checked = e.target.checked;
                patch('familyRep', 'sameAsLeadAddress', checked);
                if (checked && basic.zipLocation) {
                  onFormDataChange('familyRep', {
                    ...family,
                    sameAsLeadAddress: true,
                    address: basic.zipLocation,
                  });
                }
              }}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Same as Lead Address
          </label>
        </div>
      )}
    </SectionCard>
  );

  const notesCard = (
    <SectionCard title="Internal Notes">
      <textarea
        disabled={readOnly}
        rows={4}
        value={form.notes ?? d.internalNotes ?? ''}
        onChange={(e) => onHeaderChange('notes', e.target.value)}
        className={`${inputClass} resize-y`}
        placeholder="Add your notes here..."
      />
      {!readOnly ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => onSaveNote?.()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Note
          </button>
        </div>
      ) : null}
    </SectionCard>
  );

  const careSummaryCard = (
    <SectionCard
      title="Care Summary"
      action={(
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Plus size={12} /> Requirements
        </span>
      )}
    >
      <div className="space-y-3.5">
        <Field label="Care Type Requested">
          <select disabled={readOnly} value={care.careTypeRequested} onChange={(e) => patch('careSummary', 'careTypeRequested', e.target.value)} className={inputClass}>
            {CARE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Care Required For">
          <select disabled={readOnly} value={care.careRequiredFor} onChange={(e) => patch('careSummary', 'careRequiredFor', e.target.value)} className={inputClass}>
            {CARE_REQUIRED_FOR.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Primary Needs">
          <ChipSelect
            options={PRIMARY_NEEDS}
            values={care.primaryNeeds || []}
            readOnly={readOnly}
            onToggle={(opt) => toggleChip('careSummary', 'primaryNeeds', opt)}
          />
        </Field>
        <Field label="Care Schedule">
          <select disabled={readOnly} value={care.careSchedule} onChange={(e) => patch('careSummary', 'careSchedule', e.target.value)} className={inputClass}>
            {CARE_SCHEDULES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Preferred Time">
          <select disabled={readOnly} value={care.preferredTime} onChange={(e) => patch('careSummary', 'preferredTime', e.target.value)} className={inputClass}>
            {PREFERRED_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Special Conditions">
          <input disabled={readOnly} value={care.specialConditions} onChange={(e) => patch('careSummary', 'specialConditions', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Notes">
          <textarea disabled={readOnly} rows={3} value={care.careNotes} onChange={(e) => patch('careSummary', 'careNotes', e.target.value)} className={`${inputClass} resize-y`} />
        </Field>
      </div>
    </SectionCard>
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        {basicCard}
        {recipientCard}
        {familyCard}
        {notesCard}
      </div>
      <div className="space-y-5">
        {careSummaryCard}
      </div>
    </div>
  );
}
