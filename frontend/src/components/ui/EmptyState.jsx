import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nada por aqui ainda', description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-line bg-surface-soft/60 px-6 py-12 text-center ${className}`}>
      <div className="mb-4 rounded-2xl bg-white p-3.5 text-brand-600 shadow-card">
        <Icon size={26} />
      </div>
      <h4 className="font-display text-base font-bold text-navy-900">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
