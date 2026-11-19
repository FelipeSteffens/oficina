import { Building2, Check, ShieldOff } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { VINCULO_STATUS } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

export default function VinculosPanel({ veiculo, oficinas = [], vinculos = [], onToggle, loadingId }) {
  const byOficina = Object.fromEntries(vinculos.map((vinculo) => [Number(vinculo.oficina_id), vinculo]));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3.5">
        <Building2 size={20} className="text-brand-600" />
        <p className="text-sm text-brand-700">
          Autorize uma ou mais oficinas para acessar o veículo <strong>{veiculo.placa}</strong>. Você pode revogar o acesso a qualquer momento.
        </p>
      </div>

      {oficinas.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhuma oficina disponível" description="Ainda não há oficinas ativas cadastradas na plataforma." />
      ) : (
        <div className="space-y-3">
          {oficinas.map((oficina) => {
            const vinculo = byOficina[Number(oficina.id)];
            const autorizado = vinculo?.status === 'autorizado';
            return (
              <div key={oficina.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Building2 size={18} />
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-navy-900">{oficina.nome}</h4>
                    {vinculo && <StatusBadge status={vinculo.status} map={VINCULO_STATUS} />}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {oficina.endereco || 'Endereço não informado'}
                    {vinculo && ` · desde ${formatDate(vinculo.autorizado_em)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={autorizado ? 'outline' : 'primary'}
                  icon={autorizado ? ShieldOff : Check}
                  loading={loadingId === `${veiculo.id}-${oficina.id}`}
                  onClick={() => onToggle(veiculo.id, oficina.id, autorizado ? 'revogado' : 'autorizado')}
                >
                  {autorizado ? 'Revogar' : 'Autorizar'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {vinculos.length > 0 && (
        <p className="mt-4 text-xs text-ink-500">
          <Badge tone="success" dot={false}>{vinculos.filter((v) => v.status === 'autorizado').length} autorizada(s)</Badge>
        </p>
      )}
    </div>
  );
}
