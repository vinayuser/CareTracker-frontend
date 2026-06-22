import { MODULE_GROUPS, MODULE_LABELS } from '../../../constants/agencyModules';

export function ModulePermissionsFields({ selectedModules = [], onChange, error }) {
  const selected = new Set(selectedModules);

  const toggleModule = (key) => {
    const next = new Set(selected);
    if (next.has(key)) {
      if (key === 'AGENCY_DASHBOARD' && next.size === 1) return;
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange([...next]);
  };

  const toggleGroup = (keys, selectAll) => {
    const next = new Set(selected);
    keys.forEach((key) => {
      if (selectAll) next.add(key);
      else if (key !== 'AGENCY_DASHBOARD' || next.size > 1) next.delete(key);
    });
    if (next.size === 0) next.add('AGENCY_DASHBOARD');
    onChange([...next]);
  };

  return (
    <section className="space-y-4 border-b border-gray-100 pb-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Module Access</h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose which agency portal modules this HR user can view and access.
        </p>
      </div>

      <div className="space-y-4">
        {MODULE_GROUPS.map((group) => {
          const groupKeys = group.keys;
          const allSelected = groupKeys.every((key) => selected.has(key));
          const someSelected = groupKeys.some((key) => selected.has(key));

          return (
            <div key={group.title} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{group.title}</p>
                <button
                  type="button"
                  onClick={() => toggleGroup(groupKeys, !allSelected)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {allSelected ? 'Deselect all' : someSelected ? 'Select all' : 'Select all'}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {groupKeys.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(key)}
                      onChange={() => toggleModule(key)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">{MODULE_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">
        Administration modules (HR Staff, Users, Billing, Settings) are only available to the agency owner.
      </p>
    </section>
  );
}

export function ModuleAccessList({ moduleAccess = [] }) {
  if (!moduleAccess.length) {
    return <p className="text-sm text-gray-500">No modules assigned.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {moduleAccess.map((key) => (
        <span
          key={key}
          className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
        >
          {MODULE_LABELS[key] || key}
        </span>
      ))}
    </div>
  );
}
