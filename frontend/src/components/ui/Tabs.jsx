export default function Tabs({ tabs = [], active, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 overflow-x-auto rounded-xl bg-surface-soft p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
            active === tab.id ? 'bg-white text-navy-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
          }`}
        >
          {tab.label}
          {tab.count != null && <span className="ml-1.5 text-xs text-brand-600">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
