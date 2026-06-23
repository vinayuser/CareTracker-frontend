import {
  User,
  Footprints,
  Pill,
  Apple,
  Brain,
  MessageCircle,
  Heart,
  Shield,
  HeartPulse,
  Utensils,
  Accessibility,
  Users,
  Home,
  Car,
  Activity,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export const CARE_PLAN_ICON_MAP = {
  User,
  Footprints,
  Pill,
  Apple,
  Brain,
  MessageCircle,
  Heart,
  Shield,
  HeartPulse,
  Utensils,
  Accessibility,
  Users,
  Home,
  Car,
  Activity,
  Stethoscope,
  Sparkles,
};

export function CarePlanIcon({ name, size = 18, className = '' }) {
  const Icon = CARE_PLAN_ICON_MAP[name] || User;
  return <Icon size={size} className={className} />;
}

export function CarePlanIconBadge({ name, size = 18, className = '' }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ${className}`}>
      <CarePlanIcon name={name} size={size} />
    </span>
  );
}
