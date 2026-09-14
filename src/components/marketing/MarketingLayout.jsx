import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import ScrollToHash from './ScrollToHash';

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <ScrollToHash />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
