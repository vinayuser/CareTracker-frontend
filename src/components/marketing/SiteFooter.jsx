import { Link } from 'react-router-dom';
import {
  Accessibility,
  BookOpen,
  Box,
  Building2,
  CalendarDays,
  Cloud,
  DollarSign,
  Heart,
  Link2,
  Mail,
  MapPin,
  Phone,
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
    Icon: Box,
    tone: 'text-emerald-400',
    links: [
      { label: 'Overview', to: `${ROUTES.MARKETING_PRODUCT}#overview` },
      { label: 'Features', to: `${ROUTES.MARKETING_PRODUCT}#features` },
      { label: 'Pricing', to: `${ROUTES.MARKETING_PRODUCT}#pricing` },
      { label: "What's New", to: `${ROUTES.MARKETING_PRODUCT}#whats-new` },
      { label: 'Roadmap', to: `${ROUTES.MARKETING_PRODUCT}#roadmap` },
      { label: 'Case Studies', to: `${ROUTES.MARKETING_PRODUCT}#case-studies` },
      { label: 'Request a Demo', to: `${ROUTES.MARKETING_PRODUCT}#demo` },
    ],
  },
  {
    title: 'CRM',
    Icon: UserRound,
    tone: 'text-sky-400',
    links: [
      { label: 'Lead Management', to: `${ROUTES.MARKETING_CRM}#lead-management` },
      { label: 'Client Intake', to: `${ROUTES.MARKETING_CRM}#client-intake` },
      { label: 'Referral Tracking', to: `${ROUTES.MARKETING_CRM}#referral-tracking` },
      { label: 'Marketing Tools', to: `${ROUTES.MARKETING_CRM}#marketing-tools` },
      { label: 'Email & SMS', to: `${ROUTES.MARKETING_CRM}#email-sms` },
      { label: 'Patient Engagement', to: `${ROUTES.MARKETING_CRM}#patient-engagement` },
      { label: 'Analytics & Reports', to: `${ROUTES.MARKETING_CRM}#analytics-reports` },
    ],
  },
  {
    title: 'EVV',
    Icon: CalendarDays,
    tone: 'text-rose-400',
    links: [
      { label: 'Mobile Check-In/Out', to: `${ROUTES.MARKETING_EVV}#checkin` },
      { label: 'GPS & Geo-Fencing', to: `${ROUTES.MARKETING_EVV}#gps` },
      { label: 'Visit Verification', to: `${ROUTES.MARKETING_EVV}#verification` },
      { label: 'Care Notes', to: `${ROUTES.MARKETING_EVV}#details` },
      { label: 'Missed Visit Alerts', to: `${ROUTES.MARKETING_EVV}#reports` },
      { label: 'EVV Compliance', to: ROUTES.MARKETING_EVV },
      { label: 'Real-Time Monitoring', to: ROUTES.MARKETING_EVV },
    ],
  },
  {
    title: 'Hiring & Onboarding',
    Icon: Users,
    tone: 'text-orange-400',
    links: [
      { label: 'Applicant Tracking (ATS)', to: `${ROUTES.MARKETING_HIRING}#ats` },
      { label: 'Screening & Background', to: `${ROUTES.MARKETING_HIRING}#screening` },
      { label: 'Onboarding', to: `${ROUTES.MARKETING_HIRING}#onboarding` },
      { label: 'Training & LMS', to: `${ROUTES.MARKETING_HIRING}#training` },
      { label: 'Credential Tracking', to: ROUTES.MARKETING_HIRING },
      { label: 'Talent Pool', to: ROUTES.MARKETING_HIRING },
      { label: 'Workforce Analytics', to: ROUTES.MARKETING_HIRING },
    ],
  },
  {
    title: 'HR & Workforce',
    Icon: UserRound,
    tone: 'text-blue-400',
    links: [
      { label: 'Employee Management', to: `${ROUTES.MARKETING_HR}#employee-management` },
      { label: 'Time & Attendance', to: `${ROUTES.MARKETING_HR}#time-attendance` },
      { label: 'Time Card & Payroll', to: `${ROUTES.MARKETING_HR}#time-card-payroll` },
      { label: 'Scheduling', to: ROUTES.MARKETING_HR },
      { label: 'Caregiver Management', to: ROUTES.MARKETING_HR },
      { label: 'Performance & Reviews', to: ROUTES.MARKETING_HR },
      { label: 'Compliance & Alerts', to: ROUTES.MARKETING_HR },
    ],
  },
  {
    title: 'Billing & Revenue',
    Icon: DollarSign,
    tone: 'text-emerald-400',
    links: [
      { label: 'Claims Management', to: `${ROUTES.MARKETING_BILLING}#claims-management` },
      { label: 'Medicaid Eligibility', to: `${ROUTES.MARKETING_BILLING}#medicaid-eligibility` },
      { label: 'Medicare Eligibility', to: `${ROUTES.MARKETING_BILLING}#medicare-eligibility` },
      { label: 'Insurance Verification', to: `${ROUTES.MARKETING_BILLING}#insurance-verification` },
      { label: 'Electronic Claims (EDI)', to: `${ROUTES.MARKETING_BILLING}#electronic-claims-edi` },
      { label: 'Payment Posting', to: `${ROUTES.MARKETING_BILLING}#payment-posting` },
      { label: 'Accounts Receivable', to: `${ROUTES.MARKETING_BILLING}#accounts-receivable` },
      { label: 'Financial Reporting', to: `${ROUTES.MARKETING_BILLING}#financial-reporting` },
    ],
  },
  {
    title: 'Enterprise',
    Icon: Building2,
    tone: 'text-sky-300',
    links: [
      { label: 'Multi-Location Support', to: ROUTES.LANDING },
      { label: 'Franchise Management', to: ROUTES.LANDING },
      { label: 'Role-Based Access', to: ROUTES.LANDING },
      { label: 'Custom Workflows', to: ROUTES.LANDING },
      { label: 'Advanced Analytics', to: ROUTES.LANDING },
      { label: 'API & Webhooks', to: ROUTES.LANDING },
      { label: 'White Label Options', to: ROUTES.LANDING },
      { label: 'Secure & Scalable', to: ROUTES.LANDING },
    ],
  },
  {
    title: 'Integrations',
    Icon: Link2,
    tone: 'text-yellow-400',
    links: [
      { label: 'EHR / EMR', to: `${ROUTES.MARKETING_INTEGRATIONS}#ehr-emr` },
      { label: 'Payers & Insurance', to: `${ROUTES.MARKETING_INTEGRATIONS}#payers-insurance` },
      { label: 'QuickBooks', to: `${ROUTES.MARKETING_INTEGRATIONS}#quickbooks` },
      { label: 'Payroll Systems', to: `${ROUTES.MARKETING_INTEGRATIONS}#payroll-systems` },
      { label: 'Background Check', to: `${ROUTES.MARKETING_INTEGRATIONS}#background-check` },
      { label: 'E-Signature (FomiqSign)', to: `${ROUTES.MARKETING_INTEGRATIONS}#e-signature-fomiqsign` },
      { label: 'Communication (Email/SMS)', to: `${ROUTES.MARKETING_INTEGRATIONS}#communication-email-sms` },
      { label: 'And More...', to: `${ROUTES.MARKETING_INTEGRATIONS}#and-more` },
    ],
  },
  {
    title: 'Portals',
    Icon: Heart,
    tone: 'text-rose-400',
    links: [
      { label: 'Caregiver Dashboard', to: `${ROUTES.MARKETING_PORTALS}#caregiver-dashboard` },
      { label: 'Patient / Family Portal', to: `${ROUTES.MARKETING_PORTALS}#patient-family-portal` },
      { label: 'Client Portal', to: `${ROUTES.MARKETING_PORTALS}#client-portal` },
      { label: 'Payer / Auditor Portal', to: `${ROUTES.MARKETING_PORTALS}#payer-auditor-portal` },
      { label: 'Admin Dashboard', to: `${ROUTES.MARKETING_PORTALS}#admin-dashboard` },
      { label: 'Mobile Apps', to: `${ROUTES.MARKETING_PORTALS}#mobile-apps` },
      { label: 'Telehealth', to: `${ROUTES.MARKETING_PORTALS}#telehealth` },
      { label: 'Communication Tools', to: `${ROUTES.MARKETING_PORTALS}#communication-tools` },
    ],
  },
  {
    title: 'Resources',
    Icon: BookOpen,
    tone: 'text-emerald-400',
    links: [
      { label: 'Help Center', to: ROUTES.LANDING },
      { label: 'User Guides', to: ROUTES.LANDING },
      { label: 'Video Tutorials', to: ROUTES.LANDING },
      { label: 'Webinars', to: ROUTES.LANDING },
      { label: 'Blog', to: ROUTES.LANDING },
      { label: 'Best Practices', to: ROUTES.LANDING },
      { label: 'Community', to: ROUTES.LANDING },
      { label: 'Contact Us', to: ROUTES.LANDING },
    ],
  },
];

const PILLARS = [
  { label: 'Caregivers Supported', Icon: Users, color: 'text-emerald-600' },
  { label: 'Patients Empowered', Icon: Accessibility, color: 'text-sky-600' },
  { label: 'Agencies Growing', Icon: TrendingUp, color: 'text-orange-500' },
  { label: 'Compliant & Secure', Icon: ShieldCheck, color: 'text-violet-600' },
  { label: 'Built for Enterprise', Icon: Cloud, color: 'text-[#0055d4]' },
];

const LEGAL = ['Terms of Service', 'Privacy Policy', 'Security', 'Accessibility', 'Sitemap'];

function FooterLogoMark() {
  return (
    <svg viewBox="0 0 48 48" width={42} height={42} className="shrink-0" aria-hidden>
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

function HipaaBadge() {
  return (
    <div className="flex h-12 items-center gap-2 rounded border border-white/20 bg-white/5 px-2.5">
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
      <div className="leading-tight">
        <p className="text-[9px] font-bold tracking-wide text-white">HIPAA</p>
        <p className="text-[8px] font-semibold tracking-wider text-white/80">COMPLIANT</p>
      </div>
    </div>
  );
}

function CheckBadge({ label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
        ✓
      </span>
      <span className="text-[12px] font-semibold text-white">{label}</span>
    </div>
  );
}

function SocialIcon({ href, label, children, className }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-white ${className}`}
    >
      {children}
    </a>
  );
}

function FooterBrandBanner() {
  return (
    <div className="relative min-h-[208px] overflow-hidden">
      <img
        src="/marketing/footer/brand-base.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8 lg:pb-10 lg:pt-7">
        <div className="w-full shrink-0 lg:w-[200px]">
          <div className="flex items-center gap-2.5">
            <FooterLogoMark />
            <span className="text-[20px] font-bold tracking-tight text-[#0b3d91]">CareTraker</span>
          </div>
          <p className="mt-2 max-w-[200px] text-[11px] font-medium leading-snug text-[#3b82f6]">
            Smarter Homecare. Healthier Lives.
            <br />
            Brighter Tomorrows.
          </p>
        </div>

        <div className="min-w-0 flex-1">
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
                <span className={`text-center text-[9px] font-semibold leading-tight ${color}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-start justify-center gap-3.5 lg:justify-end">
          <div className="flex w-[86px] flex-col items-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded border-2 border-[#0055d4] bg-white">
              <span className="text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-[#0055d4]">
                QR
                <br />
                CODE
              </span>
            </div>
            <a
              href="https://caretraker.com"
              className="mt-1.5 w-full rounded bg-[#0055d4] py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#0046b0]"
            >
              Scan Me
            </a>
            <a href="https://caretraker.com" className="mt-1 text-[9px] font-medium text-[#0d9488] hover:underline">
              Visit CareTraker.com
            </a>
          </div>

          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] font-bold leading-snug text-[#0b3d91]">
              Take Care Further with CareTraker
              <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">Anytime. Anywhere.</p>
            <img
              src="/marketing/footer/app-badges.png"
              alt="Download on the App Store and Google Play"
              className="mt-2.5 h-9 w-auto max-w-[220px] object-contain object-left"
            />
            <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0b3d91]">
              <Search size={14} strokeWidth={2.5} />
              Search CareTraker
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Module boundaries: [Product–EVV] | [Hiring–HR] | [Billing–Enterprise] | [Integrations–Resources] */
const MODULE_DIVIDER_AFTER = new Set([2, 4, 6]);

export default function SiteFooter() {
  return (
    <footer>
      <FooterBrandBanner />

      {/* Mega menu */}
      <div className="bg-[#003366] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-10">
            {COLUMNS.map(({ title, Icon, tone, links }, index) => (
              <div
                key={title}
                className={`min-w-0 px-3 py-1 ${
                  MODULE_DIVIDER_AFTER.has(index) ? 'xl:border-r xl:border-sky-300/35' : ''
                }`}
              >
                <div className="mb-3 flex flex-col items-start gap-1.5">
                  <Icon size={18} className={tone} strokeWidth={2} />
                  <p className="text-[12px] font-bold leading-tight text-white">{title}</p>
                </div>
                <ul className="space-y-1.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-[11px] leading-snug text-sky-100/70 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact + motto + social — one continuous line */}
      <div className="border-t border-white/10 bg-[#003366] text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <div className="flex flex-1 flex-wrap items-start gap-x-8 gap-y-4 text-[12px] text-white/85">
            <div className="flex max-w-[210px] items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-sky-400" />
              <p className="leading-snug">
                7920 Belt Line Rd., Ste. 720
                <br />
                Dallas, TX 75254
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={15} className="mt-0.5 shrink-0 text-sky-400" />
              <p className="leading-snug">
                <a href="mailto:support@caretraker.com" className="hover:text-white">
                  support@caretraker.com
                </a>
                <br />
                <a href="mailto:info@caretraker.com" className="hover:text-white">
                  info@caretraker.com
                </a>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={15} className="mt-0.5 shrink-0 text-sky-400" />
              <p className="leading-snug">
                <a href="tel:+19722002273" className="text-[13px] font-semibold text-white hover:text-sky-200">
                  (972) 200-CARE (2273)
                </a>
                <br />
                <span className="text-[11px] text-white/70">Mon – Fri, 8:00 AM – 6:00 PM (CST)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex flex-wrap items-center text-[13px] font-semibold tracking-wide text-white">
              <span>People</span>
              <span className="mx-2 inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
              <span>Care</span>
              <span className="mx-2 inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>Progress</span>
              <span className="mx-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Together</span>
              <span className="mx-3 text-white/40">|</span>
              <span className="text-[12px] font-medium text-white/80">Follow Us</span>
            </div>
            <div className="flex items-center gap-1.5">
              <SocialIcon href="https://linkedin.com" label="LinkedIn" className="bg-[#0A66C2]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.65 4.75 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.5V23h-4V8.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://facebook.com" label="Facebook" className="bg-[#1877F2]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.5V12H17l-.4 3h-2.7v7A10 10 0 0 0 22 12z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="YouTube" className="bg-[#FF0000]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z" />
                </svg>
              </SocialIcon>
              <SocialIcon
                href="https://instagram.com"
                label="Instagram"
                className="bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm5.75-3.25a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://x.com" label="X" className="bg-black">
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.5l-5.1-6.7L5.7 22H2.5l7.3-8.3L.8 2h6.6l4.6 6.1L18.9 2zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20z" />
                </svg>
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>

      {/* Brands + terms on the SAME row (same navy as footer body) */}
      <div className="border-t border-white/10 bg-[#003366] text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <HipaaBadge />
            <img src="/marketing/footer/aicpa-soc.png" alt="AICPA SOC" className="h-11 w-auto object-contain" />
            <img src="/marketing/footer/hitrust.png" alt="HITRUST" className="h-6 w-auto object-contain" />
            <CheckBadge label="Medicaid" />
            <CheckBadge label="Medicare" />
            <img src="/marketing/footer/cms.png" alt="CMS" className="h-9 w-auto object-contain" />
            <img src="/marketing/footer/bbb.png" alt="BBB Accredited Business" className="h-9 w-auto object-contain" />
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">
            <nav className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-white/70">
              {LEGAL.map((label, i) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="text-white/35">|</span>}
                  <Link to={ROUTES.LANDING} className="hover:text-white">
                    {label}
                  </Link>
                </span>
              ))}
            </nav>
            <p className="text-[11px] text-white/45">© 2026 CareTraker.com. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
