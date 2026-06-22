export default function RegistrationHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-4 border-b border-gray-200 bg-white px-8">
      <span className="text-sm text-gray-500">Need help?</span>
      <button
        type="button"
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        Contact Support
      </button>
    </header>
  );
}
