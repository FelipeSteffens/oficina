import { CalendarDays, FileDown, Gauge, History, Wrench } from 'lucide-react';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters.js';
import { downloadHistoricoPdf } from '../../utils/pdfGenerator.js';

export default function HistoricoTimeline({ data }) {
  const registros = data?.registros || [];
  const veiculo = data?.veiculo;

  if (!registros.length) {
    return <EmptyState icon={History} title="Nenhuma manutenção registrada" description="Assim que uma OS for concluída por uma oficina autorizada, o serviço aparecerá aqui — pertencente ao veículo, não à oficina." />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-navy-900 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-2.5"><History size={22} /></div>
          <div>
            <p className="font-display font-bold">{veiculo?.marca} {veiculo?.modelo} · {veiculo?.placa}</p>
            <p className="text-xs text-white/60">{registros.length} atendimento(s) no histórico portátil</p>
          </div>
        </div>
        <Button variant="outline" icon={FileDown} size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20"
          onClick={() => downloadHistoricoPdf(data)}>
          Exportar PDF
        </Button>
      </div>

      <div className="relative pl-6 sm:pl-8">
        <span className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-surface-line sm:left-[11px]" />
        {registros.map((item, index) => (
          <div key={item.id} className="relative mb-5 last:mb-0">
            <span className={`absolute -left-[22px] top-4 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-surface-soft sm:-left-[26px] sm:h-6 sm:w-6 ${index === 0 ? 'bg-brand-600' : 'bg-navy-600'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <article className="rounded-2xl border border-surface-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-display font-bold text-navy-900">{item.servicos_realizados || 'Atendimento registrado'}</h4>
                  <p className="mt-1 text-xs text-ink-500">{item.oficina_nome || 'Oficina'}{item.os_id ? ` · OS #${item.os_id}` : ''}</p>
                </div>
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Concluído</span>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-2 text-ink-700"><CalendarDays size={16} className="text-brand-600" /> {formatDate(item.data_servico)}</div>
                <div className="flex items-center gap-2 text-ink-700"><Gauge size={16} className="text-brand-600" /> {formatNumber(item.quilometragem)} km</div>
                <div className="flex items-center gap-2 font-bold text-navy-900"><Wrench size={16} className="text-brand-600" /> {formatCurrency(item.valor_total)}</div>
              </div>

              {item.diagnostico && <p className="mt-4 rounded-xl bg-surface-soft p-3 text-sm leading-relaxed text-ink-700"><strong className="text-navy-900">Diagnóstico:</strong> {item.diagnostico}</p>}
              {item.pecas_substituidas && <p className="mt-2 text-sm text-ink-600"><strong className="text-navy-900">Peças:</strong> {item.pecas_substituidas}</p>}

              <p className="mt-4 border-t border-surface-line pt-3 text-[11px] text-ink-400">Registro imutável · gravado em {formatDate(item.criado_em)}</p>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
