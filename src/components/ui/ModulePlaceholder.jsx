import { Construction } from 'lucide-react';

export default function ModulePlaceholder({ title, description }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Construction size={28} className="text-primary" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {description ??
          'This module is part of the platform roadmap. UI shell is ready for integration.'}
      </p>
    </div>
  );
}
