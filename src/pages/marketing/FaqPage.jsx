import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'product', label: 'Product & Features' },
  { id: 'evv', label: 'EVV & Compliance' },
  { id: 'billing', label: 'Billing & Pricing' },
  { id: 'security', label: 'Security & Access' },
  { id: 'getting-started', label: 'Getting Started' },
];

const FAQS = [
  {
    id: 'what-is-caretraqer',
    category: 'general',
    q: 'What is Caretraqer?',
    a: 'Caretraqer is a home care management platform that helps agencies manage caregivers, clients, scheduling, EVV, documentation, billing, and day-to-day operations in one secure system.',
  },
  {
    id: 'who-is-it-for',
    category: 'general',
    q: 'Who is Caretraqer built for?',
    a: 'It is built for home care agencies—owners, administrators, schedulers, caregivers in the field, and the clients and families they support.',
  },
  {
    id: 'mobile-app',
    category: 'general',
    q: 'Do caregivers need a mobile app?',
    a: 'Yes. Caregivers use mobile tools to view schedules, check in and out of visits, capture notes, and stay updated on assignment changes while they are in the field.',
  },
  {
    id: 'modules',
    category: 'product',
    q: 'What modules are included?',
    a: 'Core workflows include caregiver and client management, scheduling, EVV, care plans and documentation, hiring and onboarding, CRM, billing and claims support, reports, and role-based portals.',
  },
  {
    id: 'multi-location',
    category: 'product',
    q: 'Can we manage more than one location?',
    a: 'Yes. Caretraqer supports multi-location and multi-agency style operations so each site can work locally while leadership keeps visibility across the organization.',
  },
  {
    id: 'reports',
    category: 'product',
    q: 'What kind of reports can we run?',
    a: 'Agencies can download operational reports such as time cards, overtime, EVV summaries, and other workforce or visit reports from the reports area—without redesigning their daily listings.',
  },
  {
    id: 'what-is-evv',
    category: 'evv',
    q: 'How does EVV work in Caretraqer?',
    a: 'Caregivers check in and out for visits. The platform records time, visit details, and related verification data so agencies can monitor attendance, exceptions, and compliance.',
  },
  {
    id: 'missed-visits',
    category: 'evv',
    q: 'What happens if a visit is missed or late?',
    a: 'Administrators can see visit status in real time, including late and missed visits, so the office can follow up before a small exception becomes a bigger compliance problem.',
  },
  {
    id: 'overtime',
    category: 'evv',
    q: 'How is overtime calculated?',
    a: 'Agencies set each caregiver’s regular weekly hours and an OT extra rate per hour. Overtime is based on clocked, EVV-approved worked time above that weekly limit—not on scheduled hours alone.',
  },
  {
    id: 'pricing',
    category: 'billing',
    q: 'How is Caretraqer priced?',
    a: 'Plans are structured around agency size and the features you need. Review Pricing on the Product page, or request a demo so we can map a plan to your caregiver and client volume.',
  },
  {
    id: 'claims',
    category: 'billing',
    q: 'Does Caretraqer support claims and insurance workflows?',
    a: 'Yes. Billing tools support claims-related workflows, eligibility checks, payment posting, and financial reporting so revenue work stays connected to visit activity.',
  },
  {
    id: 'data-secure',
    category: 'security',
    q: 'How is our data protected?',
    a: 'Caretraqer uses role-based access and secure account practices so users only see what their role allows. See the Security page for more detail on our approach to protecting home care information.',
  },
  {
    id: 'roles',
    category: 'security',
    q: 'Can we control what each staff member can see?',
    a: 'Yes. Role-based permissions help keep agency admins, coordinators, caregivers, and other users in the right parts of the platform.',
  },
  {
    id: 'demo',
    category: 'getting-started',
    q: 'How do we get a demo?',
    a: 'Use Request a Demo from the site header or Product page. Share your agency size and the workflows you care about most—scheduling, EVV, hiring, billing—and our team will walk you through them.',
  },
  {
    id: 'onboarding',
    category: 'getting-started',
    q: 'How long does it take to get started?',
    a: 'Most agencies start by setting up the agency profile, inviting staff, onboarding caregivers, and importing or creating clients. Timeline depends on your size and how much historical data you want to bring over.',
  },
  {
    id: 'support',
    category: 'getting-started',
    q: 'How do we contact support?',
    a: 'Email support@caretraker.com with your agency name and the screen you were on. For demos and sales questions, use Request a Demo or contact sales. Office hours and address are listed on the Contact Us page.',
  },
];

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] font-semibold leading-snug text-slate-900">{item.q}</span>
        <ChevronDown
          size={18}
          className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180 text-primary' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 pr-8 text-[14px] leading-relaxed text-slate-600">{item.a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(FAQS[0]?.id || null);

  useEffect(() => {
    const previous = document.title;
    document.title = 'FAQ | Caretraqer';
    return () => {
      document.title = previous;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [category, query]);

  return (
    <div className="bg-[#fbfcfe] text-slate-900">
      <section className="border-b border-slate-100 bg-white">
        <div
          className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-16"
          data-reveal="up"
          data-reveal-delay="0"
        >
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide text-primary">
            <HelpCircle size={14} />
            FAQ
          </p>
          <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.75rem]">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Quick answers about Caretraqer, EVV, billing, security, and getting your agency started.
          </p>

          <div className="relative mx-auto mt-8 max-w-lg">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              category === 'all'
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                category === cat.id
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white px-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)] sm:px-8">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No questions match your search. Try another keyword or{' '}
              <Link to="/resources/contact" className="font-semibold text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          ) : (
            filtered.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              />
            ))
          )}
        </div>

        <div className="mt-12 rounded-[24px] bg-gradient-to-br from-[#3b82f6] via-primary to-[#1d4ed8] px-6 py-12 text-center text-white shadow-xl shadow-primary/25 sm:px-10">
          <h2 className="text-[1.6rem] font-bold tracking-tight sm:text-[1.85rem]">
            Still have a question?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-white/90">
            Talk with our team about your agency workflows, or browse the help center for role-based guides.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <RequestDemoButton className="rounded-lg border-2 border-white bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
              Request a Demo
            </RequestDemoButton>
            <Link
              to="/resources/help-center"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
