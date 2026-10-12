/**
 * Pending reminder actions for a report row.
 * Each action maps to a backend email template / recipient.
 */
export function getReportReminderActions(row = {}) {
  const actions = [];

  // Care plan pending — early assignment (caregiver created, schedule/EVV not started)
  if (
    row.status === 'caregiver_only'
    || (row.createCaregiver === 'Yes' && row.scheduleCreated === 'No' && row.evvForm === 'No')
  ) {
    actions.push({ type: 'care_plan', label: 'Remind: Care Plan' });
  }

  if (row.scheduleCreated === 'No') {
    actions.push({ type: 'schedule', label: 'Remind: Schedule' });
  }

  if (row.scheduleCreated === 'Yes' && row.evvForm === 'No') {
    actions.push({ type: 'evv_form', label: 'Remind: EVV Form' });
  }

  if (row.clientEvvStatus === 'Client Pending') {
    actions.push({ type: 'client_evv', label: 'Remind: Client EVV' });
  }

  if (row.agencyEvvStatus === 'Pending') {
    actions.push({ type: 'agency_evv', label: 'Remind: Agency EVV' });
  }

  // Deduplicate by type while keeping order
  const seen = new Set();
  return actions.filter((action) => {
    if (seen.has(action.type)) return false;
    seen.add(action.type);
    return true;
  });
}
