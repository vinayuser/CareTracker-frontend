import { Menu, Search, Mail, Bell, ChevronDown } from 'lucide-react';
import { getAuthUser } from '../../../utils/auth';
import { ROLE_LABELS, normalizeRole } from '../../../constants/roles';

export default function AgencyHeader({ onToggleSidebar, title = 'Dashboard' }) {
  const authUser = getAuthUser();
  const roleLabel = ROLE_LABELS[normalizeRole(authUser?.role)] ?? 'Agency Owner';
  const agencyName = authUser?.agencyName ?? 'BrightCare Home Health';

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-5">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="relative mx-4 hidden max-w-2xl flex-1 lg:block">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search clients, caregivers, visits..."
          className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] py-2 pl-10 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button type="button" className="relative rounded-lg p-2.5 text-gray-500 hover:bg-gray-100">
          <Mail size={18} />
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            6
          </span>
        </button>
        <button type="button" className="relative rounded-lg p-2.5 text-gray-500 hover:bg-gray-100">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            12
          </span>
        </button>

        <div className="ml-1 flex items-center gap-2.5 border-l border-gray-200 pl-3 sm:ml-2 sm:pl-4">
          <img
            src="https://i.pravatar.cc/80?u=john-smith-agency"
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-gray-900">{authUser?.name ?? 'John Smith'}</p>
            <p className="truncate text-xs text-gray-500">
              {agencyName} · {roleLabel}
            </p>
          </div>
          <ChevronDown size={15} className="hidden text-gray-400 md:block" />
        </div>
      </div>
    </header>
  );
}
