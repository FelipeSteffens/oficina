import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export const TOAST_VARIANTS = {
  success: { icon: CheckCircle2, colors: 'border-emerald-200 text-emerald-700', iconColor: 'text-emerald-500' },
  error: { icon: AlertCircle, colors: 'border-red-200 text-red-700', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, colors: 'border-amber-200 text-amber-700', iconColor: 'text-amber-500' },
  info: { icon: Info, colors: 'border-brand-200 text-brand-700', iconColor: 'text-brand-500' },
};

/** Componente visual de um toast (usado pelo ToastProvider). */
export default function Toast({ item, onDismiss }) {
  const variant = TOAST_VARIANTS[item.variant] || TOAST_VARIANTS.info;
  const Icon = variant.icon;
  return (
    <div className={`pointer-events-auto flex animate-slide-in items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lift ${variant.colors}`} role="status">
      <Icon size={19} className={`mt-0.5 shrink-0 ${variant.iconColor}`} />
      <div className="min-w-0 flex-1">
        {item.title && <p className="text-sm font-bold text-navy-900">{item.title}</p>}
        <p className="text-sm leading-snug">{item.message}</p>
      </div>
      <button type="button" onClick={() => onDismiss(item.id)} className="rounded-md p-0.5 text-ink-400 transition hover:bg-slate-100" aria-label="Fechar">
        <X size={16} />
      </button>
    </div>
  );
}
