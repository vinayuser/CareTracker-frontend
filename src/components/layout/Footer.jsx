export default function Footer({ variant = 'admin' }) {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 lg:px-8 lg:py-4">
      <div className="flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {year} Caretraqer. All rights reserved.</span>
        {variant === 'admin' ? (
          <span>Admin Panel v1.0</span>
        ) : (
          <span>Secure Registration Portal</span>
        )}
      </div>
    </footer>
  );
}
