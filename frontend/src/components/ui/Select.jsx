export default function Select({ label, error, hint, children, className = '', id, ...props }) {
  const selectId = id || props.name;
  return (
    <div className={className}>
      {label && <label htmlFor={selectId} className="field-label">{label}</label>}
      <select
        id={selectId}
        className={`field-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${error ? 'border-red-400' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}
