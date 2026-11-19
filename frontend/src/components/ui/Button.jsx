import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-200',
  secondary: 'bg-navy-900 text-white shadow-sm hover:bg-navy-800 focus-visible:ring-navy-600',
  outline: 'border border-surface-line bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600 focus-visible:ring-brand-100',
  ghost: 'text-ink-700 hover:bg-slate-100 focus-visible:ring-slate-200',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-200',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-200',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
  icon: 'p-2.5',
};

export default function Button({
  children, variant = 'primary', size = 'md', loading = false, icon: Icon,
  to, className = '', disabled, type = 'button', ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-xl font-semibold transition
    focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50
    ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;

  const content = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </>
  );

  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
