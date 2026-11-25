import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FolderOpen,
  HeartHandshake,
  MessageSquare,
  Smartphone,
  UserRound,
} from 'lucide-react';
import ProductShot from '../../components/marketing/ProductShot';
import { RequestDemoButton } from '../../components/marketing/DemoRequestContext';
import { ROUTES } from '../../routes/routes';

const SHOTS = {
  dashboard: '/marketing/agency-dashboard.png',
  assessments: '/marketing/assessments.png',
  evv: '/marketing/evv-dashboard.png',
};

const SUPPORTING = [
  {
    icon: FolderOpen,
    title: 'Centralized Client Information',
    text: 'Keep profiles, documents, and history together instead of scattered across files and systems.',
  },
  {
    icon: HeartHandshake,
    title: 'Improved Care Coordination',
    text: 'Give office staff and caregivers a shared view of needs, plans, and visit activity.',
  },
  {
    icon: UserRound,
    title: 'Easy Access to Client Records',
    text: 'Find the details your team needs quickly—contacts, preferences, notes, and service history.',
  },
];

const OVERVIEW_CARDS = [
  {
    icon: UserRound,
    title: 'Comprehensive Client Profiles',
    text: 'Maintain client details, contact information, preferences, and important records.',
  },
  {
    icon: ClipboardList,
    title: 'Personalized Care Plans',
    text: 'Organize care instructions and update service information as needs change.',
  },
  {
    icon: CalendarDays,
    title: 'Visit Tracking',
    text: 'Review scheduled visits, service history, and recorded activities.',
  },
  {
    icon: MessageSquare,
    title: 'Better Communication',
    text: 'Keep caregivers and office teams informed with relevant updates.',
  },
];

const PROFILE_FEATURES = [
  'Detailed client profiles',
  'Contact and personal information',
  'Care preferences and special instructions',
  'Service and visit history',
  'Notes and documentation',
  'Important client information at a glance',
];

const CARE_PLAN_FEATURES = [
  'Create and update individual care plans',
  'Organize client goals and care instructions',
  'Record progress and service notes',
  'Keep care information accessible to authorized team members',
  'Update plans as client requirements evolve',
];

const MOBILE_CAPABILITIES = [
  'Access client profiles',
  'Review care plans',
  'Check visit information',
  'Record care notes',
  'View relevant updates',
  'Stay connected with the agency',
];

const NOTIFICATION_POINTS = [
  'Visit reminders',
  'Care plan updates',
  'Important notifications',
  'Schedule-related alerts',
  'Team communication updates',
];

const FAQS = [
  {
    id: 'manage-clients',
    q: 'How does Caretraqer help agencies manage clients?',
    a: 'Caretraqer helps organize client profiles, care plans, visit information, and important service records in one platform, making it easier for agencies to coordinate daily care activities.',
  },
  {
    id: 'care-plans',
    q: 'Can agencies maintain individual care plans?',
    a: 'Care plan management helps agencies organize client-specific instructions, goals, and service information so caregivers can access relevant details.',
  },
  {
    id: 'mobile-access',
    q: 'Can caregivers access client information through mobile devices?',
    a: 'Caregiver mobile access can make it easier to review client information, check care instructions, and document visit activities while providing services.',
  },
  {
    id: 'coordination',
    q: 'How does client management improve care coordination?',
    a: 'Centralized information helps office staff and caregivers work with consistent client details, reducing information gaps and improving communication.',
  },
  {
    id: 'security',
    q: 'Is client information secure?',
    a: 'Client information should be protected through appropriate access controls, authentication, and security safeguards. Contact Caretraqer for details about its current security and HIPAA compliance measures.',
  },
  {
    id: 'demo',
    q: 'Can I see Caretraqer in action?',
    a: 'Yes. Schedule a product demonstration to explore the client management features and understand how they can support your agency’s workflow.',
  },
];

function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[14px] text-slate-600">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}

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

export default function ClientManagementPage() {
  const [openFaq, setOpenFaq] = useState(FAQS[0]?.id || null);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Client Management | Caretraqer';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="bg-[#fbfcfe] text-slate-900">
      <Section className="pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div data-reveal="left" data-reveal-delay="0">
            <p className="text-[13px] font-semibold tracking-wide text-primary">Client Management</p>
            <h1 className="mt-3 text-[2.35rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.85rem]">
              Smarter Client Management for Better Home Care
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Keep client information, care plans, and visit history organized in one convenient
              platform. Caretraqer helps your team coordinate personalized care, stay informed, and
              manage everyday responsibilities more efficiently.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <RequestDemoButton className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-hover">
                Schedule a Demo
              </RequestDemoButton>
              <a
                href="#features"
                className="inline-flex rounded-lg border border-[#c9daf8] bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Explore Features
              </a>
            </div>
          </div>
          <div data-reveal="right" data-reveal-delay="120">
            <ProductShot
              src={SHOTS.dashboard}
              alt="Caretraqer client management overview"
              className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.4)]"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {SUPPORTING.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f1ff] text-primary">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="features" className="bg-[#eef3f9] py-16">
        <p className="text-center text-sm font-semibold text-primary">
          Technology That Helps Home Care Move Forward
        </p>
        <h2 className="mx-auto mt-2 max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          Everything You Need to Stay on Top of Client Care
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-slate-500">
          Bring essential client information and daily care activities together. Give your
          administrative team a clearer picture of each client’s needs and make it easier to
          coordinate services.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OVERVIEW_CARDS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f1ff] text-primary">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div data-reveal="left" data-reveal-delay="0">
            <p className="text-sm font-semibold text-primary">Client records</p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Every Client Detail, Organized in One Place
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Managing client information across multiple records and systems can make daily
              coordination difficult. Caretraqer provides a centralized way to access client
              profiles, care information, service history, and important notes.
            </p>
            <BulletList items={PROFILE_FEATURES} />
          </div>
          <div data-reveal="right" data-reveal-delay="100">
            <ProductShot
              src={SHOTS.evv}
              alt="Client profiles and visit history"
              className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)]"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-[#f7f8fa] py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="lg:order-2" data-reveal="right" data-reveal-delay="0">
            <p className="text-sm font-semibold text-primary">Care plans</p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Build Care Plans Around Individual Needs
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Every client has different care requirements. Create and maintain individualized care
              plans that help your team understand service expectations and keep important care
              instructions accessible.
            </p>
            <BulletList items={CARE_PLAN_FEATURES} />
          </div>
          <div className="lg:order-1" data-reveal="left" data-reveal-delay="100">
            <ProductShot
              src={SHOTS.assessments}
              alt="Personalized care plans and assessments"
              className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)]"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-white py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div data-reveal="left" data-reveal-delay="0">
            <p className="text-sm font-semibold text-primary">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone size={14} />
                Mobile access
              </span>
            </p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Manage Client Information Wherever Care Happens
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Give your team convenient mobile access to essential client information. Caretraqer’s
              mobile experience helps caregivers stay informed about assignments, review care
              details, and record important updates while working in the field.
            </p>
            <BulletList items={MOBILE_CAPABILITIES} />
          </div>
          <div data-reveal="right" data-reveal-delay="100">
            <ProductShot
              src={SHOTS.dashboard}
              alt="Mobile client information access"
              className="shadow-[0_25px_60px_-20px_rgba(15,23,42,0.35)]"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-[#eef3f9] py-16">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-semibold text-primary">
              <span className="inline-flex items-center gap-1.5">
                <Bell size={14} />
                Stay informed
              </span>
            </p>
            <h2 className="mt-2 text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.05rem]">
              Stay Informed When Client Information Changes
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
              Important updates should reach the right people at the right time. Notifications can
              help your team stay aware of upcoming visits, schedule changes, and relevant client
              care updates.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.3)]">
            <BulletList items={NOTIFICATION_POINTS} />
          </div>
        </div>
      </Section>

      <Section className="bg-white py-16">
        <p className="text-center text-sm font-semibold text-primary">Frequently asked questions</p>
        <h2 className="mx-auto mt-2 max-w-3xl text-center text-[1.9rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
          Common Questions About Client Management
        </h2>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-8">
          {FAQS.map((item) => (
            <FaqItem
              key={item.id}
              item={item}
              open={openFaq === item.id}
              onToggle={() => setOpenFaq((prev) => (prev === item.id ? null : item.id))}
            />
          ))}
        </div>
      </Section>

      <Section className="pb-16">
        <div className="rounded-3xl bg-[#e8f1ff] px-6 py-10 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
              Ready to Simplify Your Client Management?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Spend less time organizing information and more time coordinating quality care.
              Discover how Caretraqer can help your agency create a more connected client management
              experience.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <RequestDemoButton className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
                Schedule Your Demo
                <ArrowRight size={16} />
              </RequestDemoButton>
              <Link
                to={ROUTES.MARKETING_PRODUCT}
                className="inline-flex rounded-lg border border-[#c9daf8] bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
              >
                Explore the Platform
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
