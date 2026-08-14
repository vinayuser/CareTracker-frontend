import { useLocation } from 'react-router-dom';
import ModulePlaceholder from '../../components/ui/ModulePlaceholder';
import { ADMIN_MODULE_META } from '../../routes/adminNav';

export default function AdminModulePage() {
  const segment = useLocation().pathname.split('/').pop();
  const meta = ADMIN_MODULE_META[segment] ?? { title: 'Module', description: null };
  return <ModulePlaceholder title={meta.title} description={meta.description} />;
}
