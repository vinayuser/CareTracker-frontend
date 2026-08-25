import {
  ASSESSMENT_PACKET_FORMS,
  CARE_INSTRUCTION_GROUPS,
  SAFETY_ITEMS,
} from '../../../../utils/assessmentPacket';
import {
  CheckboxRow,
  Field,
  LegalText,
  RadioRow,
  SectionCard,
  SignatureBlock,
  YnRRow,
  inputClass,
} from './PacketFields';

const QUOTE_SERVICES = [
  'Personal Care', 'Companionship', 'Homemaking', 'Medication Reminders',
  'Meal Preparation', 'Respite Care', 'Overnight Care',
];

const CARE_GROUP_TITLES = {
  assessment: 'Assessment',
  activityComfort: 'Activity / Comfort',
  elimination: 'Elimination',
  personalCare: 'Personal Care',
  medications: 'Medications',
  housekeeping: 'Housekeeping',
  mobility: 'Mobility',
  nutrition: 'Nutrition',
  specialty: 'Specialty',
  safety: 'Safety',
  records: 'Records',
};

const LOC_OPTS = ['Alert and oriented', 'Confused at times', 'Disoriented', 'Comatose'];
const SKIN_OPTS = ['Warm and dry', 'Cool', 'Moist', 'Peripheral edema', 'Pressure Ulcer', 'Wounds', 'Rash'];
const SKIN_COLOR = ['Normal', 'Flushed', 'Pale', 'Cyanotic', 'Jaundice'];
const CARDIO_OPTS = ['HR regular', 'HR irregular', 'Pacemaker', 'Hypertension', 'History of cardiac problems'];
const GI_OPTS = [
  'No history of problems', 'Constipation', 'Diarrhea', 'NG tube', 'G-Tube', 'TPN',
  'Abdomen soft, nontender', 'Abdomen firm, nondistended', 'Continent', 'Incontinent',
];
const GU_OPTS = ['No history of problems', 'Incontinent of urine', 'Foley catheter'];
const RESP_OPTS = ['Respirations regular and unlabored, lungs clear', 'SOB', 'Cough', 'Dyspnea'];
const ENDO_OPTS = ['No history of problems', 'Diabetes', 'Insulin dependent', 'Antidiabetic P.O. medication', 'Diet controlled'];
const MSK_OPTS = ['No problems', 'Arthritis', 'Fracture', 'Spinal Cord Injury'];
const PSYCH_OPTS = ['Calm', 'Agitated', 'Flat affect', 'Anxious', 'Depressed'];
const EATING_OPTS = [
  'Independent in food preparation and eating', 'Independent in eating',
  'Can prepare and eat meals with supervision',
  'Requires assistance with eating, requires preparation of meals',
  'Needs meals prepared and total assistance with eating',
  'Receives G-tube feeding / TPN',
];
const BATHING_OPTS = [
  'Independent', 'Needs supervision, minimal assistance',
  'Requires substantial amount of assistance', 'Needs to be bathed or showered, unable to assist',
];
const TOILETING_OPTS = [
  'Independent', 'Needs some supervision in using bathroom',
  'Needs substantial assistance in using bathroom, personal Hygiene',
  'Unable to use bathroom, uses diapers or briefs',
];
const DRESSING_OPTS = ['Independent, can dress self', 'Needs supervision', 'Requires assistance', 'Needs to be dressed'];
const AMB_OPTS = [
  'Walks independently', "Can walk with another's assistance", 'Needs device to ambulate',
  'Uses wheelchair, cannot ambulate', 'Can weight bear for transfers', 'Hoyer',
];
const EQUIP_OPTS = ['Cane', 'Walker', 'Wheelchair', 'Glasses', 'Contact lenses', 'Hearing aid', 'Prosthesis', 'Shower Chair'];
const DENTURE_OPTS = ['Upper Partials', 'Lower Partials'];
const LIVES_OPTS = ['Alone', 'With significant other(s)', 'With family', 'Other'];
const NON_MED = ['Chore', 'PA', 'CNA', 'Companion', 'Respite'];
const PDN = ['RN', 'LPN'];
const ADV_DIR = [
  'I do not have an Advanced Directive',
  'I have an Advance Directive',
  'I will give a copy to Mastercare',
];
const PRIORITY_OPTS = [
  { value: '1', label: '1: High Priority = Uninterrupted Service' },
  { value: '2', label: '2: Moderate Priority = Phone Call Required' },
  { value: '3', label: '3: Low Priority Stable = Can Miss a Visit' },
  { value: '4', label: '4: Lowest Priority = May Be Postponed for 3 Days' },
];

function nest(onChange, key, current = {}) {
  return (patch) => onChange({ [key]: { ...current, ...patch } });
}

function BoolCheck({ label, checked, onChange }) {
  return (
    <label className="flex items-start gap-2 text-sm text-gray-700">
      <input type="checkbox" className="mt-0.5" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Form110({ data, onChange, shared }) {
  const d = data || {};
  const neuro = d.neuro || {};
  const skin = d.skin || {};
  const setNeuro = nest(onChange, 'neuro', neuro);
  const setSkin = nest(onChange, 'skin', skin);
  const setVitals = nest(onChange, 'vitals', d.vitals || {});
  const setMed = (i, field, val) => {
    const meds = Array.from({ length: 10 }, (_, idx) => ({ name: '', dose: '', frequency: '', ...(d.medications?.[idx] || {}) }));
    meds[i] = { ...meds[i], [field]: val };
    onChange({ medications: meds });
  };
  const setDiag = (i, val) => {
    const diagnoses = Array.from({ length: 10 }, (_, idx) => d.diagnoses?.[idx] ?? '');
    diagnoses[i] = val;
    onChange({ diagnoses });
  };
  const setAllergy = (i, field, val) => {
    const allergies = Array.from({ length: 3 }, (_, idx) => ({ allergy: '', reaction: '', ...(d.allergies?.[idx] || {}) }));
    allergies[i] = { ...allergies[i], [field]: val };
    onChange({ allergies });
  };

  return (
    <div className="space-y-4">
      {(shared?.assessmentDate || shared?.assessorName) ? (
        <p className="text-xs text-gray-500">
          {shared.assessmentDate ? <>Assessment date: {shared.assessmentDate} · </> : null}
          {shared.assessorName ? <>Assessor: {shared.assessorName}</> : null}
        </p>
      ) : null}

      <SectionCard title="Client Information">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First Name">
            <input
              className={inputClass}
              value={d.firstName || ''}
              onChange={(e) => {
                const firstName = e.target.value;
                onChange({
                  firstName,
                  clientName: `${firstName} ${d.lastName || ''}`.trim(),
                });
              }}
            />
          </Field>
          <Field label="Last Name">
            <input
              className={inputClass}
              value={d.lastName || ''}
              onChange={(e) => {
                const lastName = e.target.value;
                onChange({
                  lastName,
                  clientName: `${d.firstName || ''} ${lastName}`.trim(),
                });
              }}
            />
          </Field>
          <Field label="Date"><input type="date" className={inputClass} value={d.date || ''} onChange={(e) => onChange({ date: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
          <Field label="Code Status"><input className={inputClass} value={d.codeStatus || ''} onChange={(e) => onChange({ codeStatus: e.target.value })} /></Field>
          <Field label="Sex"><RadioRow name="sex" options={['Male', 'Female']} value={d.sex || ''} onChange={(sex) => onChange({ sex })} /></Field>
          <Field label="Address" className="sm:col-span-2 lg:col-span-3"><input className={inputClass} value={d.address || ''} onChange={(e) => onChange({ address: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} /></Field>
          <Field label="Cell Phone"><input className={inputClass} value={d.cellPhone || ''} onChange={(e) => onChange({ cellPhone: e.target.value })} /></Field>
          <Field label="Email"><input className={inputClass} value={d.email || ''} onChange={(e) => onChange({ email: e.target.value })} /></Field>
          <Field label="City"><input className={inputClass} value={d.city || ''} onChange={(e) => onChange({ city: e.target.value })} /></Field>
          <Field label="State"><input className={inputClass} value={d.state || ''} onChange={(e) => onChange({ state: e.target.value })} /></Field>
          <Field label="ZIP"><input className={inputClass} value={d.zip || ''} onChange={(e) => onChange({ zip: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Emergency & Care Team">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Emergency Contact"><input className={inputClass} value={d.emergencyContact || ''} onChange={(e) => onChange({ emergencyContact: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.emergencyPhone || ''} onChange={(e) => onChange({ emergencyPhone: e.target.value })} /></Field>
          <Field label="Relationship"><input className={inputClass} value={d.emergencyRelationship || ''} onChange={(e) => onChange({ emergencyRelationship: e.target.value })} /></Field>
          <Field label="Primary Caregiver"><input className={inputClass} value={d.primaryCaregiver || ''} onChange={(e) => onChange({ primaryCaregiver: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.primaryCaregiverPhone || ''} onChange={(e) => onChange({ primaryCaregiverPhone: e.target.value })} /></Field>
          <Field label="Relationship"><input className={inputClass} value={d.primaryCaregiverRelationship || ''} onChange={(e) => onChange({ primaryCaregiverRelationship: e.target.value })} /></Field>
          <Field label="Primary Care Physician"><input className={inputClass} value={d.primaryCarePhysician || ''} onChange={(e) => onChange({ primaryCarePhysician: e.target.value })} /></Field>
          <Field label="PCP Phone"><input className={inputClass} value={d.pcpPhone || ''} onChange={(e) => onChange({ pcpPhone: e.target.value })} /></Field>
          <Field label="PCP Address"><input className={inputClass} value={d.pcpAddress || ''} onChange={(e) => onChange({ pcpAddress: e.target.value })} /></Field>
          <Field label="Pharmacy"><input className={inputClass} value={d.pharmacy || ''} onChange={(e) => onChange({ pharmacy: e.target.value })} /></Field>
          <Field label="Pharmacy Phone"><input className={inputClass} value={d.pharmacyPhone || ''} onChange={(e) => onChange({ pharmacyPhone: e.target.value })} /></Field>
          <Field label="Pharmacy Address"><input className={inputClass} value={d.pharmacyAddress || ''} onChange={(e) => onChange({ pharmacyAddress: e.target.value })} /></Field>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-gray-600">Source Information</p>
          <CheckboxRow options={['Client', 'Family', 'Other']} value={d.sourceInfo || []} onChange={(sourceInfo) => onChange({ sourceInfo })} columns={3} />
          {(d.sourceInfo || []).includes('Other') ? (
            <Field label="Other source" className="mt-2"><input className={inputClass} value={d.sourceOther || ''} onChange={(e) => onChange({ sourceOther: e.target.value })} /></Field>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Vitals & Diet">
        <div className="grid gap-3 sm:grid-cols-5">
          {['temperature', 'bp', 'hr', 'respirations', 'o2sat'].map((k) => (
            <Field key={k} label={k === 'o2sat' ? 'O2 sat' : k.toUpperCase()}>
              <input className={inputClass} value={d.vitals?.[k] || ''} onChange={(e) => setVitals({ [k]: e.target.value })} />
            </Field>
          ))}
        </div>
        <Field label="Special Diet" className="mt-3"><input className={inputClass} value={d.specialDiet || ''} onChange={(e) => onChange({ specialDiet: e.target.value })} /></Field>
      </SectionCard>

      <SectionCard title="Diagnoses & Medications">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Client Diagnosis</p>
            {Array.from({ length: 10 }, (_, i) => (
              <input key={i} className={inputClass} placeholder={`${i + 1}.`} value={d.diagnoses?.[i] || ''} onChange={(e) => setDiag(i, e.target.value)} />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Current Medications (Name / Dose / Frequency)</p>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="grid grid-cols-3 gap-1">
                <input className={inputClass} placeholder="Name" value={d.medications?.[i]?.name || ''} onChange={(e) => setMed(i, 'name', e.target.value)} />
                <input className={inputClass} placeholder="Dose" value={d.medications?.[i]?.dose || ''} onChange={(e) => setMed(i, 'dose', e.target.value)} />
                <input className={inputClass} placeholder="Freq" value={d.medications?.[i]?.frequency || ''} onChange={(e) => setMed(i, 'frequency', e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-gray-600">Allergic Reactions?</p>
          <RadioRow name="allergic" options={['YES', 'NO']} value={d.allergicReactions || ''} onChange={(allergicReactions) => onChange({ allergicReactions })} />
          <div className="mt-2 space-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input className={inputClass} placeholder={`Allergy ${i + 1}`} value={d.allergies?.[i]?.allergy || ''} onChange={(e) => setAllergy(i, 'allergy', e.target.value)} />
                <input className={inputClass} placeholder="Reaction" value={d.allergies?.[i]?.reaction || ''} onChange={(e) => setAllergy(i, 'reaction', e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-gray-600">Pertinent information for care / employee welfare?</p>
          <RadioRow name="pertinent" options={['Yes', 'No']} value={d.pertinentInfoYesNo || ''} onChange={(pertinentInfoYesNo) => onChange({ pertinentInfoYesNo })} />
          {d.pertinentInfoYesNo === 'Yes' ? (
            <textarea className={`${inputClass} mt-2 min-h-[72px]`} value={d.pertinentInfoDetails || ''} onChange={(e) => onChange({ pertinentInfoDetails: e.target.value })} />
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Systems Review">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Neuro</p>
            <p className="mb-1 text-xs font-medium text-gray-600">Level of Consciousness</p>
            <CheckboxRow options={LOC_OPTS} value={neuro.loc || []} onChange={(loc) => setNeuro({ loc })} />
            <Field label="Other" className="mt-2"><input className={inputClass} value={neuro.locOther || ''} onChange={(e) => setNeuro({ locOther: e.target.value })} /></Field>
            <div className="mt-2 space-y-1">
              <BoolCheck label="PERRLA" checked={neuro.perrla} onChange={(perrla) => setNeuro({ perrla })} />
              <BoolCheck label="Moves all extremities without problems" checked={neuro.movesExtremities} onChange={(movesExtremities) => setNeuro({ movesExtremities })} />
              <BoolCheck label="Paralysis" checked={neuro.paralysis} onChange={(paralysis) => setNeuro({ paralysis })} />
              <BoolCheck label="Weakness" checked={neuro.weakness} onChange={(weakness) => setNeuro({ weakness })} />
              {neuro.weakness ? <Field label="Side"><input className={inputClass} value={neuro.weaknessSide || ''} onChange={(e) => setNeuro({ weaknessSide: e.target.value })} /></Field> : null}
              <BoolCheck label="Abnormal gait" checked={neuro.abnormalGait} onChange={(abnormalGait) => setNeuro({ abnormalGait })} />
              <Field label="Pain (out of 10)"><input className={inputClass} value={neuro.painScore || ''} onChange={(e) => setNeuro({ painScore: e.target.value })} /></Field>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Skin</p>
            <CheckboxRow options={SKIN_OPTS} value={skin.items || []} onChange={(items) => setSkin({ items })} />
            <Field label="Edema where" className="mt-2"><input className={inputClass} value={skin.edemaWhere || ''} onChange={(e) => setSkin({ edemaWhere: e.target.value })} /></Field>
            <p className="mb-1 mt-2 text-xs font-medium text-gray-600">Color</p>
            <CheckboxRow options={SKIN_COLOR} value={skin.color || []} onChange={(color) => setSkin({ color })} columns={3} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Cardiovascular</p>
            <CheckboxRow options={CARDIO_OPTS} value={d.cardiovascular?.items || []} onChange={(items) => onChange({ cardiovascular: { items } })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Gastrointestinal</p>
            <CheckboxRow options={GI_OPTS} value={d.gastrointestinal?.items || []} onChange={(items) => onChange({ gastrointestinal: { ...d.gastrointestinal, items } })} />
            <Field label="Tenderness present" className="mt-2"><input className={inputClass} value={d.gastrointestinal?.tenderness || ''} onChange={(e) => onChange({ gastrointestinal: { ...d.gastrointestinal, tenderness: e.target.value } })} /></Field>
            <Field label="Other" className="mt-2"><input className={inputClass} value={d.gastrointestinal?.other || ''} onChange={(e) => onChange({ gastrointestinal: { ...d.gastrointestinal, other: e.target.value } })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Genitourinary</p>
            <CheckboxRow options={GU_OPTS} value={d.genitourinary?.items || []} onChange={(items) => onChange({ genitourinary: { ...d.genitourinary, items } })} />
            <Field label="Other" className="mt-2"><input className={inputClass} value={d.genitourinary?.other || ''} onChange={(e) => onChange({ genitourinary: { ...d.genitourinary, other: e.target.value } })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Respiratory</p>
            <CheckboxRow options={RESP_OPTS} value={d.respiratory?.items || []} onChange={(items) => onChange({ respiratory: { ...d.respiratory, items } })} />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Field label="Abnormal breath sounds"><input className={inputClass} value={d.respiratory?.abnormalSounds || ''} onChange={(e) => onChange({ respiratory: { ...d.respiratory, abnormalSounds: e.target.value } })} /></Field>
              <Field label="O2 liters/min"><input className={inputClass} value={d.respiratory?.o2Liters || ''} onChange={(e) => onChange({ respiratory: { ...d.respiratory, o2Liters: e.target.value } })} /></Field>
              <Field label="COPD"><input className={inputClass} value={d.respiratory?.copd || ''} onChange={(e) => onChange({ respiratory: { ...d.respiratory, copd: e.target.value } })} /></Field>
              <BoolCheck label="Smoker" checked={d.respiratory?.smoker} onChange={(smoker) => onChange({ respiratory: { ...d.respiratory, smoker } })} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Endocrine</p>
            <CheckboxRow options={ENDO_OPTS} value={d.endocrine?.items || []} onChange={(items) => onChange({ endocrine: { ...d.endocrine, items } })} />
            <Field label="Thyroid disease" className="mt-2"><input className={inputClass} value={d.endocrine?.thyroid || ''} onChange={(e) => onChange({ endocrine: { ...d.endocrine, thyroid: e.target.value } })} /></Field>
            <Field label="Other" className="mt-2"><input className={inputClass} value={d.endocrine?.other || ''} onChange={(e) => onChange({ endocrine: { ...d.endocrine, other: e.target.value } })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Musculoskeletal</p>
            <CheckboxRow options={MSK_OPTS} value={d.musculoskeletal?.items || []} onChange={(items) => onChange({ musculoskeletal: { ...d.musculoskeletal, items } })} />
            <Field label="Other" className="mt-2"><input className={inputClass} value={d.musculoskeletal?.other || ''} onChange={(e) => onChange({ musculoskeletal: { ...d.musculoskeletal, other: e.target.value } })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Psychological</p>
            <CheckboxRow options={PSYCH_OPTS} value={d.psychological?.items || []} onChange={(items) => onChange({ psychological: { ...d.psychological, items } })} />
            <Field label="Other" className="mt-2"><input className={inputClass} value={d.psychological?.other || ''} onChange={(e) => onChange({ psychological: { ...d.psychological, other: e.target.value } })} /></Field>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Medical History">
        <Field label="Hospital admissions within 5 years"><textarea className={`${inputClass} min-h-[64px]`} value={d.hospitalAdmissions || ''} onChange={(e) => onChange({ hospitalAdmissions: e.target.value })} /></Field>
        <Field label="Surgeries" className="mt-2"><textarea className={`${inputClass} min-h-[64px]`} value={d.surgeries || ''} onChange={(e) => onChange({ surgeries: e.target.value })} /></Field>
        <Field label="On-going medical problems" className="mt-2"><textarea className={`${inputClass} min-h-[64px]`} value={d.ongoingProblems || ''} onChange={(e) => onChange({ ongoingProblems: e.target.value })} /></Field>
      </SectionCard>

      <SectionCard title="ADLs & Equipment">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Eating</p>
            <RadioRow name="eating" options={EATING_OPTS} value={d.eating || ''} onChange={(eating) => onChange({ eating })} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Bathing</p>
            <RadioRow name="bathing" options={BATHING_OPTS} value={d.bathing || ''} onChange={(bathing) => onChange({ bathing })} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Toileting</p>
            <RadioRow name="toileting" options={TOILETING_OPTS} value={d.toileting || ''} onChange={(toileting) => onChange({ toileting })} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-600">Dressing</p>
            <RadioRow name="dressing" options={DRESSING_OPTS} value={d.dressing || ''} onChange={(dressing) => onChange({ dressing })} />
          </div>
          <div className="lg:col-span-2">
            <p className="mb-1 text-xs font-medium text-gray-600">Walking / Ambulation</p>
            <RadioRow name="ambulation" options={AMB_OPTS} value={d.ambulation || ''} onChange={(ambulation) => onChange({ ambulation })} />
            {d.ambulation === 'Needs device to ambulate' ? (
              <Field label="Device" className="mt-2"><input className={inputClass} value={d.ambulationDevice || ''} onChange={(e) => onChange({ ambulationDevice: e.target.value })} /></Field>
            ) : null}
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-gray-600">Equipment</p>
          <CheckboxRow options={EQUIP_OPTS} value={d.equipment || []} onChange={(equipment) => onChange({ equipment })} columns={3} />
          <p className="mb-1 mt-2 text-xs font-medium text-gray-600">Dentures</p>
          <CheckboxRow options={DENTURE_OPTS} value={d.dentures || []} onChange={(dentures) => onChange({ dentures })} columns={2} />
          <Field label="Other equipment" className="mt-2"><input className={inputClass} value={d.equipmentOther || ''} onChange={(e) => onChange({ equipmentOther: e.target.value })} /></Field>
        </div>
      </SectionCard>

      <SectionCard title="Social">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Primary Language"><input className={inputClass} value={d.primaryLanguage || ''} onChange={(e) => onChange({ primaryLanguage: e.target.value })} /></Field>
          <Field label="Highest Level of Schooling"><input className={inputClass} value={d.schooling || ''} onChange={(e) => onChange({ schooling: e.target.value })} /></Field>
          <Field label="Former Occupation"><input className={inputClass} value={d.formerOccupation || ''} onChange={(e) => onChange({ formerOccupation: e.target.value })} /></Field>
          <Field label="Hobbies and Interests"><input className={inputClass} value={d.hobbies || ''} onChange={(e) => onChange({ hobbies: e.target.value })} /></Field>
        </div>
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">Client Lives</p>
        <RadioRow name="livesWith" options={LIVES_OPTS} value={d.livesWith || ''} onChange={(livesWith) => onChange({ livesWith })} />
        {d.livesWith === 'Other' ? (
          <Field label="Other" className="mt-2"><input className={inputClass} value={d.livesWithOther || ''} onChange={(e) => onChange({ livesWithOther: e.target.value })} /></Field>
        ) : null}
      </SectionCard>

      <SectionCard title="Assessor Signature">
        <SignatureBlock
          title="Assessor"
          value={{ signature: d.assessorSignature || '', printedName: d.assessorPrintName || '', date: d.assessorDate || '' }}
          onChange={(s) => onChange({ assessorSignature: s.signature, assessorPrintName: s.printedName, assessorDate: s.date })}
        />
      </SectionCard>

      <SectionCard title="Quote / Care Plan Helpers" subtitle="Used to seed quote and care-plan fields">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="First Name"><input className={inputClass} value={d.firstName || ''} onChange={(e) => onChange({ firstName: e.target.value })} /></Field>
          <Field label="Last Name"><input className={inputClass} value={d.lastName || ''} onChange={(e) => onChange({ lastName: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputClass} value={d.email || ''} onChange={(e) => onChange({ email: e.target.value })} /></Field>
          <Field label="City"><input className={inputClass} value={d.city || ''} onChange={(e) => onChange({ city: e.target.value })} /></Field>
          <Field label="State"><input className={inputClass} value={d.state || ''} onChange={(e) => onChange({ state: e.target.value })} /></Field>
          <Field label="ZIP"><input className={inputClass} value={d.zip || ''} onChange={(e) => onChange({ zip: e.target.value })} /></Field>
          <Field label="Recommended Weekly Hours"><input className={inputClass} value={d.recommendedWeeklyHours || ''} onChange={(e) => onChange({ recommendedWeeklyHours: e.target.value })} /></Field>
          <Field label="Start of Care Date"><input type="date" className={inputClass} value={d.startOfCareDate || ''} onChange={(e) => onChange({ startOfCareDate: e.target.value })} /></Field>
          <Field label="Risk Level">
            <RadioRow name="risk" options={['Low', 'Moderate', 'High']} value={d.riskLevel || ''} onChange={(riskLevel) => onChange({ riskLevel })} />
          </Field>
        </div>
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">Requested Services</p>
        <CheckboxRow options={QUOTE_SERVICES} value={d.requestedServices || []} onChange={(requestedServices) => onChange({ requestedServices })} columns={3} />
      </SectionCard>
    </div>
  );
}

function Form324({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="What Personal Assistants May NOT Do">
        <LegalText>
          <p>Personal Assistants do not: perform tasks not on the Care Plan; give enemas or remove impactions; irrigate Foley, supra-pubic, or colostomy; provide decubitus/wound care; care for tracheotomy tubes or suctioning; vaginal irrigation or tampon insertion; tube feeding; massage/rub legs; cut fingernails or toenails; restrain clients; change sterile dressings; give medical or legal advice; heavy lifting unrelated to client care; household repairs; care for family members; handle checkbooks/finances; accept gifts or extra pay; landscaping/yard work; smoke on shift; eat client food; text/talk on phone while on shift; drive without prior office approval; enter the home without the client present; or call clients to cancel/reschedule shifts.</p>
          <BoolCheck
            label="I have read and understand what a Personal Assistant may not do. If I have questions about my service, I will contact my Service Supervisor."
            checked={d.acknowledged}
            onChange={(acknowledged) => onChange({ acknowledged })}
          />
        </LegalText>
      </SectionCard>
      <SignatureBlock title="Client / Client Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form325({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Participant Agreement Release">
        <LegalText>
          <p>In consideration of participation in the Homecare program, caregivers do not intend to harm or damage belongings or the home. During ADLs it is common that items may be unintentionally broken or misplaced, and caregivers will use household cleaning products and equipment (vacuum, appliances, washer/dryer). The client is responsible for replacing used supplies.</p>
          <p>The participant releases and holds harmless the agency, its owners, officers, employees, and agents from claims arising from damage to or use of personal property in the course of care, whether negligent or not. Unusual misuse or intentional destruction must be reported within 24 hours; failure to report may prevent validation of a claim.</p>
        </LegalText>
        <Field label="Print Name" className="mt-3"><input className={inputClass} value={d.printName || ''} onChange={(e) => onChange({ printName: e.target.value })} /></Field>
      </SectionCard>
      <SignatureBlock title="Client Signature" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
    </div>
  );
}

function Form350({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Client Handbook Acknowledgement">
        <LegalText>
          <p>I acknowledge that I have received a copy of the Client Handbook describing the agency, Notice of Privacy Practices (HIPAA), Client Rights and Responsibilities, Grievance Reporting Procedures, Agency Contact Information, Home Safety and Emergency Planning, and Advance Directives information. I am expected to read and abide by the Handbook and will contact my Service Supervisor with questions.</p>
        </LegalText>
        <Field label="Print First and Last Name" className="mt-3"><input className={inputClass} value={d.printName || ''} onChange={(e) => onChange({ printName: e.target.value })} /></Field>
      </SectionCard>
      <SignatureBlock title="Client / Legal Guardian" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form400({ data, onChange }) {
  const d = data || {};
  const tasks = d.tasks || {};
  const setTask = (label, patch) => {
    onChange({ tasks: { ...tasks, [label]: { enabled: false, frequency: '', ...tasks[label], ...patch } } });
  };
  return (
    <div className="space-y-4">
      <SectionCard title="Care Instructions">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
        </div>
      </SectionCard>
      {Object.entries(CARE_INSTRUCTION_GROUPS).map(([key, labels]) => (
        <SectionCard key={key} title={CARE_GROUP_TITLES[key] || key}>
          <div className="space-y-2">
            {labels.map((label) => {
              const row = tasks[label] || { enabled: false, frequency: '' };
              return (
                <div key={label} className="flex flex-wrap items-center gap-2 border-b border-gray-50 py-1.5">
                  <label className="flex min-w-[12rem] flex-1 items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="mt-0.5" checked={!!row.enabled} onChange={(e) => setTask(label, { enabled: e.target.checked })} />
                    <span>{label}</span>
                  </label>
                  <input
                    className={`${inputClass} w-40`}
                    placeholder="Frequency"
                    value={row.frequency || ''}
                    onChange={(e) => setTask(label, { frequency: e.target.value })}
                    disabled={!row.enabled}
                  />
                </div>
              );
            })}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function Form410({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Care Plan Acknowledgement">
        <LegalText>
          <p>I have been informed of the current Service Plan / Individual Care Plan and have carefully read and understand the services identified for this client.</p>
        </LegalText>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Print First and Last Name"><input className={inputClass} value={d.printName || ''} onChange={(e) => onChange({ printName: e.target.value })} /></Field>
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
        </div>
        <Field label="Comments" className="mt-3"><textarea className={`${inputClass} min-h-[80px]`} value={d.comments || ''} onChange={(e) => onChange({ comments: e.target.value })} /></Field>
      </SectionCard>
      <SignatureBlock title="Employee" value={d.employee || {}} onChange={(employee) => onChange({ employee })} />
      <SignatureBlock title="Client" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form610({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Client Concerns & Grievance Process">
        <LegalText>
          <p>All clients have the right to file a complaint or grievance at any time and to continue care without fear of retaliation. Information is kept confidential. The agency reviews concerns and starts investigation within 48 hours and attempts resolution within 14 days. You have been provided the Grievance Policy and Procedure and Client Grievance Forms.</p>
          <BoolCheck
            label="I have been informed of the grievance process and have received a copy of the Grievance Policy and Procedure."
            checked={d.acknowledged}
            onChange={(acknowledged) => onChange({ acknowledged })}
          />
        </LegalText>
      </SectionCard>
      <SignatureBlock title="Client / Legal Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
    </div>
  );
}

function Form790({ data, onChange }) {
  const d = data || {};
  const entries = d.entries || [];
  const setEntry = (i, patch) => {
    const next = Array.from({ length: Math.max(8, entries.length) }, (_, idx) => ({ date: '', time: '', notes: '', ...entries[idx] }));
    next[i] = { ...next[i], ...patch };
    onChange({ entries: next });
  };
  return (
    <div className="space-y-4">
      <SectionCard title="Case Notes">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Client ID"><input className={inputClass} value={d.clientId || ''} onChange={(e) => onChange({ clientId: e.target.value })} /></Field>
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="Client DOB"><input type="date" className={inputClass} value={d.clientDob || ''} onChange={(e) => onChange({ clientDob: e.target.value })} /></Field>
          <Field label="Representative Name"><input className={inputClass} value={d.representativeName || ''} onChange={(e) => onChange({ representativeName: e.target.value })} /></Field>
          <Field label="Representative Title"><input className={inputClass} value={d.representativeTitle || ''} onChange={(e) => onChange({ representativeTitle: e.target.value })} /></Field>
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: Math.max(8, entries.length) }, (_, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-gray-100 p-3 sm:grid-cols-[8rem_6rem_1fr]">
              <Field label="Date"><input type="date" className={inputClass} value={entries[i]?.date || ''} onChange={(e) => setEntry(i, { date: e.target.value })} /></Field>
              <Field label="Time"><input type="time" className={inputClass} value={entries[i]?.time || ''} onChange={(e) => setEntry(i, { time: e.target.value })} /></Field>
              <Field label="Notes"><textarea className={`${inputClass} min-h-[56px]`} value={entries[i]?.notes || ''} onChange={(e) => setEntry(i, { notes: e.target.value })} /></Field>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Form800({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Nondiscrimination Notice">
        <LegalText>
          <p>The agency complies with applicable Federal civil rights laws and does not discriminate on the basis of race, color, national origin, age, sex, sexual orientation, gender identity and expression, or disability in employment, admission, treatment, or receipt of services.</p>
          <p>Free aids and services are available for people with disabilities (e.g., qualified sign language interpreters, large print/audio/accessible formats) and free language assistance for people whose primary language is not English. Grievances may be filed with the agency Civil Rights Coordinator or with the U.S. Department of Health and Human Services, Office for Civil Rights.</p>
          <BoolCheck label="I acknowledge receipt of this Nondiscrimination Notice." checked={d.acknowledged} onChange={(acknowledged) => onChange({ acknowledged })} />
        </LegalText>
      </SectionCard>
      <SignatureBlock title="Client / Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
    </div>
  );
}

function Form1009({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Consent for Homecare Services">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
        </div>
        <LegalText>
          <p className="mt-3">I consent to services documented in the Plan of Care and understand only those services are to be rendered in my residence. I authorize release of medical records as needed for care coordination, payors, and regulators. I accept responsibility for unapproved changes or refusal of care.</p>
        </LegalText>
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">Non-Medical services</p>
        <CheckboxRow options={NON_MED} value={d.nonMedical || []} onChange={(nonMedical) => onChange({ nonMedical })} columns={3} />
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">Private Duty Nursing</p>
        <CheckboxRow options={PDN} value={d.privateDutyNursing || []} onChange={(privateDutyNursing) => onChange({ privateDutyNursing })} columns={2} />
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-gray-600">Billing Cycle</p>
          <RadioRow name="billing" options={['Weekly', 'Bi-Weekly', 'Monthly']} value={d.billingCycle || ''} onChange={(billingCycle) => onChange({ billingCycle })} />
        </div>
        <div className="mt-3 space-y-2">
          <BoolCheck label="Private Medical Insurance / Managed Care / Third-Party / LTC will pay" checked={d.privateInsurancePays} onChange={(privateInsurancePays) => onChange({ privateInsurancePays })} />
          {d.privateInsurancePays ? <Field label="Estimated co-pay / deductible ($)"><input className={inputClass} value={d.copayEstimate || ''} onChange={(e) => onChange({ copayEstimate: e.target.value })} /></Field> : null}
          <BoolCheck label="Private Pay — I am responsible for the total amount due" checked={d.privatePay} onChange={(privatePay) => onChange({ privatePay })} />
          {d.privatePay ? <Field label="Charges ($)"><input className={inputClass} value={d.privatePayCharges || ''} onChange={(e) => onChange({ privatePayCharges: e.target.value })} /></Field> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Other payment source"><input className={inputClass} value={d.otherPayment || ''} onChange={(e) => onChange({ otherPayment: e.target.value })} /></Field>
            <Field label="Other amount ($)"><input className={inputClass} value={d.otherPaymentAmount || ''} onChange={(e) => onChange({ otherPaymentAmount: e.target.value })} /></Field>
            <Field label="2-week deposit hours"><input className={inputClass} value={d.depositHours || ''} onChange={(e) => onChange({ depositHours: e.target.value })} /></Field>
            <Field label="Deposit amount ($)"><input className={inputClass} value={d.depositAmount || ''} onChange={(e) => onChange({ depositAmount: e.target.value })} /></Field>
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-gray-600">Advance Directive</p>
          <RadioRow name="adv" options={ADV_DIR} value={d.advancedDirective || ''} onChange={(advancedDirective) => onChange({ advancedDirective })} />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Field label="Directive holder name"><input className={inputClass} value={d.advancedDirectiveHolder || ''} onChange={(e) => onChange({ advancedDirectiveHolder: e.target.value })} /></Field>
            <Field label="Relationship"><input className={inputClass} value={d.advancedDirectiveRelationship || ''} onChange={(e) => onChange({ advancedDirectiveRelationship: e.target.value })} /></Field>
          </div>
        </div>
      </SectionCard>
      <SignatureBlock title="Client / Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form1081({ data, onChange }) {
  const d = data || {};
  const parties = Array.from({ length: 4 }, (_, i) => d.parties?.[i] ?? '');
  const setParty = (i, val) => {
    const next = [...parties];
    next[i] = val;
    onChange({ parties: next });
  };
  return (
    <div className="space-y-4">
      <SectionCard title="Consent to Release / Obtain Information">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
        </div>
        <LegalText>
          <p className="mt-3">Under HIPAA I have privacy rights regarding protected health information (PHI). PHI may be used to conduct treatment among providers, obtain payment from third-party payers, and conduct normal agency operations such as quality reviews. I may request restrictions (the agency is not required to agree) and may revoke this consent in writing except for information already used or disclosed.</p>
        </LegalText>
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">I authorize the agency to</p>
        <CheckboxRow options={['Release', 'Obtain']} value={d.releaseObtain || []} onChange={(releaseObtain) => onChange({ releaseObtain })} columns={2} />
        <div className="mt-3 space-y-2">
          <BoolCheck label="Entire Medical Records (including billing, insurance, and other provider records)" checked={d.entireMedicalRecords} onChange={(entireMedicalRecords) => onChange({ entireMedicalRecords })} />
          <BoolCheck label="Include Mental Health Records" checked={d.includeMentalHealth} onChange={(includeMentalHealth) => onChange({ includeMentalHealth })} />
          <BoolCheck label="Include Alcohol / Drug Treatment" checked={d.includeAlcoholDrug} onChange={(includeAlcoholDrug) => onChange({ includeAlcoholDrug })} />
          <BoolCheck label="Include Communicable Diseases (including HIV & AIDS)" checked={d.includeCommunicable} onChange={(includeCommunicable) => onChange({ includeCommunicable })} />
          <Field label="Medical records from"><input className={inputClass} value={d.medicalRecordsFrom || ''} onChange={(e) => onChange({ medicalRecordsFrom: e.target.value })} /></Field>
          <Field label="Other"><input className={inputClass} value={d.other || ''} onChange={(e) => onChange({ other: e.target.value })} /></Field>
        </div>
        <p className="mb-1 mt-3 text-xs font-medium text-gray-600">Release from / to</p>
        <div className="space-y-2">
          {parties.map((p, i) => (
            <Field key={i} label={`${String.fromCharCode(97 + i)}.`}>
              <input className={inputClass} value={p} onChange={(e) => setParty(i, e.target.value)} />
            </Field>
          ))}
        </div>
      </SectionCard>
      <SignatureBlock title="Person Giving Consent" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
    </div>
  );
}

function Form1082({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="HIPAA Notice of Privacy Practices" subtitle={`Effective ${d.effectiveDate || '01/01/2016'}`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
          <Field label="Effective Date"><input className={inputClass} value={d.effectiveDate || ''} onChange={(e) => onChange({ effectiveDate: e.target.value })} /></Field>
        </div>
        <LegalText>
          <p className="mt-3">This Notice describes how medical information may be used and disclosed and how you can get access to it. The agency maintains the privacy of protected health information, provides this notice of legal duties and privacy practices, and follows the notice currently in effect.</p>
          <p>PHI may be used for plan of care/treatment, payment, and agency operations. Special situations include emergency notifications, workers&apos; compensation, public health, law enforcement, defense of legal claims, and duty-to-warn disclosures as required by law. Other uses require written permission, which you may revoke.</p>
          <p>Your rights include inspecting and copying records, obtaining a paper copy of this notice, breach notification, requesting amendments, requesting restrictions, and requesting confidential communications. The agency may update this notice; written requests may be sent to the agency office.</p>
          <BoolCheck
            label="I acknowledge that I have received and reviewed this HIPAA Notice of Privacy Practices."
            checked={d.acknowledged}
            onChange={(acknowledged) => onChange({ acknowledged })}
          />
        </LegalText>
      </SectionCard>
      <SignatureBlock title="Client / Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
    </div>
  );
}

function Form1083({ data, onChange }) {
  const d = data || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Assignment of Benefits">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First Name"><input className={inputClass} value={d.firstName || ''} onChange={(e) => onChange({ firstName: e.target.value })} /></Field>
          <Field label="Last Name"><input className={inputClass} value={d.lastName || ''} onChange={(e) => onChange({ lastName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} /></Field>
          <Field label="Address" className="sm:col-span-2"><input className={inputClass} value={d.address || ''} onChange={(e) => onChange({ address: e.target.value })} /></Field>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Insurance Carrier"><input className={inputClass} value={d.insuranceCarrier || ''} onChange={(e) => onChange({ insuranceCarrier: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-4 pt-6">
            <BoolCheck label="TriWest" checked={d.triWest} onChange={(triWest) => onChange({ triWest })} />
            <BoolCheck label="VA Referral" checked={d.vaReferral} onChange={(vaReferral) => onChange({ vaReferral })} />
          </div>
          <Field label="Insurance Address"><input className={inputClass} value={d.insuranceAddress || ''} onChange={(e) => onChange({ insuranceAddress: e.target.value })} /></Field>
          <Field label="Insurance Phone"><input className={inputClass} value={d.insurancePhone || ''} onChange={(e) => onChange({ insurancePhone: e.target.value })} /></Field>
          <Field label="Policy Number"><input className={inputClass} value={d.policyNumber || ''} onChange={(e) => onChange({ policyNumber: e.target.value })} /></Field>
          <Field label="Claim Number"><input className={inputClass} value={d.claimNumber || ''} onChange={(e) => onChange({ claimNumber: e.target.value })} /></Field>
          <Field label="Client Pays (%)"><input className={inputClass} value={d.clientPaysPercent || ''} onChange={(e) => onChange({ clientPaysPercent: e.target.value })} /></Field>
          <Field label="Insurance Pays (%)"><input className={inputClass} value={d.insurancePaysPercent || ''} onChange={(e) => onChange({ insurancePaysPercent: e.target.value })} /></Field>
        </div>
        <LegalText>
          <p className="mt-3">I assign Long-Term Care benefits to the agency and direct my carrier to pay the agency directly. I remain responsible for amounts not covered. I authorize release of information needed to process claims. I am financially responsible for charges incurred as set forth in the Client Service Agreement.</p>
        </LegalText>
      </SectionCard>
      <SignatureBlock title="Client or Legal Representative" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form7000({ data, onChange }) {
  const d = data || {};
  const physicians = Array.from({ length: 3 }, (_, i) => ({ name: '', phone: '', ...(d.physicians?.[i] || {}) }));
  const setPhys = (i, patch) => {
    const next = physicians.map((p, idx) => (idx === i ? { ...p, ...patch } : p));
    onChange({ physicians: next });
  };
  return (
    <div className="space-y-4">
      <SectionCard title="Emergency Plan">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Date"><input type="date" className={inputClass} value={d.date || ''} onChange={(e) => onChange({ date: e.target.value })} /></Field>
          <Field label="Reassessment Date"><input type="date" className={inputClass} value={d.reassessmentDate || ''} onChange={(e) => onChange({ reassessmentDate: e.target.value })} /></Field>
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="DOB"><input type="date" className={inputClass} value={d.dob || ''} onChange={(e) => onChange({ dob: e.target.value })} /></Field>
          <Field label="Address" className="sm:col-span-2"><input className={inputClass} value={d.address || ''} onChange={(e) => onChange({ address: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} /></Field>
          <Field label="Cell"><input className={inputClass} value={d.cell || ''} onChange={(e) => onChange({ cell: e.target.value })} /></Field>
          <Field label="Major Crossroads"><input className={inputClass} value={d.majorCrossroads || ''} onChange={(e) => onChange({ majorCrossroads: e.target.value })} /></Field>
          <Field label="Emergency Contact"><input className={inputClass} value={d.emergencyContact || ''} onChange={(e) => onChange({ emergencyContact: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.emergencyPhone || ''} onChange={(e) => onChange({ emergencyPhone: e.target.value })} /></Field>
          <Field label="Relationship"><input className={inputClass} value={d.emergencyRelationship || ''} onChange={(e) => onChange({ emergencyRelationship: e.target.value })} /></Field>
          <Field label="Cell"><input className={inputClass} value={d.emergencyCell || ''} onChange={(e) => onChange({ emergencyCell: e.target.value })} /></Field>
        </div>
        <p className="mb-2 mt-4 text-sm font-semibold text-gray-800">Local Numbers</p>
        <div className="space-y-2">
          {physicians.map((p, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <Field label={`Physician ${i + 1}`}><input className={inputClass} value={p.name} onChange={(e) => setPhys(i, { name: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputClass} value={p.phone} onChange={(e) => setPhys(i, { phone: e.target.value })} /></Field>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Hospital"><input className={inputClass} value={d.hospital || ''} onChange={(e) => onChange({ hospital: e.target.value })} /></Field>
            <Field label="Hospital Phone"><input className={inputClass} value={d.hospitalPhone || ''} onChange={(e) => onChange({ hospitalPhone: e.target.value })} /></Field>
            <Field label="Pharmacy"><input className={inputClass} value={d.pharmacy || ''} onChange={(e) => onChange({ pharmacy: e.target.value })} /></Field>
          </div>
        </div>
        <Field label="Evacuation Plan" className="mt-3"><input className={inputClass} value={d.evacuationPlan || ''} onChange={(e) => onChange({ evacuationPlan: e.target.value })} /></Field>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Temporary Relocation Name"><input className={inputClass} value={d.relocationName || ''} onChange={(e) => onChange({ relocationName: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={d.relocationPhone || ''} onChange={(e) => onChange({ relocationPhone: e.target.value })} /></Field>
          <Field label="Electric Company"><input className={inputClass} value={d.electricCompany || ''} onChange={(e) => onChange({ electricCompany: e.target.value })} /></Field>
          <Field label="Gas Company"><input className={inputClass} value={d.gasCompany || ''} onChange={(e) => onChange({ gasCompany: e.target.value })} /></Field>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-gray-600">Priority Classification</p>
          <div className="space-y-2">
            {PRIORITY_OPTS.map((o) => (
              <label key={o.value} className="flex items-start gap-2 text-sm text-gray-700">
                <input type="radio" checked={d.priorityLevel === o.value} onChange={() => onChange({ priorityLevel: o.value })} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Agency staff will not make home visits during times of emergency or disaster.</p>
        </div>
      </SectionCard>
      <SignatureBlock title="Client" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

function Form7050({ data, onChange }) {
  const d = data || {};
  const checks = d.checks || {};
  return (
    <div className="space-y-4">
      <SectionCard title="Home Environment Safety Checklist" subtitle="Y = Yes · N = No · R = Requires attention">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Performed By"><input className={inputClass} value={d.performedBy || ''} onChange={(e) => onChange({ performedBy: e.target.value })} /></Field>
          <Field label="Date"><input type="date" className={inputClass} value={d.date || ''} onChange={(e) => onChange({ date: e.target.value })} /></Field>
          <Field label="Client Name"><input className={inputClass} value={d.clientName || ''} onChange={(e) => onChange({ clientName: e.target.value })} /></Field>
          <Field label="Address" className="sm:col-span-2"><input className={inputClass} value={d.address || ''} onChange={(e) => onChange({ address: e.target.value })} /></Field>
          <Field label="Telephone"><input className={inputClass} value={d.telephone || ''} onChange={(e) => onChange({ telephone: e.target.value })} /></Field>
          <Field label="Emergency Contact"><input className={inputClass} value={d.emergencyContact || ''} onChange={(e) => onChange({ emergencyContact: e.target.value })} /></Field>
        </div>
        <div className="mt-4 space-y-0.5">
          {SAFETY_ITEMS.map((item) => (
            <YnRRow
              key={item}
              label={item}
              value={checks[item] || ''}
              onChange={(v) => onChange({ checks: { ...checks, [item]: v } })}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          <Field label="Other problems?"><input className={inputClass} value={d.otherProblems || ''} onChange={(e) => onChange({ otherProblems: e.target.value })} /></Field>
          <Field label="Other problems list"><textarea className={`${inputClass} min-h-[64px]`} value={d.otherProblemsList || ''} onChange={(e) => onChange({ otherProblemsList: e.target.value })} /></Field>
          <Field label="Comments"><textarea className={`${inputClass} min-h-[64px]`} value={d.comments || ''} onChange={(e) => onChange({ comments: e.target.value })} /></Field>
          <Field label="Advice given"><textarea className={`${inputClass} min-h-[64px]`} value={d.adviceGiven || ''} onChange={(e) => onChange({ adviceGiven: e.target.value })} /></Field>
        </div>
      </SectionCard>
      <SignatureBlock title="Client" value={d.client || {}} onChange={(client) => onChange({ client })} showRelationship />
      <SignatureBlock title="Agency Representative" value={d.agency || {}} onChange={(agency) => onChange({ agency })} />
    </div>
  );
}

const FORM_MAP = {
  '110': Form110,
  '324': Form324,
  '325': Form325,
  '350': Form350,
  '400': Form400,
  '410': Form410,
  '610': Form610,
  '790': Form790,
  '800': Form800,
  '1009': Form1009,
  '1081': Form1081,
  '1082': Form1082,
  '1083': Form1083,
  '7000': Form7000,
  '7050': Form7050,
};

export function AssessmentPacketFormView({ code, data, onChange, shared }) {
  const Comp = FORM_MAP[code];
  if (!Comp) {
    const meta = ASSESSMENT_PACKET_FORMS.find((f) => f.code === code);
    return (
      <SectionCard title={meta?.title || `Form ${code}`}>
        <p className="text-sm text-gray-500">Unknown form code: {code}</p>
      </SectionCard>
    );
  }
  return <Comp data={data} onChange={onChange} shared={shared} />;
}
