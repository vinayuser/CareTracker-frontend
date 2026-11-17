import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Footer from './Footer';
import MobileSidebarOverlay from './MobileSidebarOverlay';
import useMobileNav from '../../hooks/useMobileNav';
import { scrollAppToTop } from '../../utils/scrollAppToTop';

const SIDEBAR_COLLAPSED_KEY = 'caretracker_sidebar_collapsed';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { open: mobileOpen, setOpen: setMobileOpen, toggleForViewport } = useMobileNav();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    scrollAppToTop('auto');
  }, [pathname]);

  const toggleDesktopCollapse = () => setCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen max-w-[100vw] overflow-hidden bg-page-bg">
      <div className="hidden lg:flex">
        <AdminSidebar collapsed={collapsed} onToggle={toggleDesktopCollapse} />
      </div>
      <MobileSidebarOverlay open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} showCollapse={false} />
      </MobileSidebarOverlay>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          collapsed={collapsed}
          onToggleSidebar={() => toggleForViewport(toggleDesktopCollapse)}
        />
        <main className="app-main-scroll min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
        <Footer variant="admin" />
      </div>
    </div>
  );
}
