/** Logomarca vetorial autoral: escudo + velocímetro + engrenagem estilizada. */
export default function Logo({ size = 40, showText = true, light = false, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="AutoTrack Pro" role="img">
        <defs>
          <linearGradient id="atp-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E56A0" />
          </linearGradient>
        </defs>
        <path d="M24 2.5 43 9.5v14.2c0 11.4-7.9 18.9-19 21.8C12.9 42.6 5 35.1 5 23.7V9.5L24 2.5Z" fill="url(#atp-grad)" />
        <path d="M24 2.5 43 9.5v14.2c0 11.4-7.9 18.9-19 21.8C12.9 42.6 5 35.1 5 23.7V9.5L24 2.5Z" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
        {/* arco do velocímetro */}
        <path d="M13 30a11 11 0 1 1 22 0" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity=".95" />
        {/* marcas de escala */}
        <path d="M14.8 25.5 12.5 24M24 17.5v-3M33.2 25.5l2.3-1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".75" />
        {/* ponteiro */}
        <path d="m24 30 7.5-8.2" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="24" cy="30" r="2.8" fill="white" />
        {/* dentes de engrenagem sugeridos na base do escudo */}
        <path d="M19 36.5h10M21 39.8h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".8" />
      </svg>
      {showText && (
        <div className="leading-none">
          <p className={`font-display text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
            AutoTrack <span className={light ? 'text-brand-200' : 'text-brand-600'}>Pro</span>
          </p>
          {!compact && (
            <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-white/50' : 'text-ink-500'}`}>
              Telemetria automotiva
            </p>
          )}
        </div>
      )}
    </div>
  );
}
