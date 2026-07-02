export default function Footer({ variant = 'admin' }) {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>&copy; {year} CareTraker. All rights reserved.</span>
        {variant === 'admin' ? (
          <span>Admin Panel v1.0</span>
        ) : (
          <span>Secure Registration Portal</span>
        )}
      </div>
    </footer>
  );
}
