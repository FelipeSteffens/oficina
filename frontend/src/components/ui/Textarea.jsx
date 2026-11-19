export default function Textarea({ label, error, hint, className = '', id, rows = 4, ...props }) {
  const areaId = id || props.name;
  return (
    <div className={className}>
      {label && <label htmlFor={areaId} className="field-label">{label}</label>}
      <textarea
        id={areaId}
        rows={rows}
        className={`field-input resize-y ${error ? 'border-red-400' : ''}`}
        {...props}
      />
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
