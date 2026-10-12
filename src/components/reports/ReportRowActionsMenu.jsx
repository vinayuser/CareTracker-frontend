import { getReportReminderActions } from '../../utils/reportReminderActions';

const MENU_WIDTH = 224;

/**
 * Fixed-position row actions menu (avoids clipping inside overflow-x table wrappers).
 * Call with the click event synchronously (do not pass event into a setState updater).
 */
export function openReportRowMenu(row, event, currentMenu) {
  if (currentMenu?.row?.id === row.id) return null;
  const target = event?.currentTarget || event?.target;
  if (!target || typeof target.getBoundingClientRect !== 'function') return null;
  const rect = target.getBoundingClientRect();
  return {
    row,
    top: rect.bottom + 4,
    left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
  };
}

export default function ReportRowActionsMenu({
  menu,
  remindingKey,
  onView,
  onRemind,
  onClose,
}) {
  if (!menu?.row) return null;
  const { row, top, left } = menu;
  const reminders = getReportReminderActions(row);

  return (
    <div
      data-row-menu
      className="fixed z-[80] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{ top, left, width: MENU_WIDTH }}
    >
      <button
        type="button"
        onClick={() => {
          onView(row);
          onClose();
        }}
        className="block w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        View details
      </button>
      {reminders.map((action) => {
        const busy = remindingKey === `${row.id}:${action.type}`;
        return (
          <button
            key={action.type}
            type="button"
            disabled={Boolean(remindingKey)}
            onClick={() => onRemind(row, action.type)}
            className="block w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? 'Sending…' : action.label}
          </button>
        );
      })}
    </div>
  );
}
