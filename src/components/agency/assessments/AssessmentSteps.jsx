import {
  ADL_ITEMS, ADL_SCORE_LABELS, ADL_SCORES, ALLERGY_TYPES, AMBULATION_TYPES, ASSESSMENT_TYPES,
  CLIENT_GOALS, CONTACT_METHODS, DECISION_LEVELS, DIET_TYPES, GENDERS, HOME_SAFETY_ITEMS,
  IADL_ITEMS, INSURANCE_TYPES, MARITAL_STATUSES, MEDICAL_HISTORY_ITEMS, MEMORY_LEVELS,
  ORIENTATION_LEVELS, REQUESTED_SERVICES, RISK_LEVELS, TRANSFER_TYPES, WEEK_DAYS,
} from '../../../constants/assessmentOptions';

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

function Field({ label, required, children, className = '', error }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-red-500"> *</span>}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{n}</span>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chips({ label, options, values, onToggle, single }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
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

export function AssessmentStepOne({ form, onHeaderChange, onFormDataChange, errors = {} }) {
  const d = form.formData;
  const set = (section, field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onFormDataChange(section, { [field]: val });
  };
  const toggle = (section, field, item) => {
    const arr = d[section][field] || [];
    onFormDataChange(section, { [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };
  const setMed = (i, field, val) => {
    const meds = [...d.medications];
    meds[i] = { ...meds[i], [field]: val };
    onFormDataChange('medications', meds, true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
        <p className="text-lg font-semibold text-gray-900">Client Assessment Form</p>
        <p className="text-sm text-gray-500">Enquiry & evaluation — step 1 of 2</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Assessor Name"><input value={form.assessorName} onChange={(e) => onHeaderChange('assessorName', e.target.value)} className={inputClass} /></Field>
          <Field label="Assessment Date"><input type="date" value={form.assessmentDate} onChange={(e) => onHeaderChange('assessmentDate', e.target.value)} className={inputClass} /></Field>
        </div>
        <div className="mt-4">
          <Chips
            label="Assessment Type"
            options={ASSESSMENT_TYPES}
            values={form.assessmentTypes}
            onToggle={(t) => {
              const arr = form.assessmentTypes || [];
              onHeaderChange('assessmentTypes', arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]);
            }}
          />
        </div>
      </div>

      <Section n="1" title="Client Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client Name" required error={errors.clientName} className="sm:col-span-2"><input value={d.clientInfo.clientName} onChange={set('clientInfo', 'clientName')} className={inputClass} /></Field>
          <Field label="DOB"><input type="date" value={d.clientInfo.dob} onChange={set('clientInfo', 'dob')} className={inputClass} /></Field>
          <Field label="Age"><input value={d.clientInfo.age} onChange={set('clientInfo', 'age')} className={inputClass} /></Field>
          <Chips label="Gender" options={GENDERS} values={d.clientInfo.gender} single onToggle={(g) => onFormDataChange('clientInfo', { gender: d.clientInfo.gender === g ? '' : g })} />
          <Chips label="Marital Status" options={MARITAL_STATUSES} values={d.clientInfo.maritalStatus} single onToggle={(m) => onFormDataChange('clientInfo', { maritalStatus: d.clientInfo.maritalStatus === m ? '' : m })} />
          <Field label="SSN (Optional)"><input value={d.clientInfo.ssn} onChange={set('clientInfo', 'ssn')} className={inputClass} /></Field>
          <Field label="Primary Language"><input value={d.clientInfo.primaryLanguage} onChange={set('clientInfo', 'primaryLanguage')} className={inputClass} /></Field>
          <Field label="Primary Diagnosis"><input value={d.clientInfo.primaryDiagnosis} onChange={set('clientInfo', 'primaryDiagnosis')} className={inputClass} /></Field>
          <Field label="Secondary Diagnoses"><input value={d.clientInfo.secondaryDiagnoses} onChange={set('clientInfo', 'secondaryDiagnoses')} className={inputClass} /></Field>
          <YesNo label="Interpreter needed?" value={d.clientInfo.interpreterNeeded} onChange={(v) => onFormDataChange('clientInfo', { interpreterNeeded: v })} />
        </div>
      </Section>

      <Section n="2" title="Contact Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Home Address" className="sm:col-span-2"><input value={d.contactInfo.homeAddress} onChange={set('contactInfo', 'homeAddress')} className={inputClass} /></Field>
          <Field label="City"><input value={d.contactInfo.city} onChange={set('contactInfo', 'city')} className={inputClass} /></Field>
          <Field label="State"><input value={d.contactInfo.state} onChange={set('contactInfo', 'state')} className={inputClass} /></Field>
          <Field label="ZIP"><input value={d.contactInfo.zip} onChange={set('contactInfo', 'zip')} className={inputClass} /></Field>
          <Field label="Home Phone"><input value={d.contactInfo.homePhone} onChange={set('contactInfo', 'homePhone')} className={inputClass} /></Field>
          <Field label="Mobile"><input value={d.contactInfo.mobile} onChange={set('contactInfo', 'mobile')} className={inputClass} /></Field>
          <Field label="Email"><input type="email" value={d.contactInfo.email} onChange={set('contactInfo', 'email')} className={inputClass} /></Field>
          <Chips label="Preferred Contact" options={CONTACT_METHODS} values={d.contactInfo.preferredContactMethods} onToggle={(m) => toggle('contactInfo', 'preferredContactMethods', m)} />
        </div>
      </Section>

      <Section n="3" title="Responsible Party">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input value={d.responsibleParty.name} onChange={set('responsibleParty', 'name')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={d.responsibleParty.relationship} onChange={set('responsibleParty', 'relationship')} className={inputClass} /></Field>
          <Field label="Phone"><input value={d.responsibleParty.phone} onChange={set('responsibleParty', 'phone')} className={inputClass} /></Field>
          <Field label="Email"><input value={d.responsibleParty.email} onChange={set('responsibleParty', 'email')} className={inputClass} /></Field>
          <YesNo label="Power of Attorney" value={d.responsibleParty.powerOfAttorney} onChange={(v) => onFormDataChange('responsibleParty', { powerOfAttorney: v })} />
          <YesNo label="Medical POA" value={d.responsibleParty.medicalPoa} onChange={(v) => onFormDataChange('responsibleParty', { medicalPoa: v })} />
          <YesNo label="Guardian" value={d.responsibleParty.guardian} onChange={(v) => onFormDataChange('responsibleParty', { guardian: v })} />
        </div>
      </Section>

      <Section n="4" title="Physician Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary Physician"><input value={d.physicianInfo.primaryPhysician} onChange={set('physicianInfo', 'primaryPhysician')} className={inputClass} /></Field>
          <Field label="Phone"><input value={d.physicianInfo.primaryPhysicianPhone} onChange={set('physicianInfo', 'primaryPhysicianPhone')} className={inputClass} /></Field>
          <Field label="Specialists" className="sm:col-span-2"><input value={d.physicianInfo.specialists} onChange={set('physicianInfo', 'specialists')} className={inputClass} /></Field>
          <Field label="Preferred Hospital"><input value={d.physicianInfo.preferredHospital} onChange={set('physicianInfo', 'preferredHospital')} className={inputClass} /></Field>
          <Field label="Pharmacy"><input value={d.physicianInfo.pharmacy} onChange={set('physicianInfo', 'pharmacy')} className={inputClass} /></Field>
        </div>
      </Section>

      <Section n="5" title="Insurance">
        <Chips label="Insurance Type" options={INSURANCE_TYPES} values={d.insurance.types} onToggle={(t) => toggle('insurance', 'types', t)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Policy Number"><input value={d.insurance.policyNumber} onChange={set('insurance', 'policyNumber')} className={inputClass} /></Field>
          <Field label="Authorization #"><input value={d.insurance.authorizationNumber} onChange={set('insurance', 'authorizationNumber')} className={inputClass} /></Field>
          <Field label="Hours Authorized"><input value={d.insurance.hoursAuthorized} onChange={set('insurance', 'hoursAuthorized')} className={inputClass} /></Field>
          <Field label="Start Date"><input type="date" value={d.insurance.startDate} onChange={set('insurance', 'startDate')} className={inputClass} /></Field>
        </div>
      </Section>

      <Section n="6" title="Emergency Information">
        <p className="text-xs font-semibold uppercase text-gray-400">Primary</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name"><input value={d.emergencyInfo.primaryName} onChange={set('emergencyInfo', 'primaryName')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={d.emergencyInfo.primaryRelationship} onChange={set('emergencyInfo', 'primaryRelationship')} className={inputClass} /></Field>
          <Field label="Phone"><input value={d.emergencyInfo.primaryPhone} onChange={set('emergencyInfo', 'primaryPhone')} className={inputClass} /></Field>
        </div>
        <p className="text-xs font-semibold uppercase text-gray-400">Backup</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name"><input value={d.emergencyInfo.backupName} onChange={set('emergencyInfo', 'backupName')} className={inputClass} /></Field>
          <Field label="Relationship"><input value={d.emergencyInfo.backupRelationship} onChange={set('emergencyInfo', 'backupRelationship')} className={inputClass} /></Field>
          <Field label="Phone"><input value={d.emergencyInfo.backupPhone} onChange={set('emergencyInfo', 'backupPhone')} className={inputClass} /></Field>
        </div>
      </Section>

      <Section n="7" title="Medical History">
        <Chips label="Conditions" options={MEDICAL_HISTORY_ITEMS} values={d.medicalHistory} onToggle={(item) => {
          const arr = d.medicalHistory || [];
          onFormDataChange('medicalHistory', arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item], true);
        }} />
      </Section>

      <Section n="8" title="Allergies">
        <Chips label="Allergy Type" options={ALLERGY_TYPES} values={d.allergies.types} onToggle={(t) => toggle('allergies', 'types', t)} />
        <Field label="Details"><textarea value={d.allergies.details} onChange={set('allergies', 'details')} rows={2} className={inputClass} /></Field>
      </Section>

      <Section n="9" title="Current Medications">
        <div className="space-y-3">
          {d.medications.map((med, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-5">
              <input placeholder="Medication" value={med.name} onChange={(e) => setMed(i, 'name', e.target.value)} className={inputClass} />
              <input placeholder="Dosage" value={med.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} className={inputClass} />
              <input placeholder="Frequency" value={med.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)} className={inputClass} />
              <input placeholder="Purpose" value={med.purpose} onChange={(e) => setMed(i, 'purpose', e.target.value)} className={inputClass} />
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={med.selfManaged} onChange={(e) => setMed(i, 'selfManaged', e.target.checked)} /> Self managed
              </label>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function AssessmentStepTwo({ form, onFormDataChange }) {
  const d = form.formData;
  const set = (section, field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onFormDataChange(section, { [field]: val });
  };
  const toggle = (section, field, item, root = false) => {
    if (root) {
      const arr = d[field] || [];
      onFormDataChange(field, arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item], true);
      return;
    }
    const arr = d[section][field] || [];
    onFormDataChange(section, { [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };

  return (
    <div className="space-y-6">
      <Section n="10" title="Activities of Daily Living (ADLs)">
        <p className="text-xs text-gray-500">0=Independent · 1=Supervision · 2=Limited · 3=Extensive · 4=Total</p>
        <div className="space-y-3">
          {ADL_ITEMS.map((item) => (
            <div key={item} className="flex flex-wrap items-center gap-2">
              <span className="w-28 text-sm font-medium text-gray-700">{item}</span>
              {ADL_SCORES.map((s) => (
                <button key={s} type="button" title={ADL_SCORE_LABELS[s]} onClick={() => onFormDataChange('adls', { ...d.adls, [item]: s }, true)} className={`h-9 w-9 rounded-lg border text-sm font-semibold ${d.adls[item] === s ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'}`}>{s}</button>
              ))}
            </div>
          ))}
        </div>
        <Field label="Comments"><textarea value={d.adlComments} onChange={(e) => onFormDataChange('adlComments', e.target.value, true)} rows={2} className={inputClass} /></Field>
      </Section>

      <Section n="11" title="Instrumental ADLs (IADLs)">
        {IADL_ITEMS.map((item) => (
          <div key={item} className="flex flex-wrap items-center gap-2">
            <span className="w-40 text-sm text-gray-700">{item}</span>
            {['Independent', 'Assistance'].map((v) => (
              <button key={v} type="button" onClick={() => onFormDataChange('iadls', { ...d.iadls, [item]: v }, true)} className={`rounded-lg border px-3 py-1.5 text-sm ${d.iadls[item] === v ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'}`}>{v}</button>
            ))}
          </div>
        ))}
      </Section>

      <Section n="12" title="Mobility">
        <Chips label="Ambulates" options={AMBULATION_TYPES} values={d.mobility.ambulation} onToggle={(t) => toggle('mobility', 'ambulation', t)} />
        <Chips label="Transfer Assistance" options={TRANSFER_TYPES} values={d.mobility.transferAssistance} onToggle={(t) => toggle('mobility', 'transferAssistance', t)} />
        <YesNo label="History of falls?" value={d.mobility.fallHistory} onChange={(v) => onFormDataChange('mobility', { ...d.mobility, fallHistory: v })} />
        {d.mobility.fallHistory && <Field label="Number of falls"><input value={d.mobility.fallCount} onChange={set('mobility', 'fallCount')} className={inputClass} /></Field>}
      </Section>

      <Section n="13" title="Cognitive Status">
        <Chips label="Alert & Oriented" options={ORIENTATION_LEVELS} values={d.cognitiveStatus.orientation} single onToggle={(v) => onFormDataChange('cognitiveStatus', { ...d.cognitiveStatus, orientation: d.cognitiveStatus.orientation === v ? '' : v })} />
        <Chips label="Memory" options={MEMORY_LEVELS} values={d.cognitiveStatus.memory} single onToggle={(v) => onFormDataChange('cognitiveStatus', { ...d.cognitiveStatus, memory: d.cognitiveStatus.memory === v ? '' : v })} />
        <Chips label="Decision Making" options={DECISION_LEVELS} values={d.cognitiveStatus.decisionMaking} single onToggle={(v) => onFormDataChange('cognitiveStatus', { ...d.cognitiveStatus, decisionMaking: d.cognitiveStatus.decisionMaking === v ? '' : v })} />
        <Field label="Behavior concerns"><textarea value={d.cognitiveStatus.behaviorConcerns} onChange={set('cognitiveStatus', 'behaviorConcerns')} rows={2} className={inputClass} /></Field>
      </Section>

      <Section n="14" title="Home Safety">
        {HOME_SAFETY_ITEMS.map((item) => (
          <YesNo key={item} label={item} value={d.homeSafety[item]} onChange={(v) => onFormDataChange('homeSafety', { ...d.homeSafety, [item]: v }, true)} />
        ))}
      </Section>

      <Section n="15" title="Nutrition">
        <Chips label="Diet Type" options={DIET_TYPES} values={d.nutrition.dietTypes} onToggle={(t) => toggle('nutrition', 'dietTypes', t)} />
        <YesNo label="Weight loss?" value={d.nutrition.weightLoss} onChange={(v) => onFormDataChange('nutrition', { ...d.nutrition, weightLoss: v })} />
        <YesNo label="Meal assistance?" value={d.nutrition.mealAssistance} onChange={(v) => onFormDataChange('nutrition', { ...d.nutrition, mealAssistance: v })} />
      </Section>

      <Section n="16" title="Pain Assessment">
        <YesNo label="Pain today?" value={d.painAssessment.painToday} onChange={(v) => onFormDataChange('painAssessment', { ...d.painAssessment, painToday: v })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pain score (0-10)"><input value={d.painAssessment.painScore} onChange={set('painAssessment', 'painScore')} className={inputClass} /></Field>
          <Field label="Location"><input value={d.painAssessment.location} onChange={set('painAssessment', 'location')} className={inputClass} /></Field>
        </div>
      </Section>

      <Section n="17" title="Mental Health">
        <YesNo label="Depression" value={d.mentalHealth.depression} onChange={(v) => onFormDataChange('mentalHealth', { ...d.mentalHealth, depression: v })} />
        <YesNo label="Anxiety" value={d.mentalHealth.anxiety} onChange={(v) => onFormDataChange('mentalHealth', { ...d.mentalHealth, anxiety: v })} />
      </Section>

      <Section n="18" title="Client Goals">
        <Chips label="Goals" options={CLIENT_GOALS} values={d.clientGoals} onToggle={(g) => toggle('clientGoals', null, g, true)} />
      </Section>

      <Section n="19" title="Requested Services">
        <Chips label="Services needed" options={REQUESTED_SERVICES} values={d.requestedServices} onToggle={(s) => toggle('requestedServices', null, s, true)} />
      </Section>

      <Section n="20" title="Schedule">
        <Chips label="Days needed" options={WEEK_DAYS} values={d.schedule.daysNeeded} onToggle={(day) => toggle('schedule', 'daysNeeded', day)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preferred start"><input type="time" value={d.schedule.preferredStart} onChange={set('schedule', 'preferredStart')} className={inputClass} /></Field>
          <Field label="Preferred end"><input type="time" value={d.schedule.preferredEnd} onChange={set('schedule', 'preferredEnd')} className={inputClass} /></Field>
        </div>
      </Section>

      <Section n="21" title="Care Coordinator Notes">
        <textarea value={d.coordinatorNotes} onChange={(e) => onFormDataChange('coordinatorNotes', e.target.value, true)} rows={4} className={inputClass} />
      </Section>

      <Section n="22" title="Care Plan Summary">
        <Field label="Primary needs"><textarea value={d.carePlanSummary.primaryNeeds} onChange={set('carePlanSummary', 'primaryNeeds')} rows={2} className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recommended weekly hours"><input type="number" min="0" value={d.carePlanSummary.recommendedWeeklyHours} onChange={set('carePlanSummary', 'recommendedWeeklyHours')} className={inputClass} /></Field>
          <Field label="Start of care"><input type="date" value={d.carePlanSummary.startOfCareDate} onChange={set('carePlanSummary', 'startOfCareDate')} className={inputClass} /></Field>
        </div>
        <Chips label="Risk level" options={RISK_LEVELS} values={d.carePlanSummary.riskLevel} single onToggle={(r) => onFormDataChange('carePlanSummary', { ...d.carePlanSummary, riskLevel: d.carePlanSummary.riskLevel === r ? '' : r })} />
      </Section>

      <Section n="23" title="Electronic Signatures">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client signature"><input value={d.signatures.clientSignature} onChange={set('signatures', 'clientSignature')} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={d.signatures.clientDate} onChange={set('signatures', 'clientDate')} className={inputClass} /></Field>
          <Field label="Responsible party"><input value={d.signatures.responsiblePartySignature} onChange={set('signatures', 'responsiblePartySignature')} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={d.signatures.responsiblePartyDate} onChange={set('signatures', 'responsiblePartyDate')} className={inputClass} /></Field>
          <Field label="Care coordinator"><input value={d.signatures.coordinatorSignature} onChange={set('signatures', 'coordinatorSignature')} className={inputClass} /></Field>
          <Field label="Date"><input type="date" value={d.signatures.coordinatorDate} onChange={set('signatures', 'coordinatorDate')} className={inputClass} /></Field>
        </div>
      </Section>
    </div>
  );
}
