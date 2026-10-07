export default function ActionIconButton({
  label,
  onClick,
  className = '',
  children,
  icon: Icon,
  iconSize = 15,
  to,
  as: Component,
  disabled = false,
}) {
  const classes = `rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
  const content = children ?? (Icon ? <Icon size={iconSize} /> : null);

  if (to && Component) {
    return (
      <Component
        to={to}
        title={label}
        aria-label={label}
        className={classes}
      >
        {content}
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
      {content}
    </button>
  );
}
