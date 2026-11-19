export default function Input({
  label, icon: Icon, error, hint, className = '', id, ...props
}) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="field-label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        )}
        <input
          id={inputId}
          className={`field-input ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
