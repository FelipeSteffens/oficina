const TONES = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  navy: 'bg-navy-900 text-white ring-navy-800',
};

const DOTS = {
  success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500',
  info: 'bg-blue-500', purple: 'bg-violet-500', neutral: 'bg-slate-400', navy: 'bg-brand-500',
};

export default function Badge({ children, tone = 'neutral', dot = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone] || TONES.neutral} ${className}`}>
      {dot && <span className={`relative flex h-1.5 w-1.5 ${DOTS[tone] || DOTS.neutral} rounded-full`}>
        {tone === 'success' && <span className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${DOTS[tone]}`} />}
      </span>}
      {children}
    </span>
  );
}
