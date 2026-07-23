import DigitalSignaturePad from '../../ui/DigitalSignaturePad';
import {
  EVV_METHODS, GENDERS, PHONE_TYPES, RELATIONSHIPS, SMARTPHONE_TYPES, toggleArrayValue,
} from '../../../utils/evvEnrollmentForm';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';
const readOnlyClass = 'w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700';

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

function Chips({ label, options, values, onToggle, single, readOnly }) {
  if (readOnly) {
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
            <button key={opt} type="button" onClick={() => onToggle(opt)} className={`rounded-xl border px-3 py-2 text-sm font-medium ${on ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{opt}</button>
          );
        })}
      </div>
    </div>
  );
}

function ReadField({ label, value }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className={readOnlyClass}>{value || '—'}</div>
    </div>
  );
}

function InputOrRead({ label, value, onChange, readOnly, type = 'text', required, className = '' }) {
  if (readOnly) {
    return (
      <div className={className}>
        <ReadField label={label} value={value} />
      </div>
    );
  }
  return (
    <Field label={label} required={required} className={className}>
      <input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  );
}

export function EvvEnrollmentStepOne({ form, onFormDataChange, readOnly = false, lockClientFields = false }) {
  const d = form.formData;
  const patch = (section, field, value) => onFormDataChange(section, { [field]: value });
  const clientLocked = readOnly || lockClientFields;
  const serviceLocked = readOnly || lockClientFields;

  return (
    <div className="space-y-5">
      <Section n="1" title="Client Information" subtitle={lockClientFields && !readOnly ? 'Pre-filled from care plan — contact your agency to update.' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputOrRead label="Client Full Name" value={d.clientInfo.clientFullName} onChange={(v) => patch('clientInfo', 'clientFullName', v)} readOnly={clientLocked} required />
          <InputOrRead label="Date of Birth" type="date" value={d.clientInfo.dob} onChange={(v) => patch('clientInfo', 'dob', v)} readOnly={clientLocked} />
          <div className="sm:col-span-2">
            <Chips label="Gender" options={GENDERS} values={d.clientInfo.gender} single onToggle={(v) => patch('clientInfo', 'gender', v)} readOnly={clientLocked} />
          </div>
          <InputOrRead label="Address" value={d.clientInfo.address} onChange={(v) => patch('clientInfo', 'address', v)} readOnly={clientLocked} className="sm:col-span-2" />
          <InputOrRead label="Apt / Suite" value={d.clientInfo.aptSuite} onChange={(v) => patch('clientInfo', 'aptSuite', v)} readOnly={clientLocked} />
          <InputOrRead label="City" value={d.clientInfo.city} onChange={(v) => patch('clientInfo', 'city', v)} readOnly={clientLocked} />
          <InputOrRead label="State" value={d.clientInfo.state} onChange={(v) => patch('clientInfo', 'state', v)} readOnly={clientLocked} />
          <InputOrRead label="Zip Code" value={d.clientInfo.zip} onChange={(v) => patch('clientInfo', 'zip', v)} readOnly={clientLocked} />
          <InputOrRead label="Phone" value={d.clientInfo.phone} onChange={(v) => patch('clientInfo', 'phone', v)} readOnly={clientLocked} />
          <InputOrRead label="Email" value={d.clientInfo.email} onChange={(v) => patch('clientInfo', 'email', v)} readOnly={clientLocked} />
          <InputOrRead label="Preferred Language" value={d.clientInfo.preferredLanguage} onChange={(v) => patch('clientInfo', 'preferredLanguage', v)} readOnly={clientLocked} />
        </div>
      </Section>

      <Section n="2" title="Caregiver / Employee Information" subtitle="Pre-filled from your employee profile — update only if needed.">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputOrRead label="Caregiver Full Name" value={d.caregiverInfo.fullName} onChange={(v) => patch('caregiverInfo', 'fullName', v)} readOnly={readOnly} required />
          <InputOrRead label="Employee ID" value={d.caregiverInfo.employeeId} onChange={(v) => patch('caregiverInfo', 'employeeId', v)} readOnly={readOnly || Boolean(d.caregiverInfo.employeeId)} />
          <InputOrRead label="Phone" value={d.caregiverInfo.phone} onChange={(v) => patch('caregiverInfo', 'phone', v)} readOnly={readOnly} />
          <InputOrRead label="Email" value={d.caregiverInfo.email} onChange={(v) => patch('caregiverInfo', 'email', v)} readOnly={readOnly} />
          <InputOrRead label="Date of Birth" type="date" value={d.caregiverInfo.dob} onChange={(v) => patch('caregiverInfo', 'dob', v)} readOnly={readOnly} />
          <div className="sm:col-span-2">
            <Chips label="Relationship to Client" options={RELATIONSHIPS} values={d.caregiverInfo.relationship} single onToggle={(v) => patch('caregiverInfo', 'relationship', v)} readOnly={readOnly} />
          </div>
          {d.caregiverInfo.relationship === 'Other' && (
            <InputOrRead label="Other Relationship" value={d.caregiverInfo.relationshipOther} onChange={(v) => patch('caregiverInfo', 'relationshipOther', v)} readOnly={readOnly} className="sm:col-span-2" />
          )}
          <InputOrRead label="Address" value={d.caregiverInfo.address} onChange={(v) => patch('caregiverInfo', 'address', v)} readOnly={readOnly} className="sm:col-span-2" />
          <InputOrRead label="City" value={d.caregiverInfo.city} onChange={(v) => patch('caregiverInfo', 'city', v)} readOnly={readOnly} />
          <InputOrRead label="State" value={d.caregiverInfo.state} onChange={(v) => patch('caregiverInfo', 'state', v)} readOnly={readOnly} />
          <InputOrRead label="Zip Code" value={d.caregiverInfo.zip} onChange={(v) => patch('caregiverInfo', 'zip', v)} readOnly={readOnly} />
        </div>
      </Section>

      <Section n="3" title="Service / Agency Information" subtitle={lockClientFields && !readOnly ? 'Assigned by your agency from the care plan.' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputOrRead label="Agency Name" value={d.serviceInfo.agencyName} onChange={(v) => patch('serviceInfo', 'agencyName', v)} readOnly={serviceLocked} />
          <InputOrRead label="Agency Phone" value={d.serviceInfo.agencyPhone} onChange={(v) => patch('serviceInfo', 'agencyPhone', v)} readOnly={serviceLocked} />
          <InputOrRead label="EVV Vendor (if applicable)" value={d.serviceInfo.evvVendor} onChange={(v) => patch('serviceInfo', 'evvVendor', v)} readOnly={serviceLocked} />
          <InputOrRead label="Medicaid / Program (if applicable)" value={d.serviceInfo.medicaidProgram} onChange={(v) => patch('serviceInfo', 'medicaidProgram', v)} readOnly={serviceLocked} />
        </div>
      </Section>
    </div>
  );
}

export function EvvEnrollmentStepTwo({ form, onFormDataChange, readOnly = false, showOfficeUse = false }) {
  const d = form.formData;
  const patch = (section, field, value) => onFormDataChange(section, { [field]: value });

  return (
    <div className="space-y-5">
      <Section n="4" title="EVV Method Preference" subtitle="Select all that apply. Available options may vary by program.">
        <Chips
          label="Preferred Methods"
          options={EVV_METHODS}
          values={d.evvMethods.methods}
          onToggle={(v) => patch('evvMethods', 'methods', toggleArrayValue(d.evvMethods.methods, v))}
          readOnly={readOnly}
        />
        <InputOrRead label="Other Method" value={d.evvMethods.other} onChange={(v) => patch('evvMethods', 'other', v)} readOnly={readOnly} />
      </Section>

      <Section n="5" title="Mobile App Enrollment" subtitle="Complete if using Mobile App.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Chips label="Smartphone Type" options={SMARTPHONE_TYPES} values={d.mobileEnrollment.smartphoneType} single onToggle={(v) => patch('mobileEnrollment', 'smartphoneType', v)} readOnly={readOnly} />
          <InputOrRead label="Mobile Number" value={d.mobileEnrollment.mobileNumber} onChange={(v) => patch('mobileEnrollment', 'mobileNumber', v)} readOnly={readOnly} />
          <InputOrRead label="Email for App Registration" value={d.mobileEnrollment.email} onChange={(v) => patch('mobileEnrollment', 'email', v)} readOnly={readOnly} className="sm:col-span-2" />
        </div>
      </Section>

      <Section n="6" title="Landline / IVR Enrollment" subtitle="Complete if using Landline or IVR.">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputOrRead label="Primary Phone for EVV" value={d.landlineEnrollment.primaryPhone} onChange={(v) => patch('landlineEnrollment', 'primaryPhone', v)} readOnly={readOnly} />
          <Chips label="Phone Type" options={PHONE_TYPES} values={d.landlineEnrollment.phoneType} single onToggle={(v) => patch('landlineEnrollment', 'phoneType', v)} readOnly={readOnly} />
          <InputOrRead label="Alternate Phone (optional)" value={d.landlineEnrollment.alternatePhone} onChange={(v) => patch('landlineEnrollment', 'alternatePhone', v)} readOnly={readOnly} className="sm:col-span-2" />
        </div>
      </Section>

      <Section n="7" title="Authorization & Consent">
        <p className="text-sm leading-relaxed text-gray-600">
          I consent to the use of Electronic Visit Verification (EVV) to record visits, support billing and claims,
          and comply with program requirements. I authorize the release of information as necessary.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {!readOnly ? (
            <>
              <Field label="Client / Representative Signature">
                <DigitalSignaturePad value={d.authorization.clientSignature} onChange={(v) => patch('authorization', 'clientSignature', v)} />
              </Field>
              <InputOrRead label="Date" type="date" value={d.authorization.clientDate} onChange={(v) => patch('authorization', 'clientDate', v)} />
              <Field label="Caregiver / Employee Signature">
                <DigitalSignaturePad value={d.authorization.caregiverSignature} onChange={(v) => patch('authorization', 'caregiverSignature', v)} />
              </Field>
              <InputOrRead label="Date" type="date" value={d.authorization.caregiverDate} onChange={(v) => patch('authorization', 'caregiverDate', v)} />
            </>
          ) : (
            <>
              <ReadField label="Client Signature" value={d.authorization.clientSignature ? 'Signed' : '—'} />
              <ReadField label="Client Date" value={d.authorization.clientDate} />
              <ReadField label="Caregiver Signature" value={d.authorization.caregiverSignature ? 'Signed' : '—'} />
              <ReadField label="Caregiver Date" value={d.authorization.caregiverDate} />
            </>
          )}
        </div>
      </Section>

      <Section n="8" title="Acknowledgement of Training">
        <p className="text-sm leading-relaxed text-gray-600">
          I acknowledge that I have received training on how to use the EVV system and understand my responsibilities.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {!readOnly ? (
            <>
              <Field label="Caregiver / Employee Signature">
                <DigitalSignaturePad value={d.trainingAck.caregiverSignature} onChange={(v) => patch('trainingAck', 'caregiverSignature', v)} />
              </Field>
              <InputOrRead label="Date" type="date" value={d.trainingAck.date} onChange={(v) => patch('trainingAck', 'date', v)} />
            </>
          ) : (
            <>
              <ReadField label="Caregiver Signature" value={d.trainingAck.caregiverSignature ? 'Signed' : '—'} />
              <ReadField label="Date" value={d.trainingAck.date} />
            </>
          )}
        </div>
      </Section>

      {showOfficeUse && (
        <Section n="9" title="For Office Use Only">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputOrRead label="EVV System" value={d.officeUse.evvSystem} onChange={(v) => patch('officeUse', 'evvSystem', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <InputOrRead label="Enrollment Date" type="date" value={d.officeUse.enrollmentDate} onChange={(v) => patch('officeUse', 'enrollmentDate', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <InputOrRead label="Staff Initials" value={d.officeUse.staffInitials} onChange={(v) => patch('officeUse', 'staffInitials', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <InputOrRead label="Method Set Up By" value={d.officeUse.methodSetUpBy} onChange={(v) => patch('officeUse', 'methodSetUpBy', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <InputOrRead label="Verified By" value={d.officeUse.verifiedBy} onChange={(v) => patch('officeUse', 'verifiedBy', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <InputOrRead label="Verification Date" type="date" value={d.officeUse.verificationDate} onChange={(v) => patch('officeUse', 'verificationDate', v)} readOnly={readOnly && form.status !== 'Submitted'} />
            <div className="sm:col-span-2">
              {readOnly && form.status !== 'Submitted' ? (
                <ReadField label="Notes" value={d.officeUse.notes} />
              ) : (
                <Field label="Notes">
                  <textarea value={d.officeUse.notes || ''} onChange={(e) => patch('officeUse', 'notes', e.target.value)} rows={3} className={inputClass} />
                </Field>
              )}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
