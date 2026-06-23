import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Drawer from '../../ui/Drawer';
import { addClient, updateClient } from '../../../redux/slices/clientsSlice';

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  primaryDiagnosis: '',
  allergies: '',
  mobility: '',
  livingArrangement: '',
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  status: 'Active',
  notes: '',
};

export default function ClientFormDrawer({ open, onClose, client, onSuccess }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(client?.id);

  useEffect(() => {
    if (!open) return;
    if (client) {
      setForm({
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        dateOfBirth: client.dateOfBirth || '',
        gender: client.gender || '',
        streetAddress: client.streetAddress || '',
        city: client.city || '',
        state: client.state || '',
        zipCode: client.zipCode || '',
        country: client.country || 'United States',
        primaryDiagnosis: client.primaryDiagnosis || '',
        allergies: client.allergies || '',
        mobility: client.mobility || '',
        livingArrangement: client.livingArrangement || '',
        emergencyContactName: client.emergencyContactName || '',
        emergencyContactRelationship: client.emergencyContactRelationship || '',
        emergencyContactPhone: client.emergencyContactPhone || '',
        status: client.status || 'Active',
        notes: client.notes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, client]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await dispatch(updateClient({ id: client.id, payload: form })).unwrap();
      } else {
        await dispatch(addClient(form)).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch {
      // toast in slice
    }
    setLoading(false);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Client' : 'Add Client'}
      width="2xl"
      footer={(
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" form="client-form" disabled={loading} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Client'}
          </button>
        </div>
      )}
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First Name *</label>
              <input required value={form.firstName} onChange={set('firstName')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input required value={form.lastName} onChange={set('lastName')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input value={form.phone} onChange={set('phone')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select value={form.gender} onChange={set('gender')} className={inputClass}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Address</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Street Address</label>
              <input value={form.streetAddress} onChange={set('streetAddress')} className={inputClass} />
            </div>
            <div><label className={labelClass}>City</label><input value={form.city} onChange={set('city')} className={inputClass} /></div>
            <div><label className={labelClass}>State</label><input value={form.state} onChange={set('state')} className={inputClass} /></div>
            <div><label className={labelClass}>ZIP Code</label><input value={form.zipCode} onChange={set('zipCode')} className={inputClass} /></div>
            <div><label className={labelClass}>Country</label><input value={form.country} onChange={set('country')} className={inputClass} /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Medical & Living</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>Primary Diagnosis</label>
              <textarea value={form.primaryDiagnosis} onChange={set('primaryDiagnosis')} rows={2} className={inputClass} placeholder="e.g. Type 2 Diabetes, Hypertension" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Allergies</label><input value={form.allergies} onChange={set('allergies')} className={inputClass} /></div>
              <div><label className={labelClass}>Mobility</label><input value={form.mobility} onChange={set('mobility')} className={inputClass} placeholder="Uses cane for walking" /></div>
            </div>
            <div><label className={labelClass}>Living Arrangement</label><input value={form.livingArrangement} onChange={set('livingArrangement')} className={inputClass} placeholder="Lives alone" /></div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Emergency Contact</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>Name</label><input value={form.emergencyContactName} onChange={set('emergencyContactName')} className={inputClass} /></div>
            <div><label className={labelClass}>Relationship</label><input value={form.emergencyContactRelationship} onChange={set('emergencyContactRelationship')} className={inputClass} /></div>
            <div><label className={labelClass}>Phone</label><input value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={set('status')} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>
      </form>
    </Drawer>
  );
}
