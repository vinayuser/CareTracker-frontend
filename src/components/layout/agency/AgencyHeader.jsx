import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Mail, Users, UserCheck, CalendarClock, LayoutGrid } from 'lucide-react';
import { useSelector } from 'react-redux';
import NotificationBell from '../../notifications/NotificationBell';
import { getAuthUser } from '../../../utils/auth';
import { ROLE_LABELS, normalizeRole } from '../../../constants/roles';
import UserMenuDropdown from '../UserMenuDropdown';
import { AGENCY_NAV_GROUPS } from '../../../routes/agencyNav';
import { ROUTES } from '../../../routes/routes';
import axiosInstance from '../../../api/axiosInstance';
import API_ROUTES from '../../../api/apiRoutes';
import { formatDisplayName } from '../../../utils/formatDisplayName';

function flattenNavItems() {
  const items = [];
  AGENCY_NAV_GROUPS.forEach((group) => {
    (group.items || []).forEach((item) => {
      if (item.children?.length) {
        item.children.forEach((child) => {
          if (ROUTES[child.key]) {
            items.push({
              key: child.key,
              label: child.label,
              to: ROUTES[child.key],
              type: 'page',
            });
          }
        });
      } else if (ROUTES[item.key]) {
        items.push({
          key: item.key,
          label: item.label,
          to: ROUTES[item.key],
          type: 'page',
        });
      }
    });
  });
  return items;
}

const NAV_ITEMS = flattenNavItems();

function ResultRow({ icon: Icon, label, meta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">{label}</span>
        {meta ? <span className="block truncate text-[11px] text-gray-400">{meta}</span> : null}
      </span>
    </button>
  );
}

export default function AgencyHeader({ onToggleSidebar, title = 'Dashboard' }) {
  const navigate = useNavigate();
  const authFromStore = useSelector((state) => state.auth.user);
  const authUser = authFromStore || getAuthUser();
  const roleLabel = ROLE_LABELS[normalizeRole(authUser?.role)] ?? 'Agency Owner';
  const agencyName = authUser?.agencyName ?? 'Agency';

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remote, setRemote] = useState({ clients: [], caregivers: [], visits: [] });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);

  const pageResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS.slice(0, 6);
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onPointer = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!searchOpen || q.length < 2) {
      setRemote({ clients: [], caregivers: [], visits: [] });
      setLoading(false);
      return undefined;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [clientsRes, caregiversRes, visitsRes] = await Promise.all([
          axiosInstance.get(API_ROUTES.AGENCY.CLIENTS.LIST, {
            params: { search: q, limit: 5, page: 1 },
            skipErrorToast: true,
          }),
          axiosInstance.get(API_ROUTES.AGENCY.CAREGIVERS.LIST, {
            params: { search: q, limit: 5, page: 1 },
            skipErrorToast: true,
          }),
          axiosInstance.get(API_ROUTES.AGENCY.VISITS.LIST, {
            params: { search: q, limit: 5, page: 1 },
            skipErrorToast: true,
          }),
        ]);

        if (requestId !== requestIdRef.current) return;

        const clientsRaw = clientsRes.data?.data;
        const caregiversRaw = caregiversRes.data?.data;
        const visitsRaw = visitsRes.data?.data;

        const clients = Array.isArray(clientsRaw)
          ? clientsRaw
          : (Array.isArray(clientsRaw?.items) ? clientsRaw.items : []);
        const caregivers = Array.isArray(caregiversRaw)
          ? caregiversRaw
          : (Array.isArray(caregiversRaw?.items) ? caregiversRaw.items : []);
        const visits = Array.isArray(visitsRaw)
          ? visitsRaw
          : (Array.isArray(visitsRaw?.list)
            ? visitsRaw.list
            : (Array.isArray(visitsRaw?.items) ? visitsRaw.items : []));

        setRemote({
          clients: clients.slice(0, 5),
          caregivers: caregivers.slice(0, 5),
          visits: visits.slice(0, 5),
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setRemote({ clients: [], caregivers: [], visits: [] });
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchOpen]);

  const hasRemote = remote.clients.length + remote.caregivers.length + remote.visits.length > 0;
  const hasQuery = query.trim().length > 0;
  const searchingData = hasQuery && query.trim().length >= 2;
  const showEmpty = searchOpen
    && !loading
    && (
      (searchingData && pageResults.length === 0 && !hasRemote)
      || (hasQuery && query.trim().length < 2 && pageResults.length === 0)
    );

  const closeAndGo = (to) => {
    setSearchOpen(false);
    setQuery('');
    navigate(to);
  };

  const clientName = (c) => formatDisplayName(
    [c.firstName, c.lastName].filter(Boolean).join(' ')
    || c.name
    || c.preferredName
    || 'Client',
  );

  const caregiverName = (c) => formatDisplayName(
    c.name || c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Caregiver',
  );

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

      <div ref={searchRef} className="relative mx-4 hidden max-w-2xl flex-1 lg:block">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search clients, caregivers, visits..."
          className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] py-2 pl-10 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />

        {searchOpen && (
          <div className="absolute z-40 mt-1.5 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {loading ? (
              <p className="px-3 py-3 text-sm text-gray-500">Searching…</p>
            ) : showEmpty ? (
              <p className="px-3 py-6 text-center text-sm text-gray-500">No data available</p>
            ) : (
              <>
                {pageResults.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {hasQuery ? 'Pages' : 'Quick links'}
                    </p>
                    {pageResults.map((item) => (
                      <ResultRow
                        key={item.key}
                        icon={LayoutGrid}
                        label={item.label}
                        meta="Go to page"
                        onClick={() => closeAndGo(item.to)}
                      />
                    ))}
                  </div>
                )}

                {remote.clients.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Clients
                    </p>
                    {remote.clients.map((client) => (
                      <ResultRow
                        key={client.id || client._id}
                        icon={Users}
                        label={clientName(client)}
                        meta={client.clientCode || client.email || 'Client'}
                        onClick={() => closeAndGo(
                          `${ROUTES.AGENCY_CLIENTS}?search=${encodeURIComponent(clientName(client))}`,
                        )}
                      />
                    ))}
                  </div>
                )}

                {remote.caregivers.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Caregivers
                    </p>
                    {remote.caregivers.map((cg) => (
                      <ResultRow
                        key={cg.id || cg._id}
                        icon={UserCheck}
                        label={caregiverName(cg)}
                        meta={cg.email || cg.employeeId || 'Caregiver'}
                        onClick={() => closeAndGo(
                          `${ROUTES.AGENCY_CAREGIVERS}?search=${encodeURIComponent(caregiverName(cg))}`,
                        )}
                      />
                    ))}
                  </div>
                )}

                {remote.visits.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Visits
                    </p>
                    {remote.visits.map((visit) => (
                      <ResultRow
                        key={visit.id || visit._id}
                        icon={CalendarClock}
                        label={visit.clientName || visit.visitCode || 'Visit'}
                        meta={[visit.caregiverName, visit.status].filter(Boolean).join(' · ') || 'Visit'}
                        onClick={() => closeAndGo(ROUTES.AGENCY_SCHEDULE)}
                      />
                    ))}
                  </div>
                )}

                {!hasQuery && pageResults.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-gray-500">No data available</p>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button type="button" className="relative rounded-lg p-2.5 text-gray-500 hover:bg-gray-100">
          <Mail size={18} />
          <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            6
          </span>
        </button>
        <NotificationBell className="[&_button]:p-2.5" />

        <div className="ml-1 border-l border-gray-200 pl-3 sm:ml-2 sm:pl-4">
          <UserMenuDropdown subtitle={`${agencyName} · ${roleLabel}`} />
        </div>
      </div>
    </header>
  );
}
