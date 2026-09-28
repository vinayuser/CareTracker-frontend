import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { MarketingTabs, PageHeader, fieldClass, labelClass } from '../../../components/admin/email/EmailMarketingUi';
import { confirmAlert } from '../../../utils/swal';
import {
  addTag,
  deleteList,
  deleteSegment,
  deleteTag,
  contactsInList,
  contactsInSegment,
  listLists,
  listSegments,
  listTags,
  saveSegment,
} from '../../../services/emailMarketingStore';

const TABS = ['Contact Lists', 'Segments', 'Tags'];
const RULE_FIELDS = [
  { key: 'leadStatus', label: 'Lead Status', options: ['New', 'Qualified', 'Nurture'] },
  { key: 'consentStatus', label: 'Consent Status', options: ['Consented', 'Unsubscribed', 'Unknown'] },
  { key: 'source', label: 'Source', options: ['Website', 'Referral', 'Event', 'Import'] },
  { key: 'tags', label: 'Tag', options: ['Website', 'Referral', 'Demo', 'Newsletter'] },
];

export default function ListsSegments() {
  const [tab, setTab] = useState('Contact Lists');
  const [version, setVersion] = useState(0);
  const [name, setName] = useState('');
  const [emailPopup, setEmailPopup] = useState(null);
  const [rules, setRules] = useState([
    { field: 'leadStatus', value: 'Qualified' },
    { field: 'consentStatus', value: 'Consented' },
    { field: 'source', value: 'Website' },
  ]);
  const lists = listLists();
  const segments = listSegments();
  const tags = listTags();
  void version;

  const refresh = () => setVersion((n) => n + 1);

  const removeList = async (list) => {
    const confirmed = await confirmAlert({
      title: 'Delete this list?',
      text: `${list.name} will be removed. The people in it stay available under All lists.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    deleteList(list.id);
    toast.success('List deleted');
    refresh();
  };

  const removeSegment = async (segment) => {
    const confirmed = await confirmAlert({
      title: 'Delete this segment?',
      text: `${segment.name} is only a saved filter. Deleting it does not delete the people.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    deleteSegment(segment.id);
    toast.success('Segment deleted');
    refresh();
  };

  const removeTag = async (tagName) => {
    const confirmed = await confirmAlert({
      title: 'Delete this tag?',
      text: `${tagName} will be removed from contacts and from any lead campaign that required it.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    deleteTag(tagName);
    toast.success('Tag deleted');
    refresh();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Lists & Segments" description="This page is only for leads and outside contacts, not for caregivers or agency staff who already have logins." />
      <MarketingTabs />
      <div className="flex gap-2">
        {TABS.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === item ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Contact Lists' ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact Count</th>
                <th className="px-4 py-3">Consented</th>
                <th className="px-4 py-3">Unsubscribed</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lists.map((list) => (
                <tr key={list.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{list.name}</td>
                  <td className="px-4 py-3">{list.contactCount}</td>
                  <td className="px-4 py-3">{list.consented}</td>
                  <td className="px-4 py-3">{list.unsubscribed}</td>
                  <td className="px-4 py-3 text-gray-600">{list.updatedAt}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="mr-3 text-sm font-semibold text-primary" onClick={() => setEmailPopup({ title: list.name, people: contactsInList(list.id) })}>View emails</button>
                    <button type="button" className="text-sm font-semibold text-rose-600" onClick={() => removeList(list)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'Segments' ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Rules</th>
                  <th className="px-4 py-3">Contacts</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {segments.map((seg) => (
                  <tr key={seg.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{seg.name}</td>
                    <td className="px-4 py-3 text-gray-600">{seg.rules.map((rule) => `${rule.field} = ${rule.value}`).join(' AND ')}</td>
                    <td className="px-4 py-3">{seg.contactCount}</td>
                    <td className="px-4 py-3 text-gray-600">{seg.updatedAt}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="mr-3 text-sm font-semibold text-primary" onClick={() => setEmailPopup({ title: seg.name, people: contactsInSegment(seg.id) })}>View emails</button>
                      <button type="button" className="text-sm font-semibold text-rose-600" onClick={() => removeSegment(seg)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              saveSegment({ name, rules });
              setName('');
              toast.success('Segment saved');
              refresh();
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900">New segment</h3>
            <label className="block"><span className={labelClass}>Name</span><input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} /></label>
            {rules.map((rule, index) => (
              <div key={`${rule.field}-${index}`} className="grid grid-cols-2 gap-2">
                <select className={fieldClass} value={rule.field} onChange={(e) => {
                  const field = RULE_FIELDS.find((item) => item.key === e.target.value);
                  const next = [...rules];
                  next[index] = { field: e.target.value, value: field.options[0] };
                  setRules(next);
                }}
                >
                  {RULE_FIELDS.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}
                </select>
                <select className={fieldClass} value={rule.value} onChange={(e) => {
                  const next = [...rules];
                  next[index] = { ...rule, value: e.target.value };
                  setRules(next);
                }}
                >
                  {(RULE_FIELDS.find((field) => field.key === rule.field)?.options || []).map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
            ))}
            <p className="text-xs text-gray-500">Rules are combined with AND.</p>
            <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Save segment</button>
          </form>
        </div>
      ) : null}

      {tab === 'Tags' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <ul className="divide-y divide-gray-100 text-sm">
            {tags.map((tag) => (
              <li key={tag.name} className="flex items-center justify-between gap-3 py-2">
                <span className="font-medium text-gray-900">{tag.name}</span>
                <span className="text-gray-500">{tag.count} contacts</span>
                <button type="button" className="text-sm font-semibold text-rose-600" onClick={() => removeTag(tag.name)}>Delete</button>
              </li>
            ))}
          </ul>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); addTag(name); setName(''); toast.success('Tag added'); refresh(); }}>
            <input className={fieldClass} placeholder="New tag" value={name} onChange={(e) => setName(e.target.value)} />
            <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Add</button>
          </form>
        </div>
      ) : null}
      <ContactEmailsModal popup={emailPopup} onClose={() => setEmailPopup(null)} />
    </div>
  );
}

function ContactEmailsModal({ popup, onClose }) {
  useEffect(() => {
    if (!popup) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [popup, onClose]);

  if (!popup) return null;
  const people = popup.people || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{popup.title}</h2>
            <p className="text-xs text-gray-500">{people.length} email{people.length === 1 ? '' : 's'}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-2">
          {people.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">No emails in this selection.</p> : (
            <ul className="divide-y divide-gray-100 text-sm">
              {people.map((person) => (
                <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium text-gray-900">{person.firstName} {person.lastName}</span>
                  <span className="text-gray-600">{person.email}</span>
                  <span className="text-gray-500">{person.consentStatus}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
