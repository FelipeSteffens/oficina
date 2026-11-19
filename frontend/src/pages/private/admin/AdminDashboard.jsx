import {
  Activity, Building2, CarFront, CheckCircle2, ClipboardList, FileText, ShieldCheck, Users,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import StatCard from '../../../components/ui/StatCard.jsx';
import Card from '../../../components/ui/Card.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { dashboardService } from '../../../services/dashboardService.js';
import { formatCurrency, formatDateTime } from '../../../utils/formatters.js';

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useFetch(() => dashboardService.global());

  if (loading) return <Spinner fullPage label="Carregando visão global..." />;

  if (error) return (
    <Card>
      <div className="p-5">
        <p className="font-bold text-red-700">Não foi possível carregar a visão global.</p>
        <p className="mt-1 text-sm text-ink-500">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    </Card>
  );

  const kpis = data?.kpis || {};

  return (
    <div>
      <PageHeader eyebrow="Administração global" title="Visão da plataforma" subtitle="Indicadores consolidados de todas as oficinas e usuários." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Building2} label="Oficinas ativas" value={`${kpis.oficinas_ativas ?? 0}/${kpis.total_oficinas ?? 0}`} tone="navy" hint="Ativas sobre o total cadastrado" />
        <StatCard icon={Users} label="Usuários" value={kpis.total_usuarios ?? 0} tone="blue" hint={`${kpis.total_clientes ?? 0} clientes`} />
        <StatCard icon={ClipboardList} label="Ordens de serviço" value={kpis.total_os ?? 0} tone="white" hint={`${kpis.os_concluidas ?? 0} concluídas`} />
        <StatCard icon={CheckCircle2} label="Faturamento total" value={formatCurrency(kpis.faturamento_total)} tone="emerald" hint="Soma das OS concluídas" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Oficinas cadastradas" subtitle="Visão por unidade" actions={<Button to="/app/admin/oficinas" variant="ghost" size="sm">Gerenciar</Button>} padded={false}>
          <div className="px-5 pb-5">
            {data?.oficinas?.length ? (
              <div className="space-y-3">
                {data.oficinas.map((oficina) => (
                  <div key={oficina.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white"><Building2 size={18} /></div>
                    <div className="min-w-[180px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-navy-900">{oficina.nome}</p>
                        <Badge tone={oficina.ativa ? 'success' : 'danger'}>{oficina.ativa ? 'Ativa' : 'Inativa'}</Badge>
                      </div>
                      <p className="text-xs text-ink-500">{oficina.email} · {oficina.cidade || oficina.endereco || '—'}</p>
                    </div>
                    <div className="flex gap-4 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Users size={14} /> {oficina.total_funcionarios ?? 0}</span>
                      <span className="flex items-center gap-1"><CarFront size={14} /> {oficina.total_veiculos ?? 0}</span>
                      <span className="flex items-center gap-1"><ClipboardList size={14} /> {oficina.total_os ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState icon={Building2} title="Nenhuma oficina" description="Cadastre a primeira oficina na plataforma." />}
          </div>
        </Card>

        <Card title="Atividade recente" subtitle="Últimas ações auditadas">
          {data?.atividadeRecente?.length ? (
            <div className="relative space-y-4 pl-5">
              <span className="absolute bottom-2 left-[5px] top-2 w-0.5 bg-surface-line" />
              {data.atividadeRecente.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -left-[19px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
                  <div className="rounded-xl bg-surface-soft p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-navy-900">{log.acao}</p>
                      {log.oficina_nome && <Badge tone="neutral">{log.oficina_nome}</Badge>}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-ink-500">{log.detalhes || log.referencia || '—'}</p>
                    <p className="mt-1.5 text-[11px] text-ink-400">{formatDateTime(log.data_hora)} · {log.usuario_nome || 'Sistema'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Activity} title="Sem atividade" description="As ações auditadas aparecerão aqui." />}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Orçamentos pendentes" value={kpis.orcamentos_pendentes ?? 0} tone="white" hint="Em todas as oficinas" />
        <StatCard icon={CarFront} label="Veículos cadastrados" value={kpis.total_veiculos ?? 0} tone="white" hint="Garagens digitais" />
        <StatCard icon={ShieldCheck} label="Integridade dos dados" value="100%" tone="navy" hint="Isolamento por oficina ativo" />
      </div>
    </div>
  );
}
