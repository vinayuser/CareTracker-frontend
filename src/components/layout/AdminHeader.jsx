import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckSquare,
  ChevronDown,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Shield,
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import { ADMIN_NAV_ITEMS } from '../../routes/adminNav';
import { ROUTES } from '../../routes/routes';

const QUICK_CREATE = [
  { label: 'Add Agency', to: ROUTES.ADMIN_AGENCIES },
  { label: 'Send Invitation', to: ROUTES.ADMIN_INVITATIONS, state: { openSendDrawer: true } },
  { label: 'Create Plan', to: ROUTES.ADMIN_SUBSCRIPTION_PLANS },
  { label: 'View Reports', to: ROUTES.ADMIN_REPORTS },
];

export default function AdminHeader({ collapsed, onToggleSidebar }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const searchRef = useRef(null);
  const quickRef = useRef(null);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_NAV_ITEMS.slice(0, 8);
    return ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setQuickOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onPointer = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target)) setQuickOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-5">
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

      <div className="hidden min-w-0 items-center gap-2 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Shield size={16} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-gray-900">Super Admin Dashboard</h1>
          <p className="truncate text-[11px] text-gray-500">Platform Administrator</p>
        </div>
      </div>

      <div ref={searchRef} className="relative mx-auto w-full max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search agencies, users, clients, invoices, tickets..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-16 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline">
          ⌘K
        </kbd>
        {searchOpen && (
          <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {results.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-gray-500">No matching pages</p>
            ) : (
              results.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigate(ROUTES[item.key]);
                    setSearchOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div ref={quickRef} className="relative">
          <button
            type="button"
            onClick={() => setQuickOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
          >
            <Plus size={14} />
            <span className="hidden md:inline">Quick Create</span>
            <ChevronDown size={14} />
          </button>
          {quickOpen && (
            <div className="absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              {QUICK_CREATE.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  state={item.state}
                  onClick={() => setQuickOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="Notifications">
          <Bell size={18} />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            12
          </span>
        </button>
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="Messages">
          <MessageSquare size={18} />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
            9
          </span>
        </button>
        <button type="button" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="Tasks">
          <CheckSquare size={18} />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
            7
          </span>
        </button>

        <UserMenuDropdown subtitle="Platform Administrator" />
      </div>
    </header>
  );
}
