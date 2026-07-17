export default function ActionIconButton({ label, onClick, className = '', children, to, as: Component }) {
  const classes = `rounded-lg p-1.5 transition-colors ${className}`;

  if (to && Component) {
    return (
      <Component
        to={to}
        title={label}
        aria-label={label}
        className={classes}
      >
        {children}
      </Component>
    );
  }

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
