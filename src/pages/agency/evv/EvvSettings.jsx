import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';

const METHOD_OPTIONS = [
  'Mobile App (GPS)',
  'Telephony (IVR)',
  'Web Portal',
  'Manual Entry',
];

const emptyForm = {
  vendorName: '',
  complianceGoalPercent: 90,
  defaultGraceMinutes: 15,
  geoRadiusMeters: 500,
  geoEnforcement: 'warn',
  allowedMethods: [...METHOD_OPTIONS],
  medicaidExportEnabled: false,
};

export default function EvvSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get(API_ROUTES.AGENCY.EVV_SETTINGS);
        const data = response.data.data;
        if (!cancelled && data) {
          setForm({
            vendorName: data.vendorName || '',
            complianceGoalPercent: data.complianceGoalPercent ?? 90,
            defaultGraceMinutes: data.defaultGraceMinutes ?? 15,
            geoRadiusMeters: data.geoRadiusMeters ?? 500,
            geoEnforcement: data.geoEnforcement || 'warn',
            allowedMethods: data.allowedMethods?.length ? data.allowedMethods : [...METHOD_OPTIONS],
            medicaidExportEnabled: Boolean(data.medicaidExportEnabled),
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load EVV settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleMethod = (method) => {
    setForm((prev) => {
      const has = prev.allowedMethods.includes(method);
      return {
        ...prev,
        allowedMethods: has
          ? prev.allowedMethods.filter((m) => m !== method)
          : [...prev.allowedMethods, method],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_ROUTES.AGENCY.EVV_SETTINGS, form);
      const data = response.data.data;
      if (data) {
        setForm({
          vendorName: data.vendorName || '',
          complianceGoalPercent: data.complianceGoalPercent ?? 90,
          defaultGraceMinutes: data.defaultGraceMinutes ?? 15,
          geoRadiusMeters: data.geoRadiusMeters ?? 500,
          geoEnforcement: data.geoEnforcement || 'warn',
          allowedMethods: data.allowedMethods?.length ? data.allowedMethods : [...METHOD_OPTIONS],
          medicaidExportEnabled: Boolean(data.medicaidExportEnabled),
        });
      }
      toast.success(response.data.message || 'EVV settings saved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading EVV settings…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">EVV Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure vendor, grace windows, geofence policy, and verification methods.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Compliance Goal</h2>
          <p className="mt-1 text-sm text-gray-500">Minimum verified visit percentage for your agency.</p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Compliance %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.complianceGoalPercent}
              onChange={(e) => setForm((f) => ({ ...f, complianceGoalPercent: Number(e.target.value) }))}
              className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">EVV Vendor</h2>
          <p className="mt-1 text-sm text-gray-500">Primary electronic visit verification provider.</p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Vendor Name</span>
              <input
                type="text"
                placeholder="e.g. Sandata, HHAeXchange"
                value={form.vendorName}
                onChange={(e) => setForm((f) => ({ ...f, vendorName: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.medicaidExportEnabled}
                onChange={(e) => setForm((f) => ({ ...f, medicaidExportEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-primary"
              />
              Prepare visits for Medicaid / aggregator export
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Check-in grace</h2>
          <p className="mt-1 text-sm text-gray-500">Default late window for new visit schedules.</p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Grace minutes</label>
            <select
              value={form.defaultGraceMinutes}
              onChange={(e) => setForm((f) => ({ ...f, defaultGraceMinutes: Number(e.target.value) }))}
              className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Soft geofence</h2>
          <p className="mt-1 text-sm text-gray-500">Compare check-in GPS to client home / visit address.</p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Radius (meters)</span>
              <input
                type="number"
                min={50}
                value={form.geoRadiusMeters}
                onChange={(e) => setForm((f) => ({ ...f, geoRadiusMeters: Number(e.target.value) }))}
                className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Enforcement</span>
              <select
                value={form.geoEnforcement}
                onChange={(e) => setForm((f) => ({ ...f, geoEnforcement: e.target.value }))}
                className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="off">Off (capture GPS only)</option>
                <option value="warn">Warn (allow check-in)</option>
                <option value="block">Block check-in outside radius</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Allowed Verification Methods</h2>
          <p className="mt-1 text-sm text-gray-500">Methods caregivers can use to verify visits.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {METHOD_OPTIONS.map((method) => (
              <label key={method} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.allowedMethods.includes(method)}
                  onChange={() => toggleMethod(method)}
                  className="rounded border-gray-300 text-primary"
                />
                {method}
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </section>
      </form>
    </div>
  );
}
