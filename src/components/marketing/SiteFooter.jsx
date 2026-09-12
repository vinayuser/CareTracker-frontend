import { Link } from 'react-router-dom';
import {
  Accessibility,
  Building2,
  CalendarDays,
  Cloud,
  FileText,
  HandHeart,
  Link2,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { ROUTES } from '../../routes/routes';

const COLUMNS = [
  {
    title: 'Product',
    icon: Building2,
    tone: 'text-emerald-400',
    links: ['Overview', 'Features', 'Pricing', "What's New", 'Roadmap'],
  },
  {
    title: 'CRM',
    icon: UserRound,
    tone: 'text-sky-400',
    links: ['Lead Management', 'Client Intake', 'Referral Tracking', 'Marketing Tools', 'Email & SMS'],
  },
  {
    title: 'EVV',
    icon: CalendarDays,
    tone: 'text-orange-400',
    links: ['Mobile Check-In/Out', 'GPS & Geo-Fencing', 'Visit Verification', 'Care Notes'],
  },
  {
    title: 'Hiring & Onboarding',
    icon: Users,
    tone: 'text-amber-400',
    links: ['Applicant Tracking (ATS)', 'Screening & Background', 'Onboarding'],
  },
  {
    title: 'HR & Workforce',
    icon: FileText,
    tone: 'text-blue-400',
    links: ['Employee Management', 'Time & Attendance', 'Time Card & Payroll'],
  },
  {
    title: 'Billing & Revenue',
    icon: Receipt,
    tone: 'text-emerald-400',
    links: ['Claims Management', 'Medicaid Eligibility', 'Medicare Eligibility', 'Insurance Billing'],
  },
  {
    title: 'Enterprise',
    icon: Building2,
    tone: 'text-sky-400',
    links: ['Multi-Location Support', 'Franchise Management', 'Role-Based Access'],
  },
  {
    title: 'Integrations',
    icon: Link2,
    tone: 'text-yellow-400',
    links: ['EHR / EMR', 'Payers & Insurance', 'QuickBooks', 'Payroll Systems', 'Background Check'],
  },
  {
    title: 'Portals',
    icon: HandHeart,
    tone: 'text-rose-400',
    links: ['Caregiver Dashboard', 'Patient / Family Portal', 'Client Portal', 'Payer / Auditor'],
  },
  {
    title: 'Resources',
    icon: FileText,
    tone: 'text-emerald-400',
    links: ['Help Center', 'User Guides', 'Video Tutorials', 'Webinars', 'Blog'],
  },
];

const TRUST = ['HIPAA', 'HITRUST', 'Medicaid', 'Medicare', 'CMS'];

const PILLARS = [
  { label: 'Caregivers Supported', Icon: Users, color: 'text-emerald-600' },
  { label: 'Patients Empowered', Icon: Accessibility, color: 'text-sky-600' },
  { label: 'Agencies Growing', Icon: TrendingUp, color: 'text-orange-500' },
  { label: 'Compliant & Secure', Icon: ShieldCheck, color: 'text-violet-600' },
  { label: 'Built for Enterprise', Icon: Cloud, color: 'text-[#0055d4]' },
];

function AppStoreBadge() {
  return (
    <a
      href="https://apps.apple.com"
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-2.5 text-white transition hover:bg-neutral-800"
      aria-label="Download on the App Store"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="leading-none">
        <span className="block text-[8px] opacity-90">Download on the</span>
        <span className="block text-[12px] font-semibold tracking-tight">App Store</span>
      </span>
    </a>
  );
}

function GooglePlayBadge() {
  return (
    <a
      href="https://play.google.com"
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-black px-2.5 text-white transition hover:bg-neutral-800"
      aria-label="Get it on Google Play"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path fill="#EA4335" d="M3.6 2.3c-.3.2-.5.5-.5.9v17.6c0 .4.2.7.5.9l9.7-9.7L3.6 2.3z" />
        <path fill="#FBBC04" d="M14.4 13.2l-2.6-2.6 2.6-2.6 3.3 1.9c.7.4.7 1.4 0 1.8l-3.3 1.5z" />
        <path fill="#4285F4" d="M3.6 21.7c.2.1.4.2.6.2.3 0 .5-.1.8-.2l7.5-4.3-2.6-2.6-6.3 6.9z" />
        <path fill="#34A853" d="M3.6 2.3l6.3 6.9 2.6-2.6L5 2.3C4.7 2.1 4.3 2 4 2c-.2 0-.3 0-.4.3z" />
      </svg>
      <span className="leading-none">
        <span className="block text-[8px] opacity-90">GET IT ON</span>
        <span className="block text-[12px] font-semibold tracking-tight">Google Play</span>
      </span>
    </a>
  );
}

function FooterLogoMark() {
  return (
    <svg viewBox="0 0 48 48" width={40} height={40} className="shrink-0" aria-hidden>
      <rect width="48" height="48" rx="11" fill="#0055d4" />
      <circle cx="24" cy="24" r="13.5" fill="#ffffff" />
      <path
        d="M12 24.5 H17 L19.5 16 L22.5 33 L25.5 21 L28 24.5 H36"
        stroke="#0055d4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function FooterBrandBanner() {
  return (
    <div className="relative overflow-hidden bg-[#f0f7ff]">
      {/* Content row — 4 zones matching the design */}
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:px-8 lg:py-7">
        {/* 1. Brand */}
        <div className="w-full shrink-0 lg:w-[200px]">
          <div className="flex items-center gap-2.5">
            <FooterLogoMark />
            <span className="text-[20px] font-bold tracking-tight text-[#0b3d91]">CareTraker</span>
          </div>
          <p className="mt-2 max-w-[190px] text-[11px] font-medium leading-snug text-[#3b82f6]">
            Smarter Homecare. Healthier Lives.
            <br />
            Brighter Tomorrows.
          </p>
        </div>

        {/* 2. Center message + pillars */}
        <div className="min-w-0 flex-1 lg:px-2">
          <div className="text-center">
            <h3 className="text-[17px] font-bold leading-tight text-[#0b3d91] sm:text-[19px]">
              All-in-One Homecare &amp; Healthcare Software
            </h3>
            <p className="mt-1.5 text-[11px] font-medium text-slate-500">
              Manage People <span className="mx-1 text-slate-300">|</span>
              Simplify Operations <span className="mx-1 text-slate-300">|</span>
              Improve Outcomes <span className="mx-1 text-slate-300">|</span>
              Grow Your Agency
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-start justify-center gap-x-5 gap-y-3 sm:gap-x-7">
            {PILLARS.map(({ label, Icon, color }) => (
              <div key={label} className="flex w-[78px] flex-col items-center gap-1">
                <Icon size={26} className={color} strokeWidth={1.75} />
                <span className={`text-center text-[9px] font-semibold leading-tight ${color}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. QR */}
        <div className="flex w-full shrink-0 flex-col items-center lg:w-[92px]">
          <div className="flex h-[78px] w-[78px] items-center justify-center rounded border-2 border-[#0055d4] bg-white">
            <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-[#0055d4]">
              QR
              <br />
              CODE
            </span>
          </div>
          <a
            href="https://caretraker.com"
            className="mt-1.5 w-[78px] rounded bg-[#0055d4] py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#0046b0]"
          >
            Scan Me
          </a>
          <a
            href="https://caretraker.com"
            className="mt-1 text-center text-[9px] font-medium text-[#0d9488] hover:underline"
          >
            Visit CareTraker.com
          </a>
        </div>

        {/* 4. Apps + search */}
        <div className="w-full shrink-0 lg:w-[230px]">
          <p className="text-[13px] font-bold leading-snug text-[#0b3d91]">
            Take Care Further with CareTraker
            <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Anytime. Anywhere.</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0b3d91]">
            <Search size={14} strokeWidth={2.5} />
            Search CareTraker
          </p>
        </div>
      </div>

      {/* Bottom wave strip */}
      <div className="relative h-8 bg-[#0a1628]">
        <svg
          className="pointer-events-none absolute -top-6 left-0 h-14 w-[200px] sm:w-[280px]"
          viewBox="0 0 280 56"
          fill="none"
          aria-hidden
          preserveAspectRatio="none"
        >
          <path
            d="M0 56 C40 20 70 8 110 18 C150 28 170 48 210 42 C240 38 260 28 280 24 V56 H0 Z"
            fill="#0055d4"
          />
          <path
            d="M0 56 C35 34 65 26 100 32 C140 40 165 52 205 48 C235 45 255 38 280 36 V56 H0 Z"
            fill="#2dd4bf"
          />
        </svg>
        <svg
          className="pointer-events-none absolute -top-6 right-0 h-14 w-[200px] sm:w-[280px]"
          viewBox="0 0 280 56"
          fill="none"
          aria-hidden
          preserveAspectRatio="none"
        >
          <path
            d="M280 56 C240 20 210 8 170 18 C130 28 110 48 70 42 C40 38 20 28 0 24 V56 H280 Z"
            fill="#0055d4"
          />
          <path
            d="M280 56 C245 34 215 26 180 32 C140 40 115 52 75 48 C45 45 25 38 0 36 V56 H280 Z"
            fill="#2dd4bf"
          />
        </svg>
      </div>
    </div>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <FooterBrandBanner />

      <div className="bg-[#0b1b33] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
            {COLUMNS.map(({ title, icon: Icon, tone, links }) => (
              <div key={title}>
                <div className="mb-3 flex items-center gap-1.5">
                  <Icon size={14} className={tone} strokeWidth={2} />
                  <p className="text-[12px] font-semibold text-white">{title}</p>
                </div>
                <ul className="space-y-2">
                  {links.map((label) => (
                    <li key={label}>
                      <Link
                        to={ROUTES.LANDING}
                        className="text-[12px] leading-snug text-white/55 transition hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-white/60">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> United States
              </span>
              <a href="mailto:support@caretraker.com" className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail size={13} /> support@caretraker.com
              </a>
              <a href="tel:+18005550199" className="inline-flex items-center gap-1.5 hover:text-white">
                <Phone size={13} /> +1 (800) 555-0199
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRUST.map((item) => (
                <span
                  key={item}
                  className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/75"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-6 text-right text-[11px] text-white/40">
            © {year} CareTraker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
