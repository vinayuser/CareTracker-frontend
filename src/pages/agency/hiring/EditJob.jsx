import { useParams } from 'react-router-dom';
import CreateJob from './CreateJob';

export default function EditJob() {
  const { id } = useParams();
  return <CreateJob editId={id} />;
}
