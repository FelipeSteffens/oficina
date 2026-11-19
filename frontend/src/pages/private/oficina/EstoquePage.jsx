import { useState } from 'react';
import { AlertTriangle, ArrowDownToLine, FileDown, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import SearchInput from '../../../components/ui/SearchInput.jsx';
import PecaForm from '../../../components/oficina/PecaForm.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { estoqueService } from '../../../services/estoqueService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { formatCurrency, formatDateTime } from '../../../utils/formatters.js';
import { downloadEstoquePdf } from '../../../utils/pdfGenerator.js';

export default function EstoquePage() {
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [entrada, setEntrada] = useState(null);
  const [entradaForm, setEntradaForm] = useState({ quantidade: 1, precoUnitario: '' });
  const [movOpen, setMovOpen] = useState(false);

  const { data, loading, refetch } = useFetch(() => estoqueService.list({ search, lowOnly }), [search, lowOnly]);
  const { data: movimentacoes, loading: loadingMov, refetch: refetchMov } = useFetch(() => estoqueService.movimentacoes(50));
  const toast = useToast();

  const pecas = data || [];
  const baixo = pecas.filter((item) => Number(item.estoque_baixo) === 1).length;

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(peca) { setEditing(peca); setFormOpen(true); }

  async function save(payload) {
    setSaving(true);
    try {
      if (editing) await estoqueService.update(editing.id, payload);
      else await estoqueService.create(payload);
      toast.success(editing ? 'Peça atualizada!' : 'Peça cadastrada no estoque!');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await estoqueService.remove(deleting.id);
      toast.success('Peça removida do estoque.');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  function openEntrada(peca) {
    setEntrada(peca);
    setEntradaForm({ quantidade: 1 });
  }

  async function confirmEntrada() {
    try {
      await estoqueService.entrada(entrada.id, {
        quantidade: Number(entradaForm.quantidade),
        motivo: 'Entrada manual de estoque',
      });
      toast.success('Entrada registrada no estoque!');
      setEntrada(null);
      refetch();
      refetchMov();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Controle de estoque" subtitle="Peças, movimentações e alertas de reposição."
        actions={
          <>
            <Button variant="outline" icon={FileDown} onClick={() => downloadEstoquePdf(pecas)}>Exportar PDF</Button>
            <Button variant="outline" icon={Package} onClick={() => setMovOpen(true)}>Movimentações</Button>
            <Button icon={Plus} onClick={openCreate}>Nova peça</Button>
          </>
        } />

      {baixo > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-600" />
          <p><strong>{baixo} {baixo === 1 ? 'peça está' : 'peças estão'} com estoque baixo.</strong> Considere repor antes de abrir novas ordens de serviço.</p>
        </div>
      )}

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={lowOnly ? 'primary' : 'outline'} onClick={() => setLowOnly((v) => !v)}>Só estoque baixo</Button>
            <span className="text-sm text-ink-500">{pecas.length} peça(s)</span>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar peça ou código..." className="w-full sm:w-72" />
        </div>
        <div className="px-5 pb-5">
          <Table loading={loading} data={pecas} emptyTitle="Estoque vazio" emptyDescription="Cadastre as peças utilizadas pela oficina."
            columns={[
              { key: 'codigo', label: 'Código', render: (row) => <span className="font-mono text-xs font-bold text-ink-700">{row.codigo}</span> },
              { key: 'nome', label: 'Peça', render: (row) => <span className="font-semibold text-navy-900">{row.nome}</span> },
              { key: 'quantidade', label: 'Qtd.', render: (row) => (
                <div className="flex items-center gap-2"><span className={`font-bold ${row.estoque_baixo ? 'text-red-600' : 'text-navy-900'}`}>{row.quantidade}</span>
                  {row.estoque_baixo ? <Badge tone="danger">Baixo</Badge> : <Badge tone="success">Normal</Badge>}</div>
              ) },
              { key: 'minimo', label: 'Mínimo', render: (row) => row.estoque_minimo },
              { key: 'preco', label: 'Preço unit.', render: (row) => formatCurrency(row.preco_unitario) },
              { key: 'total', label: 'Valor em estoque', render: (row) => <span className="font-bold text-navy-900">{formatCurrency(row.quantidade * row.preco_unitario)}</span> },
              { key: 'acoes', label: '', render: (row) => (
                <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => openEntrada(row)} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50" title="Registrar entrada"><ArrowDownToLine size={16} /></button>
                  <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100" title="Editar"><Pencil size={16} /></button>
                  <button type="button" onClick={() => setDeleting(row)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Remover"><Trash2 size={16} /></button>
                </div>
              ) },
            ]}
          />
        </div>
      </Card>

      <PecaForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSubmit={save} loading={saving} />

      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={remove}
        title="Remover peça" message={`Deseja remover "${deleting?.nome}" do estoque? Histórico de movimentações será mantido.`} confirmLabel="Remover" />

      <Modal open={Boolean(entrada)} onClose={() => setEntrada(null)} title="Registrar entrada de estoque"
        subtitle={`Peça: ${entrada?.nome || ''}`} size="sm"
        footer={<><Button variant="ghost" onClick={() => setEntrada(null)}>Cancelar</Button><Button icon={ArrowDownToLine} onClick={confirmEntrada}>Registrar entrada</Button></>}>
        <div className="space-y-4">
          <Input label="Quantidade a adicionar" type="number" min="1" value={entradaForm.quantidade} onChange={(e) => setEntradaForm((c) => ({ ...c, quantidade: e.target.value }))} />
          <p className="text-xs text-ink-500">A entrada será registrada na movimentação de estoque desta peça.</p>
        </div>
      </Modal>

      <Modal open={movOpen} onClose={() => setMovOpen(false)} title="Movimentações de estoque" subtitle="Últimas 50 movimentações registradas" size="lg"
        footer={<Button variant="ghost" onClick={() => setMovOpen(false)}>Fechar</Button>}>
        {loadingMov ? <p className="text-sm text-ink-500">Carregando...</p> : movimentacoes?.length ? (
          <div className="space-y-2">
            {movimentacoes.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-line p-3 text-sm">
                <Badge tone={item.tipo === 'entrada' ? 'success' : 'danger'}>{item.tipo === 'entrada' ? 'Entrada' : 'Saída'}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900">{item.peca_nome || 'Peça removida'}</p>
                  <p className="text-xs text-ink-500">{item.motivo}{item.os_numero ? ` · OS #${item.os_numero}` : ''}</p>
                </div>
                <span className="font-bold text-navy-900">{item.quantidade}x</span>
                <span className="text-xs text-ink-400">{formatDateTime(item.data_hora)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-ink-500">Nenhuma movimentação registrada.</p>}
      </Modal>
    </div>
  );
}
