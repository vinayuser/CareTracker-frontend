import { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link'],
  ['clean'],
];

export default function LegalRichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(() => ({
    toolbar: TOOLBAR,
    clipboard: { matchVisual: false },
  }), []);

  return (
    <div className="legal-rich-editor mt-1.5 overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-primary">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Write the full policy text here…'}
      />
      <style>{`
        .legal-rich-editor .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }
        .legal-rich-editor .ql-container.ql-snow {
          border: 0;
          font-size: 14px;
          min-height: 420px;
        }
        .legal-rich-editor .ql-editor {
          min-height: 420px;
          line-height: 1.7;
          color: #0f172a;
        }
        .legal-rich-editor .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
