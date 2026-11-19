import { useState } from 'react';
import { BarChart3, Download, FileDown, FileText, Package, TrendingUp, Wrench } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import StatCard from '../../../components/ui/StatCard.jsx';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import OsPorMesChart from '../../../components/charts/OsPorMesChart.jsx';
import StatusPieChart from '../../../components/charts/StatusPieChart.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { dashboardService } from '../../../services/dashboardService.js';
import { osService } from '../../../services/osService.js';
import { estoqueService } from '../../../services/estoqueService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { OS_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatPlate } from '../../../utils/formatters.js';
import { downloadEstoquePdf, downloadOsPdf } from '../../../utils/pdfGenerator.js';

export default function RelatoriosPage() {
  const [exportando, setExportando] = useState(false);
  const { data, loading } = useFetch(() => dashboardService.oficina());
  const toast = useToast();

  async function exportOs() {
    setExportando(true);
    try {
      const lista = await osService.list();
      const detalhes = await Promise.all((lista || []).map((os) => osService.get(os.id)));
      if (!detalhes.length) {
        toast.warning('Nenhuma OS para exportar.');
        return;
      }
      detalhes.forEach((os) => downloadOsPdf(os));
      toast.success(`${detalhes.length} ordem(ns) de serviço exportada(s).`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExportando(false);
    }
  }

  async function exportEstoque() {
    setExportando(true);
    try {
      const pecas = await estoqueService.list();
      downloadEstoquePdf(pecas);
      toast.success('Inventário exportado em PDF.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExportando(false);
    }
  }

  if (loading) return <Spinner fullPage label="Gerando relatórios..." />;

  const kpis = data?.kpis || {};
  const totalOs = (data?.statusSeries || []).reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Relatórios e indicadores" subtitle="Análise de desempenho e exportação de documentos em PDF."
        actions={
          <>
            <Button variant="outline" icon={Package} loading={exportando} onClick={exportEstoque}>Inventário PDF</Button>
            <Button icon={FileDown} loading={exportando} onClick={exportOs}>Ordens de serviço PDF</Button>
          </>
        } />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wrench} label="Total de OS" value={totalOs} tone="navy" />
        <StatCard icon={TrendingUp} label="Faturamento (30 dias)" value={formatCurrency(kpis.faturamento_mes)} tone="blue" />
        <StatCard icon={BarChart3} label="Concluídas (30 dias)" value={kpis.concluidas_mes ?? 0} tone="white" />
        <StatCard icon={Package} label="Estoque baixo" value={kpis.estoque_baixo ?? 0} tone={Number(kpis.estoque_baixo) > 0 ? 'amber' : 'white'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Volume de atendimentos e faturamento" subtitle="Últimos 6 meses">
          <OsPorMesChart data={data?.osPorMes} />
        </Card>
        <Card title="Distribuição das OS" subtitle="Por status atual">
          <StatusPieChart data={data?.statusSeries} />
        </Card>
      </div>

      <Card title="Resumo por status" className="mt-6" padded={false}>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
          {(data?.statusSeries || []).map((item) => (
            <div key={item.status} className="rounded-xl border border-surface-line p-4">
              <Badge tone={OS_STATUS[item.status]?.badge || 'neutral'}>{OS_STATUS[item.status]?.label || item.status}</Badge>
              <p className="mt-3 font-display text-2xl font-extrabold text-navy-900">{item.total}</p>
              <p className="text-xs text-ink-500">{totalOs ? Math.round((item.total / totalOs) * 100) : 0}% do total</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Atendimentos recentes" subtitle="Base para conferência dos relatórios" className="mt-6" padded={false}>
        <div className="px-5 pb-5">
          {data?.atendimentosRecentes?.length ? (
            <div className="space-y-2">
              {data.atendimentosRecentes.map((os) => (
                <div key={os.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-3.5">
                  <div className="rounded-lg bg-navy-900 p-2 text-white"><FileText size={15} /></div>
                  <div className="min-w-[160px] flex-1">
                    <p className="text-sm font-bold text-navy-900">OS #{os.id} · {formatPlate(os.placa)}</p>
                    <p className="text-xs text-ink-500">{os.cliente_nome} · {formatDate(os.data_entrada)}</p>
                  </div>
                  <Badge tone={OS_STATUS[os.status]?.badge || 'neutral'}>{OS_STATUS[os.status]?.label || os.status}</Badge>
                  <span className="font-display font-bold text-navy-900">{formatCurrency(os.valor_total)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={FileText} title="Sem dados" description="Registre atendimentos para gerar relatórios." />}
        </div>
      </Card>

      <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
        <Download size={17} /> Os arquivos PDF são gerados localmente no navegador, com cabeçalho e identidade visual da AutoTrack Pro.
      </div>
    </div>
  );
}
