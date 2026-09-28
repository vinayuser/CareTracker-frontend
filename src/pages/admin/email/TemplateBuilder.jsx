import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../../routes/routes';
import EmailDesigner from '../../../components/admin/email/EmailDesigner';
import { fieldClass, labelClass } from '../../../components/admin/email/EmailMarketingUi';
import { getTemplate, saveTemplate } from '../../../services/emailMarketingStore';

const SAMPLE = {
  name: 'April product update',
  category: 'Product',
  subject: 'What is new in CareTracker',
  backgroundColor: '#f8fafc',
  blocks: [
    { id: 's1', type: 'heading', text: 'A simpler week for your agency', color: '#0f172a', align: 'left' },
    { id: 's2', type: 'text', text: 'Scheduling and billing updates in one place.', color: '#334155', align: 'left' },
    { id: 's3', type: 'button', text: 'Open CareTracker', url: 'https://caretraker.com', buttonColor: '#2563eb', color: '#ffffff', align: 'left' },
  ],
};

export default function TemplateBuilder() {
  const { id } = useParams();
  return <TemplateBuilderForm key={id || 'new'} templateId={id} />;
}

function TemplateBuilderForm({ templateId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getTemplate(templateId) || {
    name: '',
    category: 'Product',
    subject: '',
    status: 'Draft',
    backgroundColor: '#ffffff',
    blocks: [],
  });
  const [selectedId, setSelectedId] = useState(form.blocks?.[0]?.id || '');

  const persist = (status) => {
    if (!form.name.trim() || !form.subject.trim()) {
      toast.error('Add a template name and subject');
      return;
    }
    const saved = saveTemplate(form, status);
    toast.success(status === 'Draft' ? 'Draft saved' : 'Template published');
    navigate(ROUTES.ADMIN_EMAIL_TEMPLATE_EDIT.replace(':id', saved.id), { replace: true });
  };

  return (
    <div className="space-y-5">
      <Link to={ROUTES.ADMIN_EMAIL_TEMPLATES} className="text-sm font-medium text-primary">Back to templates</Link>
      <h1 className="text-2xl font-bold text-gray-900">{templateId ? 'Edit template' : 'Create template'}</h1>
      <button
        type="button"
        onClick={() => {
          setForm({ ...form, ...SAMPLE, blocks: SAMPLE.blocks.map((block) => ({ ...block })) });
          setSelectedId('s1');
        }}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
      >
        Start from a sample email
      </button>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className={labelClass}>Template name</span>
          <input className={fieldClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          <span className={labelClass}>Category</span>
          <select className={fieldClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            <option>Product</option>
            <option>Leads</option>
            <option>Newsletter</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Subject</span>
          <input className={fieldClass} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
        </label>
      </div>
      <EmailDesigner
        blocks={form.blocks || []}
        backgroundColor={form.backgroundColor || '#ffffff'}
        selectedId={selectedId}
        onChange={({ blocks, backgroundColor, selectedId: nextSelected }) => {
          setForm({ ...form, blocks, backgroundColor });
          setSelectedId(nextSelected);
        }}
      />
      <div className="flex gap-2">
        <button type="button" onClick={() => persist('Draft')} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">Save draft</button>
        <button type="button" onClick={() => persist('Published')} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Publish template</button>
      </div>
    </div>
  );
}
