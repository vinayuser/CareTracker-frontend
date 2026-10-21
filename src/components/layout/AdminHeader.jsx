import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Building2,
  ChevronDown,
  LayoutGrid,
  PanelLeft,
  Plus,
  Search,
  Shield,
} from 'lucide-react';
import UserMenuDropdown from './UserMenuDropdown';
import NotificationBell from '../notifications/NotificationBell';
import { ADMIN_NAV_ITEMS } from '../../routes/adminNav';
import { ROUTES } from '../../routes/routes';
import { fetchAgencyOptions } from '../../redux/slices/agencySlice';

const QUICK_CREATE = [
  { label: 'Send Invitation', to: ROUTES.ADMIN_INVITATIONS, state: { openSendDrawer: true } },
  { label: 'View Reports', to: ROUTES.ADMIN_REPORTS },
];

export default function AdminHeader({ collapsed, onToggleSidebar }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const agencyOptions = useSelector((state) => state.agencies.options || []);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const searchRef = useRef(null);
  const quickRef = useRef(null);
  const inputRef = useRef(null);

  const q = query.trim().toLowerCase();

  const pageResults = useMemo(() => {
    if (!q) return ADMIN_NAV_ITEMS.slice(0, 8);
    return ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [q]);

  const agencyResults = useMemo(() => {
    if (!q) return [];
    return agencyOptions
      .filter((agency) => String(agency.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [q, agencyOptions]);

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

  useEffect(() => {
    if (searchOpen) dispatch(fetchAgencyOptions());
  }, [searchOpen, dispatch]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const hasResults = agencyResults.length > 0 || pageResults.length > 0;

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
            {!hasResults ? (
              <p className="px-3 py-2.5 text-sm text-gray-500">
                {q ? 'No matching agencies or pages' : 'No matching pages'}
              </p>
            ) : (
              <>
                {agencyResults.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Agencies
                    </p>
                    {agencyResults.map((agency) => (
                      <button
                        key={agency.id}
                        type="button"
                        onClick={() => {
                          navigate(`${ROUTES.ADMIN_AGENCIES}?id=${encodeURIComponent(agency.id)}`);
                          closeSearch();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Building2 size={14} className="shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1 truncate font-medium">{agency.name}</span>
                        {agency.status ? (
                          <span className="shrink-0 text-[11px] text-gray-400">{agency.status}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
                {pageResults.length > 0 && (
                  <div>
                    {agencyResults.length > 0 && (
                      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        Pages
                      </p>
                    )}
                    {pageResults.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          navigate(ROUTES[item.key]);
                          closeSearch();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutGrid size={14} className="shrink-0 text-gray-400" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
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

        <NotificationBell />

        <UserMenuDropdown subtitle="Platform Administrator" />
      </div>
    </header>
  );
}
