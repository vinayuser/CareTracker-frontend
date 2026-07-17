import { PanelLeft } from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';

export default function AdminHeader({ collapsed, onToggleSidebar }) {
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
        <UserMenuDropdown />
      </div>
    </header>
  );
}
