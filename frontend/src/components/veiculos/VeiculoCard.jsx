import { CarFront, Gauge, CalendarDays, Settings2 } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { formatNumber, formatPlate } from '../../utils/formatters.js';

export default function VeiculoCard({ veiculo, onEdit, onDetail, onVinculos }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-surface-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative h-24 bg-gradient-to-br from-navy-900 to-brand-600">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:18px_18px] opacity-40" />
        <CarFront size={62} className="absolute bottom-3 right-4 text-white/25" strokeWidth={1.2} />
        <span className="absolute left-4 top-4 rounded-lg bg-white/15 px-2.5 py-1 font-display text-sm font-bold tracking-wide text-white backdrop-blur">
          {formatPlate(veiculo.placa)}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-navy-900">{veiculo.marca} {veiculo.modelo}</h3>
        <p className="mt-0.5 text-sm text-ink-500">{veiculo.ano} · {veiculo.cor || 'Cor não informada'}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-ink-700">
            <Gauge size={16} className="text-brand-600" />
            <span>{formatNumber(veiculo.quilometragem)} km</span>
          </div>
          <div className="flex items-center gap-2 text-ink-700">
            <CalendarDays size={16} className="text-brand-600" />
            <span>{veiculo.total_registros ?? 0} registros</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-line pt-4">
          <Badge tone="info">{veiculo.combustivel || '—'}</Badge>
          {veiculo.total_os != null && <Badge tone="neutral">{veiculo.total_os} atendimentos</Badge>}
          <div className="ml-auto flex items-center gap-1.5">
            {onDetail && (
              <button type="button" onClick={() => onDetail(veiculo)} className="rounded-lg px-2 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50">
                Detalhes
              </button>
            )}
            {onVinculos && (
              <button type="button" onClick={() => onVinculos(veiculo)} className="rounded-lg px-2 py-1.5 text-xs font-bold text-ink-500 hover:bg-slate-100">
                Oficinas
              </button>
            )}
            {onEdit && (
              <button type="button" onClick={() => onEdit(veiculo)} className="rounded-lg p-1.5 text-ink-500 transition hover:bg-slate-100 hover:text-brand-600" aria-label="Editar">
                <Settings2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
