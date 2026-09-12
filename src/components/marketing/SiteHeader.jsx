import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import CareTrackerLogo from '../brand/CareTrackerLogo';
import { ROUTES } from '../../routes/routes';

const NAV_LINKS = [
  { label: 'Platform', href: `${ROUTES.LANDING}#platform` },
  { label: 'Solutions', href: `${ROUTES.LANDING}#solutions` },
  { label: 'Resources', href: `${ROUTES.LANDING}#resources` },
  { label: 'About Us', href: `${ROUTES.LANDING}#about` },
  { label: 'Pricing', href: `${ROUTES.LANDING}#pricing` },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.LANDING} className="shrink-0" onClick={() => setOpen(false)}>
          <CareTrackerLogo size="sm" tagline="Home Care Platform" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-slate-500 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#demo"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover"
          >
            Request a Demo
          </a>
          <Link
            to={ROUTES.LOGIN}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#demo"
              className="mt-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Request a Demo
            </a>
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
