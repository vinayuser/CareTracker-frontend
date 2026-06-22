import { DEFAULT_HR_MODULES } from '../../../constants/agencyModules';
import { ModulePermissionsFields } from './ModulePermissionsFields';

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

export const sectionTitleClass = 'text-sm font-semibold text-gray-900';

export const sectionClass = 'space-y-4 border-b border-gray-100 pb-5';

export const DEPARTMENTS = [
  'Human Resources',
  'Recruiting',
  'Payroll',
  'Compliance',
  'Training & Development',
  'Employee Relations',
];

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'];

export const GENDERS = ['Prefer not to say', 'Male', 'Female', 'Non-binary', 'Other'];

export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
  'Other',
];

export const ACCOUNT_STATUSES = ['Active', 'Pending', 'Inactive'];

export const EMPTY_HR_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  employeeId: '',
  jobTitle: '',
  department: 'Human Resources',
  hireDate: '',
  employmentType: 'Full-time',
  workLocation: '',
  reportsTo: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
  educationLevel: '',
  yearsOfExperience: '',
  certifications: '',
  specializations: '',
  userId: '',
  password: '',
  confirmPassword: '',
  status: 'Active',
  sendWelcomeEmail: true,
  notes: '',
  moduleAccess: [...DEFAULT_HR_MODULES],
};

export function hrFormToPayload(form) {
  const { confirmPassword, sendWelcomeEmail, password, ...rest } = form;
  return {
    ...rest,
    password,
    sendWelcomeEmail,
  };
}

export function validateHrForm(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = 'First name is required';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  if (!form.phone.trim()) errors.phone = 'Phone is required';
  if (!form.employeeId.trim()) errors.employeeId = 'Employee ID is required';
  if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required';
  if (!form.hireDate) errors.hireDate = 'Hire date is required';
  if (!form.emergencyContactName.trim()) errors.emergencyContactName = 'Emergency contact name is required';
  if (!form.emergencyContactPhone.trim()) errors.emergencyContactPhone = 'Emergency contact phone is required';
  if (!form.userId.trim()) errors.userId = 'User ID is required';
  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!form.moduleAccess?.length) errors.moduleAccess = 'Select at least one module';

  return errors;
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function HrFormFields({ form, errors, onChange, readOnly = false }) {
  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(field, value);
  };

  const inputProps = readOnly ? { readOnly: true, className: `${inputClass} bg-gray-50` } : { className: inputClass };

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Personal Information</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First Name" required error={errors.firstName}>
            <input type="text" value={form.firstName} onChange={set('firstName')} {...inputProps} placeholder="Jane" />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <input type="text" value={form.lastName} onChange={set('lastName')} {...inputProps} placeholder="Doe" />
          </Field>
          <Field label="Email Address" required error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} {...inputProps} placeholder="jane.doe@agency.com" />
          </Field>
          <Field label="Phone Number" required error={errors.phone}>
            <input type="tel" value={form.phone} onChange={set('phone')} {...inputProps} placeholder="(555) 000-0000" />
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} {...inputProps} />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={set('gender')} {...inputProps}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Employment Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Employee ID" required error={errors.employeeId}>
            <input type="text" value={form.employeeId} onChange={set('employeeId')} {...inputProps} placeholder="HR-1002" />
          </Field>
          <Field label="Job Title" required error={errors.jobTitle}>
            <input type="text" value={form.jobTitle} onChange={set('jobTitle')} {...inputProps} placeholder="HR Coordinator" />
          </Field>
          <Field label="Department">
            <select value={form.department} onChange={set('department')} {...inputProps}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Hire Date" required error={errors.hireDate}>
            <input type="date" value={form.hireDate} onChange={set('hireDate')} {...inputProps} />
          </Field>
          <Field label="Employment Type">
            <select value={form.employmentType} onChange={set('employmentType')} {...inputProps}>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Work Location">
            <input type="text" value={form.workLocation} onChange={set('workLocation')} {...inputProps} placeholder="Main Office" />
          </Field>
          <Field label="Reports To">
            <input type="text" value={form.reportsTo} onChange={set('reportsTo')} {...inputProps} placeholder="John Smith" />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Address</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Street Address">
              <input type="text" value={form.streetAddress} onChange={set('streetAddress')} {...inputProps} placeholder="123 Main Street" />
            </Field>
          </div>
          <Field label="City">
            <input type="text" value={form.city} onChange={set('city')} {...inputProps} />
          </Field>
          <Field label="State / Province">
            <input type="text" value={form.state} onChange={set('state')} {...inputProps} />
          </Field>
          <Field label="ZIP / Postal Code">
            <input type="text" value={form.zipCode} onChange={set('zipCode')} {...inputProps} />
          </Field>
          <Field label="Country">
            <input type="text" value={form.country} onChange={set('country')} {...inputProps} />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Emergency Contact</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact Name" required error={errors.emergencyContactName}>
            <input type="text" value={form.emergencyContactName} onChange={set('emergencyContactName')} {...inputProps} />
          </Field>
          <Field label="Relationship">
            <input type="text" value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} {...inputProps} placeholder="Spouse" />
          </Field>
          <Field label="Contact Phone" required error={errors.emergencyContactPhone}>
            <input type="tel" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} {...inputProps} />
          </Field>
          <Field label="Contact Email">
            <input type="email" value={form.emergencyContactEmail} onChange={set('emergencyContactEmail')} {...inputProps} />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Professional Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Education Level">
            <select value={form.educationLevel} onChange={set('educationLevel')} {...inputProps}>
              <option value="">Select education</option>
              {EDUCATION_LEVELS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Field>
          <Field label="Years of Experience">
            <input type="number" min="0" value={form.yearsOfExperience} onChange={set('yearsOfExperience')} {...inputProps} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Certifications / Licenses">
              <input type="text" value={form.certifications} onChange={set('certifications')} {...inputProps} placeholder="SHRM-CP, PHR" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="HR Specializations">
              <input type="text" value={form.specializations} onChange={set('specializations')} {...inputProps} placeholder="Recruiting, Payroll, Compliance" />
            </Field>
          </div>
        </div>
      </section>

      {!readOnly && (
        <ModulePermissionsFields
          selectedModules={form.moduleAccess}
          onChange={(modules) => onChange('moduleAccess', modules)}
          error={errors.moduleAccess}
        />
      )}

      {!readOnly && (
        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>Account Access</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="User ID / Login Email" required error={errors.userId}>
              <input type="text" value={form.userId} onChange={set('userId')} className={inputClass} placeholder="jane.doe@agency.com" />
            </Field>
            <Field label="Account Status">
              <select value={form.status} onChange={set('status')} className={inputClass}>
                {ACCOUNT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Temporary Password" required error={errors.password}>
              <input type="password" value={form.password} onChange={set('password')} className={inputClass} placeholder="Min. 8 characters" />
            </Field>
            <Field label="Confirm Password" required error={errors.confirmPassword}>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.sendWelcomeEmail}
                  onChange={set('sendWelcomeEmail')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                Send welcome email with login instructions
              </label>
            </div>
          </div>
        </section>
      )}

      <section>
        <h3 className={sectionTitleClass}>Additional Notes</h3>
        <div className="mt-4">
          <Field label="Internal Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={set('notes')}
              {...inputProps}
              placeholder="Optional notes about this HR team member..."
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
