import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function StatusModal({ isOpen, onClose, type, title, message, duration = 5000 }) {
  useEffect(() => {
    if (!isOpen || duration <= 0) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="flex items-start gap-4">
          <Icon size={24} className={isSuccess ? 'text-green-500' : 'text-red-500'} />
          <div>
            <h3 className={`text-lg font-semibold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
