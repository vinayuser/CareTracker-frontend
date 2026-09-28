import { GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { BlockView, fieldClass, labelClass } from './EmailMarketingUi';

const PALETTE = [
  { type: 'heading', label: 'Title', text: 'Your headline' },
  { type: 'text', label: 'Paragraph', text: 'Write the message here.' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button', text: 'Open CareTracker', url: 'https://caretraker.com', buttonColor: '#2563eb', color: '#ffffff' },
  { type: 'divider', label: 'Divider' },
  { type: 'footer', label: 'Note', text: 'A short closing line.' },
];

const COLORS = ['#0f172a', '#2563eb', '#047857', '#b45309', '#be123c', '#ffffff', '#f8fafc', '#e2e8f0', '#dbeafe', '#dcfce7', '#fef3c7', '#ffe4e6'];

function uid() {
  return `b-${Math.random().toString(36).slice(2, 7)}`;
}

function readImageFile(file) {
  if (!file.type.startsWith('image/')) return Promise.reject(new Error('Choose an image file'));
  if (file.size > 5 * 1024 * 1024) return Promise.reject(new Error('Image must be under 5 MB'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 800 / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.onerror = () => reject(new Error('Could not read that image'));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that image'));
    reader.readAsDataURL(file);
  });
}

export default function EmailDesigner({ blocks = [], backgroundColor = '#ffffff', selectedId, onChange }) {
  const selected = blocks.find((block) => block.id === selectedId) || null;

  const setBlocks = (next, nextSelected = selectedId) => {
    onChange({ blocks: next, backgroundColor, selectedId: nextSelected });
  };

  const insert = (type, index) => {
    const base = PALETTE.find((item) => item.type === type) || { type };
    const block = {
      id: uid(),
      type,
      text: base.text || '',
      url: base.url || '',
      color: base.color || '#0f172a',
      backgroundColor: '',
      buttonColor: base.buttonColor || '#2563eb',
      align: 'left',
    };
    const next = [...blocks];
    next.splice(index, 0, block);
    setBlocks(next, block.id);
  };

  const move = (from, to) => {
    if (to < 0 || to > blocks.length || from === to) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    const target = to > from ? to - 1 : to;
    next.splice(target, 0, item);
    setBlocks(next, item.id);
  };

  const patch = (id, changes) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, ...changes } : block)));
  };

  const readDrop = (event) => {
    try {
      return JSON.parse(event.dataTransfer.getData('application/json') || '{}');
    } catch {
      return {};
    }
  };

  const onDropAt = (event, index) => {
    event.preventDefault();
    const data = readDrop(event);
    if (data.kind === 'new') insert(data.type, index);
    if (data.kind === 'move') move(data.index, index);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr_260px]">
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Drag onto the email</p>
        <div className="mt-2 space-y-1">
          {PALETTE.map((item) => (
            <button
              key={item.type}
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'new', type: item.type }))}
              onClick={() => insert(item.type, blocks.length)}
              className="w-full cursor-grab rounded-lg border border-gray-200 px-2 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="mt-4 block">
          <span className={labelClass}>Email background</span>
          <input type="color" value={backgroundColor || '#ffffff'} onChange={(event) => onChange({ blocks, backgroundColor: event.target.value, selectedId })} className="h-9 w-full cursor-pointer rounded border border-gray-200 bg-white" />
        </label>
      </div>

      <div
        className="min-h-[420px] rounded-xl border border-dashed border-gray-300 p-3 shadow-sm"
        style={{ backgroundColor }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => onDropAt(event, blocks.length)}
      >
        {blocks.length === 0 ? <p className="px-2 py-8 text-center text-sm text-gray-500">Drop a section here.</p> : null}
        {blocks.map((block, index) => (
          <div key={block.id}>
            <div className="h-2" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDropAt(event, index)} />
            <div
              draggable
              onDragStart={(event) => event.dataTransfer.setData('application/json', JSON.stringify({ kind: 'move', index, id: block.id }))}
              onClick={() => onChange({ blocks, backgroundColor, selectedId: block.id })}
              className={`cursor-grab rounded-lg border p-2 ${selectedId === block.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-gray-300'}`}
            >
              <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                <GripVertical size={12} /> {PALETTE.find((item) => item.type === block.type)?.label || block.type}
              </span>
              <BlockView block={block} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Selected section</p>
        {selected ? (
          <div className="mt-3 space-y-3">
            {selected.type !== 'divider' && selected.type !== 'image' ? (
              <label className="block">
                <span className={labelClass}>Text</span>
                <textarea className={fieldClass} rows={4} value={selected.text || ''} onChange={(event) => patch(selected.id, { text: event.target.value })} />
              </label>
            ) : null}
            {selected.type === 'image' ? (
              <label className="block">
                <span className={labelClass}>Upload image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    const id = selected.id;
                    event.target.value = '';
                    if (!file) return;
                    readImageFile(file).then((url) => patch(id, { url })).catch((err) => toast.error(err.message));
                  }}
                />
              </label>
            ) : null}
            {(selected.type === 'button') ? (
              <label className="block">
                <span className={labelClass}>Link address</span>
                <input className={fieldClass} value={selected.url || ''} onChange={(event) => patch(selected.id, { url: event.target.value })} />
              </label>
            ) : null}
            <div>
              <span className={labelClass}>Text color</span>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((color) => (
                  <button key={`t-${color}`} type="button" onClick={() => patch(selected.id, { color })} className="h-6 w-6 rounded border border-gray-200" style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </div>
            <div>
              <span className={labelClass}>Section background</span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => patch(selected.id, { backgroundColor: '' })} className="rounded border border-gray-200 px-2 py-1 text-[11px]">None</button>
                {COLORS.map((color) => (
                  <button key={`b-${color}`} type="button" onClick={() => patch(selected.id, { backgroundColor: color })} className="h-6 w-6 rounded border border-gray-200" style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </div>
            {selected.type === 'button' ? (
              <div>
                <span className={labelClass}>Button color</span>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((color) => (
                    <button key={`btn-${color}`} type="button" onClick={() => patch(selected.id, { buttonColor: color })} className="h-6 w-6 rounded border border-gray-200" style={{ backgroundColor: color }} title={color} />
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button key={align} type="button" onClick={() => patch(selected.id, { align })} className={`rounded-lg border px-2 py-1 text-xs font-semibold capitalize ${selected.align === align ? 'border-primary text-primary' : 'border-gray-200 text-gray-600'}`}>
                  {align}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setBlocks(blocks.filter((block) => block.id !== selected.id), '')} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ) : <p className="mt-3 text-sm text-gray-500">Select a section in the email.</p>}
      </div>
    </div>
  );
}
