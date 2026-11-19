export default function Card({ title, subtitle, actions, children, className = '', bodyClass = '', padded = true }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-line px-5 py-4">
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`${padded ? 'p-5' : ''} ${bodyClass}`}>{children}</div>
    </section>
  );
}
