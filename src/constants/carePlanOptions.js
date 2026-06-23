export const ASSISTANCE_LEVELS = [
  'Independent',
  'Minimal Assistance',
  'Moderate Assistance',
  'High Need',
  'Full Assistance',
];

export const COGNITIVE_LEVELS = [
  'No Impairment',
  'Mild Impairment',
  'Moderate Impairment',
  'Severe Impairment',
];

export const COMMUNICATION_LEVELS = [
  'No Difficulty',
  'Mild Difficulty',
  'Moderate Difficulty',
  'Severe Difficulty',
];

export const EMOTIONAL_SUPPORT_LEVELS = [
  'No Support Needed',
  'Mild Support Needed',
  'Moderate Support Needed',
  'High Support Needed',
];

export const HOME_SAFETY_LEVELS = [
  'Low Risk',
  'Moderate Risk',
  'High Risk',
];

export const SERVICE_FREQUENCIES = [
  'Daily',
  'Twice a day',
  '3 times a week',
  'Weekly',
  'As needed',
];

export const SERVICE_DURATIONS = [
  '15 mins',
  '20 mins',
  '30 mins',
  '45 mins',
  '1 hour',
  'Variable',
];

export const SERVICE_PROVIDERS = [
  'Care Giver',
  'RN',
  'Care Giver / RN',
  'Family',
];

export const DEFAULT_SERVICES = [
  {
    enabled: true,
    icon: 'User',
    category: 'Personal Care',
    description: 'Assistance with bathing, grooming, and dressing',
    frequency: 'Daily',
    duration: '30 mins',
    provider: 'Care Giver',
    notes: '',
  },
  {
    enabled: true,
    icon: 'Pill',
    category: 'Medication Management',
    description: 'Medication reminders and administration support',
    frequency: 'Twice a day',
    duration: '15 mins',
    provider: 'Care Giver / RN',
    notes: '',
  },
  {
    enabled: true,
    icon: 'Utensils',
    category: 'Meal Preparation',
    description: 'Prepare nutritious meals according to dietary needs',
    frequency: 'Daily',
    duration: '45 mins',
    provider: 'Care Giver',
    notes: '',
  },
  {
    enabled: true,
    icon: 'Activity',
    category: 'Health Monitoring',
    description: 'Monitor vitals and report changes',
    frequency: '3 times a week',
    duration: '20 mins',
    provider: 'RN',
    notes: '',
  },
  {
    enabled: true,
    icon: 'Car',
    category: 'Transportation / Errands',
    description: 'Assist with grocery shopping and appointments',
    frequency: 'As needed',
    duration: 'Variable',
    provider: 'Care Giver',
    notes: '',
  },
];

export const CARE_OVERVIEW_CATEGORIES = [
  { key: 'personalCare', label: 'Personal Care', icon: 'User' },
  { key: 'healthManagement', label: 'Health Management', icon: 'HeartPulse' },
  { key: 'mealNutrition', label: 'Meal & Nutrition', icon: 'Utensils' },
  { key: 'mobilitySafety', label: 'Mobility & Safety', icon: 'Accessibility' },
  { key: 'companionship', label: 'Companionship & Support', icon: 'Users' },
  { key: 'household', label: 'Household Support', icon: 'Home' },
];

export const ASSESSMENT_FIELDS = [
  {
    key: 'personalCare',
    label: 'Personal Care',
    icon: 'User',
    description: 'Assistance with daily hygiene and grooming',
    options: ASSISTANCE_LEVELS,
    default: 'Moderate Assistance',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    icon: 'Footprints',
    description: 'Walking, transfers, and physical movement',
    options: ASSISTANCE_LEVELS,
    default: 'Moderate Assistance',
  },
  {
    key: 'medicationManagement',
    label: 'Medication Management',
    icon: 'Pill',
    description: 'Medication reminders and administration',
    options: ASSISTANCE_LEVELS,
    default: 'High Need',
  },
  {
    key: 'nutrition',
    label: 'Nutrition',
    icon: 'Apple',
    description: 'Meal planning and dietary support',
    options: ASSISTANCE_LEVELS,
    default: 'Moderate Assistance',
  },
  {
    key: 'cognitiveStatus',
    label: 'Cognitive Status',
    icon: 'Brain',
    description: 'Memory, orientation, and decision-making',
    options: COGNITIVE_LEVELS,
    default: 'Mild Impairment',
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: 'MessageCircle',
    description: 'Verbal and non-verbal communication',
    options: COMMUNICATION_LEVELS,
    default: 'No Difficulty',
  },
  {
    key: 'emotionalWellbeing',
    label: 'Emotional Well-being',
    icon: 'Heart',
    description: 'Mood, social engagement, and mental health',
    options: EMOTIONAL_SUPPORT_LEVELS,
    default: 'Mild Support Needed',
  },
  {
    key: 'homeSafety',
    label: 'Home Safety',
    icon: 'Shield',
    description: 'Fall prevention and environmental hazards',
    options: HOME_SAFETY_LEVELS,
    default: 'Moderate Risk',
  },
];

export const WIZARD_STEPS = [
  { id: 1, label: 'Client Information' },
  { id: 2, label: 'Assessment' },
  { id: 3, label: 'Service Details' },
  { id: 4, label: 'Review & Generate' },
];

export function buildDefaultAssessment() {
  return Object.fromEntries(ASSESSMENT_FIELDS.map((f) => [f.key, f.default]));
}

export function getServiceIcon(category) {
  const match = DEFAULT_SERVICES.find((s) => s.category === category);
  return match?.icon || 'Sparkles';
}
