export default function EvvSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">EVV Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure EVV vendor, compliance goals, and verification methods.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Compliance Goal</h2>
          <p className="mt-1 text-sm text-gray-500">Minimum verified visit percentage for your agency.</p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Compliance %</label>
            <input type="number" defaultValue={90} className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">EVV Vendor</h2>
          <p className="mt-1 text-sm text-gray-500">Primary electronic visit verification provider.</p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Vendor Name</label>
            <input type="text" placeholder="e.g. Sandata, HHAeXchange" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Allowed Verification Methods</h2>
          <p className="mt-1 text-sm text-gray-500">Methods caregivers can use to verify visits.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Mobile App (GPS)', 'Telephony (IVR)', 'Web Portal', 'Manual Entry'].map((method) => (
              <label key={method} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary" />
                {method}
              </label>
            ))}
          </div>
          <button type="button" className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            Save Settings
          </button>
        </section>
      </div>
    </div>
  );
}
