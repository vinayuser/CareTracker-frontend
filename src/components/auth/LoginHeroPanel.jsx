import { Building2, HeartHandshake, ShieldCheck, Users } from 'lucide-react';
import LoginHeroBackground from './LoginHeroBackground';
import CareTrackerLogo from '../brand/CareTrackerLogo';

const features = [
  { icon: Building2, label: 'Agency management & onboarding' },
  { icon: HeartHandshake, label: 'Caregiver & client oversight' },
  { icon: ShieldCheck, label: 'Secure subscription billing' },
  { icon: Users, label: 'Multi-agency platform control' },
];

export default function LoginHeroPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[52%] xl:w-[55%]">
      <LoginHeroBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar/95 via-sidebar/85 to-primary/80" />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        <CareTrackerLogo size="lg" tagline="Home Care Platform · Super Admin" light />

        <div className="max-w-lg">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
            Trusted by home care agencies nationwide
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white xl:text-[2.75rem]">
            Empowering better care, one agency at a time
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Manage agencies, subscription plans, invitations, and platform-wide
            performance from a single command center built for home health administrators.
          </p>

          <ul className="mt-8 space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon size={16} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '500+', label: 'Agencies' },
            { value: '12K+', label: 'Caregivers' },
            { value: '98%', label: 'Uptime' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/15"
            >
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} CareTraker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
