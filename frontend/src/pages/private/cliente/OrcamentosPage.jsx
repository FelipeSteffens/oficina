import { useState } from 'react';
import { CheckCircle2, FileDown, FileText, XCircle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import Tabs from '../../../components/ui/Tabs.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { orcamentoService } from '../../../services/orcamentoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { ORCAMENTO_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatPlate } from '../../../utils/formatters.js';
import { downloadOrcamentoPdf } from '../../../utils/pdfGenerator.js';

export default function OrcamentosPage() {
  const [tab, setTab] = useState('todos');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const { data, loading, refetch } = useFetch(() => orcamentoService.list());
  const toast = useToast();

  const orcamentos = data || [];
  const filtered = tab === 'todos' ? orcamentos : orcamentos.filter((item) => item.status === tab);
  const counts = {
    todos: orcamentos.length,
    pendente: orcamentos.filter((item) => item.status === 'pendente').length,
    aprovado: orcamentos.filter((item) => item.status === 'aprovado').length,
    recusado: orcamentos.filter((item) => item.status === 'recusado').length,
  };

  async function respond(id, action) {
    setBusy(`${action}-${id}`);
    try {
      await orcamentoService[action](id);
      toast.success(action === 'aprovar' ? 'Orçamento aprovado com sucesso!' : 'Orçamento recusado.');
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function openDetail(row) {
    try {
      setSelected(await orcamentoService.get(row.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Área do cliente" title="Meus orçamentos" subtitle="Analise, aprove ou recuse as propostas enviadas pelas oficinas." />

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'todos', label: 'Todos', count: counts.todos },
              { id: 'pendente', label: 'Pendentes', count: counts.pendente },
              { id: 'aprovado', label: 'Aprovados', count: counts.aprovado },
              { id: 'recusado', label: 'Recusados', count: counts.recusado },
            ]}
          />
        </div>
        <div className="px-5 pb-5">
          <Table
            loading={loading}
            data={filtered}
            onRowClick={openDetail}
            emptyTitle="Nenhum orçamento encontrado"
            emptyDescription="Quando uma oficina autorizada enviar uma proposta, ela aparecerá aqui."
            columns={[
              { key: 'id', label: '#', render: (row) => <span className="font-bold text-navy-900">#{row.id}</span> },
              { key: 'veiculo', label: 'Veículo', render: (row) => (
                <div><p className="font-semibold text-navy-900">{row.marca} {row.modelo}</p><p className="text-xs text-ink-500">{formatPlate(row.placa)}</p></div>
              ) },
              { key: 'oficina', label: 'Oficina', render: (row) => row.oficina_nome || '—' },
              { key: 'valor', label: 'Valor', render: (row) => <span className="font-bold text-navy-900">{formatCurrency(row.valor_total)}</span> },
              { key: 'data', label: 'Enviado em', render: (row) => formatDate(row.criado_em) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} map={ORCAMENTO_STATUS} /> },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Orçamento #${selected?.id || ''}`}
        subtitle={selected ? `${selected.oficina_nome} · ${formatDate(selected.criado_em)}` : ''}
        size="lg"
        footer={selected ? (
          <>
            <Button variant="outline" icon={FileDown} onClick={() => downloadOrcamentoPdf(selected)}>Baixar PDF</Button>
            {selected.status === 'pendente' ? (
              <>
                <Button variant="ghost" icon={XCircle} loading={busy === `recusar-${selected.id}`} onClick={() => respond(selected.id, 'recusar')}>Recusar</Button>
                <Button icon={CheckCircle2} loading={busy === `aprovar-${selected.id}`} onClick={() => respond(selected.id, 'aprovar')}>Aprovar orçamento</Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setSelected(null)}>Fechar</Button>
            )}
          </>
        ) : null}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-4">
              <div className="rounded-xl bg-white p-2.5 text-brand-600"><FileText size={20} /></div>
              <div className="flex-1">
                <p className="font-display font-bold text-navy-900">{selected.marca} {selected.modelo} · {formatPlate(selected.placa)}</p>
                <p className="text-xs text-ink-500">Solicitado por {selected.oficina_nome}</p>
              </div>
              <StatusBadge status={selected.status} map={ORCAMENTO_STATUS} />
            </div>

            <div>
              <p className="field-label">Descrição dos serviços</p>
              <p className="rounded-xl bg-surface-soft p-4 text-sm leading-relaxed text-ink-700">{selected.descricao_servicos || '—'}</p>
            </div>

            {selected.itens?.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-surface-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-soft text-xs uppercase text-ink-500">
                    <tr><th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5">Qtd.</th><th className="px-3 py-2.5">Unitário</th><th className="px-3 py-2.5 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {selected.itens.map((item) => (
                      <tr key={item.id} className="border-t border-surface-line">
                        <td className="px-3 py-2.5"><span className="font-semibold text-navy-900">{item.descricao}</span><span className="ml-2 text-xs text-ink-400">{item.tipo === 'peca' ? 'Peça' : 'Serviço'}</span></td>
                        <td className="px-3 py-2.5">{item.quantidade}</td>
                        <td className="px-3 py-2.5">{formatCurrency(item.valor_unitario)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(item.quantidade * item.valor_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-navy-900 p-4 text-white">
              <span className="text-sm font-semibold">Total do orçamento</span>
              <span className="font-display text-2xl font-extrabold">{formatCurrency(selected.valor_total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
