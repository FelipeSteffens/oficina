import { useState } from 'react';
import { CheckCircle2, FileDown, Plus, Send, Wrench } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Select from '../../../components/ui/Select.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import Tabs from '../../../components/ui/Tabs.jsx';
import OrcamentoForm from '../../../components/oficina/OrcamentoForm.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { orcamentoService } from '../../../services/orcamentoService.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { estoqueService } from '../../../services/estoqueService.js';
import { funcionarioService } from '../../../services/funcionarioService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { ORCAMENTO_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatPlate } from '../../../utils/formatters.js';
import { downloadOrcamentoPdf } from '../../../utils/pdfGenerator.js';

export default function OrcamentosOficinaPage() {
  const [tab, setTab] = useState('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [funcionarioId, setFuncionarioId] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, refetch } = useFetch(() => orcamentoService.list());
  const { data: veiculos } = useFetch(() => veiculoService.listByOficina());
  const { data: pecas } = useFetch(() => estoqueService.list());
  const { data: funcionarios } = useFetch(() => funcionarioService.list());
  const toast = useToast();

  const all = data || [];
  const filtered = tab === 'todos' ? all : all.filter((item) => item.status === tab);
  const counts = {
    todos: all.length,
    pendente: all.filter((item) => item.status === 'pendente').length,
    aprovado: all.filter((item) => item.status === 'aprovado').length,
    recusado: all.filter((item) => item.status === 'recusado').length,
  };

  async function openDetail(row) {
    try {
      setSelected(await orcamentoService.get(row.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function create(payload) {
    setSaving(true);
    try {
      await orcamentoService.create(payload);
      toast.success('Orçamento enviado ao cliente para aprovação!');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function convert() {
    setBusy(true);
    try {
      await orcamentoService.converter(selected.id, {
        funcionarioId: funcionarioId ? Number(funcionarioId) : null,
        quilometragem: Number(quilometragem || 0),
      });
      toast.success('Ordem de serviço gerada a partir do orçamento!');
      setConvertOpen(false);
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Orçamentos" subtitle="Envie propostas e transforme aprovações em ordens de serviço."
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)}>Novo orçamento</Button>} />

      <Card padded={false}>
        <div className="p-5 pb-4">
          <Tabs active={tab} onChange={setTab} tabs={[
            { id: 'todos', label: 'Todos', count: counts.todos },
            { id: 'pendente', label: 'Pendentes', count: counts.pendente },
            { id: 'aprovado', label: 'Aprovados', count: counts.aprovado },
            { id: 'recusado', label: 'Recusados', count: counts.recusado },
          ]} />
        </div>
        <div className="px-5 pb-5">
          <Table loading={loading} data={filtered} onRowClick={openDetail}
            emptyTitle="Nenhum orçamento" emptyDescription="Crie um orçamento para um veículo autorizado."
            columns={[
              { key: 'id', label: '#', render: (row) => <span className="font-bold text-navy-900">#{row.id}</span> },
              { key: 'veiculo', label: 'Veículo', render: (row) => (
                <div><p className="font-semibold text-navy-900">{formatPlate(row.placa)}</p><p className="text-xs text-ink-500">{row.marca} {row.modelo}</p></div>
              ) },
              { key: 'cliente', label: 'Cliente', render: (row) => row.cliente_nome || '—' },
              { key: 'valor', label: 'Valor', render: (row) => <span className="font-bold text-navy-900">{formatCurrency(row.valor_total)}</span> },
              { key: 'data', label: 'Criado em', render: (row) => formatDate(row.criado_em) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} map={ORCAMENTO_STATUS} /> },
            ]}
          />
        </div>
      </Card>

      <OrcamentoForm open={formOpen} onClose={() => setFormOpen(false)} veiculos={veiculos || []} pecas={pecas || []}
        onSubmit={create} loading={saving} />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Orçamento #${selected?.id || ''}`}
        subtitle={selected ? `${formatPlate(selected.placa)} · ${selected.cliente_nome}` : ''} size="lg"
        footer={selected ? (
          <>
            <Button variant="outline" icon={FileDown} onClick={() => downloadOrcamentoPdf(selected)}>Baixar PDF</Button>
            {selected.status === 'aprovado' ? (
              <Button icon={Wrench} onClick={() => { setFuncionarioId(''); setQuilometragem(''); setConvertOpen(true); }}>Gerar OS</Button>
            ) : (
              <Button variant="ghost" onClick={() => setSelected(null)}>Fechar</Button>
            )}
          </>
        ) : null}>
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-4">
              <div className="rounded-xl bg-white p-2.5 text-brand-600"><Send size={20} /></div>
              <div className="flex-1">
                <p className="font-display font-bold text-navy-900">{selected.marca} {selected.modelo} · {formatPlate(selected.placa)}</p>
                <p className="text-xs text-ink-500">Enviado em {formatDate(selected.criado_em)}</p>
              </div>
              <StatusBadge status={selected.status} map={ORCAMENTO_STATUS} />
            </div>

            <div><p className="field-label">Descrição dos serviços</p><p className="rounded-xl bg-surface-soft p-4 text-sm text-ink-700">{selected.descricao_servicos || '—'}</p></div>

            {selected.itens?.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-surface-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-soft text-xs uppercase text-ink-500"><tr>
                    <th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5">Qtd.</th><th className="px-3 py-2.5">Unitário</th><th className="px-3 py-2.5 text-right">Subtotal</th>
                  </tr></thead>
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

      <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="Gerar ordem de serviço"
        subtitle="O orçamento aprovado será convertido em OS com as peças selecionadas." size="md"
        footer={<><Button variant="ghost" onClick={() => setConvertOpen(false)}>Cancelar</Button><Button icon={CheckCircle2} onClick={convert} loading={busy}>Gerar OS</Button></>}>
        <div className="space-y-4">
          <Select label="Mecânico responsável" value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)}>
            <option value="">Não atribuir</option>
            {(funcionarios || []).filter((f) => !/administrad/i.test(f.funcao)).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </Select>
          <Select label="Quilometragem atual" value={quilometragem} onChange={(e) => setQuilometragem(e.target.value)}>
            <option value="0">Não informar (0 km)</option>
            {(veiculos || []).filter((v) => Number(v.id) === Number(selected?.veiculo_id)).map((v) => (
              <option key={v.id} value={v.quilometragem}>{v.quilometragem} km (atual do veículo)</option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
