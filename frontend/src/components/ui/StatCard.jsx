import { ArrowUpRight } from 'lucide-react';

const TONES = {
  navy: 'bg-navy-900 text-white border-navy-800',
  blue: 'bg-brand-600 text-white border-brand-700',
  white: 'bg-white text-navy-900 border-surface-line',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export default function StatCard({ icon: Icon, label, value, hint, trend, tone = 'white', className = '' }) {
  const dark = tone === 'navy' || tone === 'blue';
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-card ${TONES[tone] || TONES.white} ${className}`}>
      {Icon && (
        <div className={`mb-4 inline-flex rounded-xl p-2.5 ${dark ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'}`}>
          <Icon size={20} />
        </div>
      )}
      <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-white/70' : 'text-ink-500'}`}>{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="font-display text-2xl font-extrabold tracking-tight">{value}</p>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${dark ? 'text-white/80' : 'text-emerald-600'}`}>
            <ArrowUpRight size={14} /> {trend}
          </span>
        )}
      </div>
      {hint && <p className={`mt-1.5 text-xs ${dark ? 'text-white/60' : 'text-ink-500'}`}>{hint}</p>}
      <span className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-current opacity-[0.04]" />
    </div>
  );
}
