import { useLocation } from 'react-router-dom';
import ModulePlaceholder from '../../components/ui/ModulePlaceholder';

const PAGE_META = {
  clients: { title: 'Clients', description: 'Manage client profiles, intake, and care assignments.' },
  assessments: { title: 'Assessments', description: 'Create and track client assessments and evaluations.' },
  'care-plans': { title: 'Care Plans', description: 'Build and manage individualized care plans.' },
  'service-notes': { title: 'Service Notes', description: 'Document visit notes and service delivery records.' },
  medications: { title: 'Medications', description: 'Track client medications and administration schedules.' },
  emar: { title: 'eMAR', description: 'Electronic medication administration records.' },
  schedule: { title: 'Schedule', description: 'Plan and manage visit schedules across your agency.' },
  'visit-calendar': { title: 'Visit Calendar', description: 'Calendar view of all scheduled visits.' },
  'shift-management': { title: 'Shift Management', description: 'Assign and manage caregiver shifts.' },
  'time-attendance': { title: 'Time & Attendance', description: 'Track caregiver clock-in/out and attendance.' },
  caregivers: { title: 'Caregivers', description: 'Manage your caregiver roster and credentials.' },
  'caregiver-matching': { title: 'Caregiver Matching', description: 'Match caregivers to clients based on skills and availability.' },
  tasks: { title: 'Tasks', description: 'Agency-wide task management and follow-ups.' },
  incidents: { title: 'Incidents', description: 'Report and track incident documentation.' },
  reports: { title: 'Reports', description: 'Operational and compliance reporting.' },
  users: { title: 'Users', description: 'Manage agency user accounts including HR staff.' },
  roles: { title: 'Roles & Permissions', description: 'Configure role-based access for agency staff.' },
  settings: { title: 'Settings', description: 'Agency profile, preferences, and configuration.' },
  billing: { title: 'Billing & Invoices', description: 'Subscription billing and invoice management.' },
};

export default function AgencyModulePage() {
  const segment = useLocation().pathname.split('/').pop();
  const meta = PAGE_META[segment] ?? { title: 'Module', description: null };

  return <ModulePlaceholder title={meta.title} description={meta.description} />;
}
