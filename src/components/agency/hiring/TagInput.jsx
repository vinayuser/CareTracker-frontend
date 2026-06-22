import { useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ value = [], onChange, suggestions = [], placeholder = 'Add keyword' }) {
  const [input, setInput] = useState('');

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 px-3 py-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-primary/70 hover:text-primary">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(input);
            }
          }}
          onBlur={() => input && addTag(input)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-md border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
