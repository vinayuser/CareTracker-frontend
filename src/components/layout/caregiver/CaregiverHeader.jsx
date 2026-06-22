import { Menu, Bell } from 'lucide-react';
import { getAuthUser } from '../../../utils/auth';

export default function CaregiverHeader({ title, onMenuClick }) {
  const authUser = getAuthUser();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden">
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {authUser?.name?.charAt(0) ?? 'S'}
        </div>
      </div>
    </header>
  );
}
