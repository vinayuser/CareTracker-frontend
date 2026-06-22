import { ChevronDown, PanelLeft } from 'lucide-react';
import { getAuthUser } from '../../utils/auth';

export default function AdminHeader({ collapsed, onToggleSidebar }) {
  const authUser = getAuthUser();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
      {collapsed && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Expand sidebar"
        >
          <PanelLeft size={20} />
        </button>
      )}
      <div className={`flex items-center gap-3 ${collapsed ? '' : 'ml-auto'}`}>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{authUser?.name ?? 'Admin User'}</p>
          <p className="text-xs text-gray-500">{authUser?.email ?? 'admin@caretracker.com'}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          A
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </header>
  );
}
