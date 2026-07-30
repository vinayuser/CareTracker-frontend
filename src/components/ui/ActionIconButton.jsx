export default function ActionIconButton({
  label,
  onClick,
  className = '',
  children,
  to,
  as: Component,
  disabled = false,
}) {
  const classes = `rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`;

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
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
