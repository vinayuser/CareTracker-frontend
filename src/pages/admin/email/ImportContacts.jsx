import { useMemo, useState } from 'react';
import { Download, Search, Trash2, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { MarketingTabs, PageHeader, StatusPill, fieldClass, labelClass } from '../../../components/admin/email/EmailMarketingUi';
import { confirmAlert } from '../../../utils/swal';
import { useMarketing } from '../../../services/marketingScope';
import { CSV_SCHEMA, IMPORT_FIELDS, applyMapping, guessMapping, readTabularFile, sampleCsv } from '../../../services/spreadsheetImport';

const STEPS = ['Upload', 'Map Columns', 'Validate', 'Import'];

export default function ImportContacts() {
  const { store } = useMarketing();
  const [version, setVersion] = useState(0);
  const lists = store.listLists();
  const contacts = store.listContacts();
  void version;
  const [contactQuery, setContactQuery] = useState('');
  const [step, setStep] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validated, setValidated] = useState([]);
  const [listId, setListId] = useState(lists[0]?.id || '');
  const [duplicateMode, setDuplicateMode] = useState('skip');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onFile = async (file) => {
    setError('');
    try {
      const parsed = await readTabularFile(file);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setMapping(guessMapping(parsed.headers));
      setStep(1);
    } catch (err) {
      setError(err.message || 'Could not read that file');
    }
  };

  const listName = (id) => lists.find((list) => list.id === id)?.name || '—';
  const visibleContacts = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) => [contact.email, contact.firstName, contact.lastName, contact.company]
      .join(' ')
      .toLowerCase()
      .includes(q));
  }, [contacts, contactQuery]);

  const removeContact = async (contact) => {
    const confirmed = await confirmAlert({
      title: 'Delete this contact?',
      text: `${contact.email} will be removed from the contact list and will not be included in future campaigns.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!confirmed) return;
    store.deleteContact(contact.id);
    setVersion((n) => n + 1);
    toast.success('Contact deleted');
  };

  const counts = {
    valid: validated.filter((row) => row.eligible && !row.duplicate).length,
    duplicates: validated.filter((row) => row.duplicate).length,
    invalid: validated.filter((row) => !row.validEmail).length,
    missingConsent: validated.filter((row) => row.missingConsent || (row.validEmail && row.consentStatus !== 'Consented' && !row.missingConsent)).length,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Import Contacts" description="Bring in a spreadsheet of leads. This does not import caregivers, clients, or medical records." />
      <MarketingTabs />
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <span key={label} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${step === index ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border-2 border-sky-300 bg-sky-50 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-200 bg-sky-100 px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <Download size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-sky-950">Download sample CSV</p>
                  <p className="text-xs text-sky-800">Use these exact column names in the first row.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([sampleCsv()], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'caretracker-contacts-schema.csv';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                <Download size={14} />
                Download sample CSV
              </button>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-sky-50 text-xs uppercase tracking-wide text-sky-800">
                    <th className="px-4 py-3">Column</th>
                    <th className="px-4 py-3">Required</th>
                    <th className="px-4 py-3">Example</th>
                    <th className="px-4 py-3">Allowed values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CSV_SCHEMA.map((column) => (
                    <tr key={column.column}>
                      <td className="px-4 py-3 font-medium text-gray-900">{column.column}</td>
                      <td className="px-4 py-3">{column.required}</td>
                      <td className="px-4 py-3 text-gray-600">{column.example}</td>
                      <td className="px-4 py-3 text-gray-600">{column.allowed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 px-6 py-10 text-center shadow-sm hover:border-emerald-500 hover:bg-emerald-100/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Upload size={22} />
            </span>
            <span className="mt-3 text-sm font-semibold text-emerald-950">Import contacts</span>
            <span className="mt-1 text-xs text-emerald-800">Upload a CSV or XLSX. The first row must match the schema. Excel uses the first sheet.</span>
            <input type="file" accept=".csv,.txt,.xlsx" className="mt-4 text-sm" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {IMPORT_FIELDS.map((field) => (
              <label key={field.key}>
                <span className={labelClass}>{field.label}</span>
                <select className={fieldClass} value={mapping[field.key] || ''} onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}>
                  <option value="">Do not import</option>
                  {headers.map((header) => <option key={header}>{header}</option>)}
                </select>
              </label>
            ))}
          </div>
          <button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={() => { setValidated(store.validateImportRows(applyMapping(rawRows, mapping))); setStep(2); }}>
            Validate
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Count label="Valid contacts" value={counts.valid} />
            <Count label="Duplicates" value={counts.duplicates} />
            <Count label="Invalid emails" value={counts.invalid} />
            <Count label="Missing consent" value={validated.filter((row) => row.missingConsent).length} />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Consent</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validated.slice(0, 20).map((row) => (
                  <tr key={`${row.email}-${row.firstName}`}>
                    <td className="px-4 py-3">{row.firstName} {row.lastName}</td>
                    <td className="px-4 py-3">{row.email || '—'}</td>
                    <td className="px-4 py-3">{row.consentStatus || 'Missing'}</td>
                    <td className="px-4 py-3">{row.eligible ? <StatusPill status="Active" /> : row.issue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label>
              <span className={labelClass}>Add to list</span>
              <select className={fieldClass} value={listId} onChange={(e) => setListId(e.target.value)}>
                {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>Duplicates</span>
              <select className={fieldClass} value={duplicateMode} onChange={(e) => setDuplicateMode(e.target.value)}>
                <option value="skip">Skip duplicates</option>
                <option value="update">Update existing contacts</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => {
                const imported = store.importContacts({ rows: validated.filter((row) => row.eligible || (duplicateMode === 'update' && row.duplicate && row.consentStatus === 'Consented')), listId, duplicateMode });
                setResult(imported);
                setStep(3);
                setVersion((n) => n + 1);
                toast.success('Import finished');
              }}
            >
              Import consented contacts
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 && result ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Import complete</p>
          <p className="mt-2">{result.added} added, {result.updated} updated, {result.skipped} skipped.</p>
          <p className="mt-2 text-gray-500">Only consented contacts were added to campaign-eligible audiences.</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Contact list</p>
            <p className="text-xs text-gray-500">Delete individual emails without removing the whole import.</p>
          </div>
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Search email or name"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">List</th>
                <th className="px-4 py-3">Consent</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No contacts match this search.</td>
                </tr>
              ) : visibleContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{[contact.firstName, contact.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{contact.email}</td>
                  <td className="px-4 py-3 text-gray-600">{listName(contact.listId)}</td>
                  <td className="px-4 py-3">{contact.consentStatus || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeContact(contact)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Count({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[12px] text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
