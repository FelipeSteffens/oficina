import { CalendarDays, CarFront, CheckCircle2, ClipboardList, FileText, History, Wrench } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import StatCard from '../../../components/ui/StatCard.jsx';
import Card from '../../../components/ui/Card.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { dashboardService } from '../../../services/dashboardService.js';
import { orcamentoService } from '../../../services/orcamentoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { OS_STATUS, ORCAMENTO_STATUS, AGENDAMENTO_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatDay, formatPlate, formatTime } from '../../../utils/formatters.js';

export default function ClienteDashboard() {
  const { data, loading, error, refetch } = useFetch(() => dashboardService.cliente());
  const toast = useToast();

  async function respond(id, action) {
    try {
      await orcamentoService[action](id);
      toast.success(action === 'aprovar' ? 'Orçamento aprovado!' : 'Orçamento recusado.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <Spinner fullPage label="Carregando seu painel..." />;

  if (error) return (
    <Card>
      <div className="p-5">
        <p className="font-bold text-red-700">Não foi possível carregar o painel.</p>
        <p className="mt-1 text-sm text-ink-500">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    </Card>
  );

  const kpis = data?.kpis || {};

  return (
    <div>
      <PageHeader eyebrow="Área do cliente" title="Olá, tudo em dia por aqui?" subtitle="Acompanhe seus veículos, serviços e aprovações em um só lugar."
        actions={<Button to="/app/cliente/garagem" icon={CarFront}>Minha garagem</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CarFront} label="Veículos cadastrados" value={kpis.veiculos ?? 0} tone="navy" hint="Na sua garagem digital" />
        <StatCard icon={Wrench} label="Serviços em andamento" value={kpis.servicos_andamento ?? 0} tone="white" hint="Acompanhamento em tempo real" />
        <StatCard icon={FileText} label="Orçamentos pendentes" value={kpis.orcamentos_pendentes ?? 0} tone="blue" hint="Aguardando sua decisão" />
        <StatCard icon={History} label="Manutenções registradas" value={kpis.total_manutencoes ?? 0} tone="white" hint="Histórico portátil dos veículos" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Orçamentos para aprovar" subtitle="Sua decisão libera o serviço" className="xl:col-span-2"
          actions={<Button to="/app/cliente/orcamentos" variant="ghost" size="sm">Ver todos</Button>}>
          {data?.orcamentos?.length ? (
            <div className="space-y-3">
              {data.orcamentos.map((orcamento) => (
                <div key={orcamento.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FileText size={18} /></div>
                  <div className="min-w-[180px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-navy-900">{formatPlate(orcamento.placa)} · {orcamento.marca} {orcamento.modelo}</p>
                      <StatusBadge status={orcamento.status} map={ORCAMENTO_STATUS} />
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{orcamento.descricao_servicos}</p>
                  </div>
                  <p className="font-display font-bold text-navy-900">{formatCurrency(orcamento.valor_total)}</p>
                  {orcamento.status === 'pendente' ? (
                    <div className="flex gap-2">
                      <Button size="sm" icon={CheckCircle2} onClick={() => respond(orcamento.id, 'aprovar')}>Aprovar</Button>
                      <Button size="sm" variant="outline" onClick={() => respond(orcamento.id, 'recusar')}>Recusar</Button>
                    </div>
                  ) : <Badge tone={orcamento.status === 'aprovado' ? 'success' : 'danger'}>Respondido</Badge>}
                </div>
              ))}
            </div>
          ) : <EmptyState icon={FileText} title="Tudo em dia!" description="Nenhum orçamento aguardando sua aprovação." />}
        </Card>

        <Card title="Próximos agendamentos" actions={<Button to="/app/cliente/agendamentos" variant="ghost" size="sm">Ver agenda</Button>}>
          {data?.agendamentos?.length ? (
            <div className="space-y-3">
              {data.agendamentos.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-surface-soft p-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm">
                    <span className="font-display text-base font-extrabold text-navy-900">{formatDay(item.data_agendamento)}</span>
                    <span className="text-[9px] font-bold uppercase text-brand-600">{formatDate(item.data_agendamento).split('/')[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{formatPlate(item.placa)}</p>
                    <p className="text-xs text-ink-500">{formatTime(item.horario)} · {item.oficina_nome}</p>
                  </div>
                  <StatusBadge status={item.status} map={AGENDAMENTO_STATUS} />
                </div>
              ))}
            </div>
          ) : <EmptyState icon={CalendarDays} title="Sem agendamentos" description="Solicite um atendimento quando precisar." />}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Meus veículos" actions={<Button to="/app/cliente/garagem" variant="ghost" size="sm">Gerenciar</Button>}>
          {data?.veiculos?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.veiculos.map((veiculo) => (
                <Button key={veiculo.id} to={`/app/cliente/veiculos/${veiculo.id}`} variant="outline" className="!justify-start !h-auto !py-3">
                  <div className="text-left">
                    <p className="text-sm font-bold">{veiculo.marca} {veiculo.modelo}</p>
                    <p className="text-xs font-normal text-ink-500">{formatPlate(veiculo.placa)} · {veiculo.quilometragem} km</p>
                  </div>
                </Button>
              ))}
            </div>
          ) : <EmptyState icon={CarFront} title="Garagem vazia" description="Cadastre seu primeiro veículo." />}
        </Card>

        <Card title="Serviços recentes" actions={<Button to="/app/cliente/historico" variant="ghost" size="sm">Histórico</Button>}>
          {data?.servicos?.length ? (
            <div className="space-y-3">
              {data.servicos.map((os) => (
                <div key={os.id} className="flex items-center gap-3 border-b border-surface-line pb-3 last:border-0 last:pb-0">
                  <div className="rounded-lg bg-navy-900 p-2 text-white"><Wrench size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">OS #{os.id} · {formatPlate(os.placa)}</p>
                    <p className="text-xs text-ink-500">{formatDate(os.data_entrada)} · {os.oficina_nome}</p>
                  </div>
                  <StatusBadge status={os.status} map={OS_STATUS} />
                </div>
              ))}
            </div>
          ) : <EmptyState icon={ClipboardList} title="Nenhum serviço ainda" description="Seus atendimentos aparecerão aqui." />}
        </Card>
      </div>
    </div>
  );
}
