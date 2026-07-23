/** Map agency Visit records into EVV log rows for agency tracking. */

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function toDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function formatClock(iso, timeZone) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = { hour: 'numeric', minute: '2-digit' };
  if (timeZone) opts.timeZone = timeZone;
  try {
    return d.toLocaleTimeString([], opts);
  } catch {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
}

export function formatDisplayDate(dateKey) {
  if (!dateKey) return '—';
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export function formatDuration(checkInAt, checkOutAt, billableMinutes = null) {
  if (billableMinutes != null && billableMinutes !== '') {
    const mins = Math.max(0, Math.round(Number(billableMinutes) || 0));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${pad2(h)}h ${pad2(m)}m`;
  }
  if (!checkInAt || !checkOutAt) return '—';
  const ms = new Date(checkOutAt) - new Date(checkInAt);
  if (Number.isNaN(ms) || ms < 0) return '—';
  const totalMins = Math.round(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${pad2(h)}h ${pad2(m)}m`;
}

export function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

/**
 * EVV display status derived from visit + grace/late + approval.
 */
export function getEvvVisitStatus(visit) {
  if (!visit) return 'Unverified';
  if (visit.status === 'Cancelled') return 'Cancelled';
  if (visit.status === 'Missed') return 'Missed';

  if (visit.checkOutAt) {
    const approval = visit.approvalStatus || 'Pending';
    if (approval === 'Approved') {
      return visit.lateCheckIn ? 'Approved (Late)' : 'Verified';
    }
    if (approval === 'Rejected') return 'Rejected';
    return visit.lateCheckIn ? 'Pending (Late)' : 'Pending Approval';
  }

  if (visit.lateCheckIn || visit.status === 'Exception') return 'Exception';
  if (visit.status === 'Completed') return 'Pending Approval';
  if (visit.status === 'InProgress') return 'In Progress';
  if (visit.status === 'Scheduled' || visit.status === 'Late') return 'Scheduled';
  return 'Unverified';
}

export function isEvvAlertVisit(visit) {
  if (!visit) return false;
  return Boolean(
    visit.lateCheckIn
    || visit.status === 'Exception'
    || visit.status === 'Missed'
    || visit.approvalStatus === 'Rejected',
  );
}

export function mapVisitToEvvLog(visit) {
  const status = getEvvVisitStatus(visit);
  const alert = isEvvAlertVisit(visit);
  const method = visit.checkInMethod || visit.checkOutMethod || (visit.checkInAt ? 'Mobile App' : '—');
  const approvalStatus = visit.checkOutAt
    ? (visit.approvalStatus && visit.approvalStatus !== 'None' ? visit.approvalStatus : 'Pending')
    : (visit.approvalStatus || 'None');

  return {
    id: visit.visitCode || visit.id,
    visitId: visit.id,
    date: formatDisplayDate(visit.scheduledDate),
    dateKey: visit.scheduledDate,
    timeRange: `${formatClock(visit.scheduledStartAt, visit.timezone)} – ${formatClock(visit.scheduledEndAt, visit.timezone)}`,
    client: visit.clientName || '—',
    caregiver: visit.caregiverName || '—',
    caregiverInitials: initialsFromName(visit.caregiverName),
    service: visit.serviceArea || '—',
    checkIn: {
      time: formatClock(visit.checkInAt, visit.timezone),
      address: visit.address || '—',
      at: visit.checkInAt || null,
    },
    checkOut: {
      time: formatClock(visit.checkOutAt, visit.timezone),
      address: visit.address || '—',
      at: visit.checkOutAt || null,
    },
    method,
    methodTone: method.toLowerCase().includes('telephony')
      ? 'purple'
      : method.toLowerCase().includes('web')
        ? 'teal'
        : 'blue',
    duration: formatDuration(visit.checkInAt, visit.checkOutAt, visit.billableMinutes),
    billableMinutes: visit.billableMinutes ?? null,
    billableHours: visit.billableHours
      ?? (visit.billableMinutes != null ? Number((visit.billableMinutes / 60).toFixed(2)) : null),
    hourlyRate: visit.hourlyRateSnapshot ?? null,
    amount: visit.amountSnapshot ?? null,
    invoiced: Boolean(visit.invoiced),
    status,
    alert,
    lateCheckIn: Boolean(visit.lateCheckIn),
    graceMinutes: visit.graceMinutes || 15,
    exceptionReason: visit.exceptionReason || '',
    exceptionResolved: Boolean(visit.exceptionResolved),
    geoWarning: visit.geoWarning || '',
    visitStatus: visit.status,
    approvalStatus,
    canApprove: Boolean(visit.canApprove ?? (visit.checkOutAt && approvalStatus === 'Pending')),
    canEditLog: Boolean(visit.canEditLog ?? (visit.status !== 'Cancelled' && !visit.isTimerRunning)),
    timezone: visit.timezone || '',
    scheduledStartAt: visit.scheduledStartAt || null,
    scheduledEndAt: visit.scheduledEndAt || null,
    notes: visit.notes || '',
    approvedByName: visit.approvedByName || '',
    approvedAt: visit.approvedAt || null,
    rejectionReason: visit.rejectionReason || '',
    latestCheckInAt: visit.latestCheckInAt,
    earliestCheckInAt: visit.earliestCheckInAt,
  };
}

export function filterVisitLogs(logs, { status, search, alertOnly = false } = {}) {
  return (logs || []).filter((row) => {
    if (alertOnly && !row.alert) return false;
    let matchesStatus = !status || status === 'All' || row.status === status
      || (status === 'Alerts' && row.alert);
    if (status === 'Unverified') {
      matchesStatus = ['Unverified', 'Scheduled', 'In Progress'].includes(row.status);
    }
    if (status === 'Pending Approval') {
      matchesStatus = ['Pending Approval', 'Pending (Late)'].includes(row.status);
    }
    if (status === 'Verified') {
      matchesStatus = ['Verified', 'Approved (Late)'].includes(row.status);
    }
    const q = (search || '').trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [
      row.id, row.client, row.caregiver, row.service, row.method,
      row.exceptionReason, row.approvalStatus, row.rejectionReason,
    ].join(' ').toLowerCase();
    return matchesStatus && haystack.includes(q);
  });
}

export function summarizeEvvLogs(logs = []) {
  return {
    total: logs.length,
    verified: logs.filter((r) => ['Verified', 'Approved (Late)'].includes(r.status)).length,
    pending: logs.filter((r) => ['Pending Approval', 'Pending (Late)'].includes(r.status)).length,
    exceptions: logs.filter((r) => ['Exception', 'Pending (Late)', 'Approved (Late)', 'Rejected'].includes(r.status) && r.lateCheckIn).length,
    missed: logs.filter((r) => r.status === 'Missed').length,
    rejected: logs.filter((r) => r.status === 'Rejected').length,
    unverified: logs.filter((r) => ['Unverified', 'Scheduled', 'In Progress'].includes(r.status)).length,
  };
}
