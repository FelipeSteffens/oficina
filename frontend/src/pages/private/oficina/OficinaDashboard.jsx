import { AlertTriangle, CalendarDays, CarFront, CheckCircle2, CircleDollarSign, ClipboardList, FileText, Package, Wrench } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import StatCard from '../../../components/ui/StatCard.jsx';
import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import OsPorMesChart from '../../../components/charts/OsPorMesChart.jsx';
import StatusPieChart from '../../../components/charts/StatusPieChart.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { dashboardService } from '../../../services/dashboardService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { OS_STATUS, ORCAMENTO_STATUS, AGENDAMENTO_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatDay, formatPlate, formatTime } from '../../../utils/formatters.js';

export default function OficinaDashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch(() => dashboardService.oficina());

  if (loading) return <Spinner fullPage label="Carregando painel da oficina..." />;

  if (error) return (
    <Card>
      <div className="p-5">
        <p className="font-bold text-red-700">Não foi possível carregar o painel da oficina.</p>
        <p className="mt-1 text-sm text-ink-500">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    </Card>
  );

  const kpis = data?.kpis || {};

  return (
    <div>
      <PageHeader eyebrow="Painel operacional" title={`Olá, ${user?.nome?.split(' ')[0]}!`} subtitle="Visão consolidada das operações da sua oficina."
        actions={<Button to="/app/oficina/os" icon={Wrench}>Nova ordem de serviço</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={ClipboardList} label="Serviços em andamento" value={kpis.servicos_andamento ?? 0} tone="navy" hint="OS abertas no momento" />
        <StatCard icon={CircleDollarSign} label="Faturamento (30 dias)" value={formatCurrency(kpis.faturamento_mes)} tone="blue" hint={`${kpis.concluidas_mes ?? 0} OS concluídas`} />
        <StatCard icon={FileText} label="Orçamentos pendentes" value={kpis.orcamentos_pendentes ?? 0} tone="white" hint="Aguardando aprovação do cliente" />
        <StatCard icon={Package} label="Itens com estoque baixo" value={kpis.estoque_baixo ?? 0} tone={Number(kpis.estoque_baixo) > 0 ? 'amber' : 'white'} hint="Reposição recomendada" />
        <StatCard icon={CalendarDays} label="Agendamentos futuros" value={kpis.agendamentos_futuros ?? 0} tone="white" hint="Pendentes e confirmados" />
        <StatCard icon={CheckCircle2} label="Concluídas (30 dias)" value={kpis.concluidas_mes ?? 0} tone="emerald" hint="Finalizadas com histórico gravado" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Atendimentos nos últimos 6 meses" subtitle="Volume de OS e faturamento">
          <OsPorMesChart data={data?.osPorMes} />
        </Card>
        <Card title="Distribuição por status" subtitle="Todas as ordens de serviço">
          <StatusPieChart data={data?.statusSeries} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Atendimentos recentes" subtitle="Últimas ordens de serviço registradas"
          actions={<Button to="/app/oficina/os" variant="ghost" size="sm">Ver todas</Button>} padded={false}>
          <div className="px-5 pb-5">
            {data?.atendimentosRecentes?.length ? (
              <div className="space-y-3">
                {data.atendimentosRecentes.map((os) => (
                  <div key={os.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Wrench size={18} /></div>
                    <div className="min-w-[160px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-navy-900">OS #{os.id} · {formatPlate(os.placa)}</p>
                        <StatusBadge status={os.status} map={OS_STATUS} />
                      </div>
                      <p className="text-xs text-ink-500">{os.marca} {os.modelo} · {os.cliente_nome}</p>
                    </div>
                    <p className="font-display font-bold text-navy-900">{formatCurrency(os.valor_total)}</p>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={ClipboardList} title="Nenhuma OS registrada" description="Abra sua primeira ordem de serviço." />}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Próximos agendamentos" actions={<Button to="/app/oficina/agendamentos" variant="ghost" size="sm">Ver agenda</Button>}>
            {data?.proximosAgendamentos?.length ? (
              <div className="space-y-3">
                {data.proximosAgendamentos.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-surface-soft p-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm">
                      <span className="font-display text-base font-extrabold text-navy-900">{formatDay(item.data_agendamento)}</span>
                      <span className="text-[9px] font-bold uppercase text-brand-600">{formatDate(item.data_agendamento).split('/')[1]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-900">{formatPlate(item.placa)} · {item.cliente_nome}</p>
                      <p className="text-xs text-ink-500">{formatTime(item.horario)} · {item.observacoes || 'Sem observações'}</p>
                    </div>
                    <StatusBadge status={item.status} map={AGENDAMENTO_STATUS} />
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={CalendarDays} title="Agenda livre" description="Nenhum agendamento futuro." />}
          </Card>

          <Card title="Orçamentos aguardando resposta" actions={<Button to="/app/oficina/orcamentos" variant="ghost" size="sm">Ver todos</Button>}>
            {data?.orcamentosPendentes?.length ? (
              <div className="space-y-3">
                {data.orcamentosPendentes.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-surface-line pb-3 last:border-0 last:pb-0">
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><FileText size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-900">#{item.id} · {formatPlate(item.placa)}</p>
                      <p className="text-xs text-ink-500">{item.cliente_nome}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-navy-900">{formatCurrency(item.valor_total)}</span>
                    <StatusBadge status={item.status} map={ORCAMENTO_STATUS} />
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={FileText} title="Tudo respondido" description="Sem orçamentos pendentes." />}
          </Card>
        </div>
      </div>

      <Card title="Veículos atendidos recentemente" className="mt-6" actions={<Button to="/app/oficina/veiculos" variant="ghost" size="sm">Ver frota</Button>}>
        {data?.veiculosAtendidos?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.veiculosAtendidos.map((veiculo) => (
              <div key={veiculo.id} className="flex items-center gap-3 rounded-xl border border-surface-line p-3.5">
                <div className="rounded-xl bg-navy-900 p-2.5 text-white"><CarFront size={17} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy-900">{veiculo.marca} {veiculo.modelo}</p>
                  <p className="text-xs text-ink-500">{formatPlate(veiculo.placa)} · {veiculo.cliente_nome}</p>
                </div>
                {veiculo.quilometragem != null && <Badge tone="neutral">{veiculo.quilometragem} km</Badge>}
              </div>
            ))}
          </div>
        ) : <EmptyState icon={CarFront} title="Nenhum veículo atendido" description="Veículos autorizados aparecerão aqui." />}
      </Card>
    </div>
  );
}
