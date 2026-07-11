import { useLocation } from 'react-router-dom';
import ModulePlaceholder from '../../components/ui/ModulePlaceholder';

const PAGE_META = {
  visits: { title: 'Visits', description: 'View and manage your assigned client visits.' },
  clients: { title: 'Clients', description: 'See clients assigned to your care schedule.' },
  messages: { title: 'Messages', description: 'Agency and client messages in one place.' },
  alerts: { title: 'Alerts', description: 'Important notifications and action items.' },
  documents: { title: 'Documents', description: 'Credentials, policies, and required paperwork.' },
  training: { title: 'Training', description: 'Complete compliance and skills training.' },
  settings: { title: 'Settings', description: 'Update your profile and notification preferences.' },
};

export default function CaregiverModulePage() {
  const { pathname } = useLocation();
  const segment = pathname.split('/').pop();
  const meta = PAGE_META[segment] ?? { title: 'Caregiver', description: null };
  return <ModulePlaceholder title={meta.title} description={meta.description} />;
}
