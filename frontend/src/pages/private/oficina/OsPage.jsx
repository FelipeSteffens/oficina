import { useState } from 'react';
import { Ban, CheckCircle2, FileDown, Pencil, Plus, Wrench } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import Tabs from '../../../components/ui/Tabs.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import SearchInput from '../../../components/ui/SearchInput.jsx';
import OsForm from '../../../components/oficina/OsForm.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { osService } from '../../../services/osService.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { funcionarioService } from '../../../services/funcionarioService.js';
import { estoqueService } from '../../../services/estoqueService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { OS_STATUS } from '../../../utils/constants.js';
import { formatCurrency, formatDate, formatDateTime, formatPlate } from '../../../utils/formatters.js';
import { downloadOsPdf } from '../../../utils/pdfGenerator.js';

const EMPTY_FINALIZAR = { quilometragem: '', diagnostico: '', servicosRealizados: '', valorTotal: '' };

export default function OsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [finalizando, setFinalizando] = useState(null);
  const [finalForm, setFinalForm] = useState(EMPTY_FINALIZAR);
  const [cancelando, setCancelando] = useState(null);
  const [pecaOpen, setPecaOpen] = useState(false);
  const [pecaForm, setPecaForm] = useState({ pecaId: '', quantidade: 1 });
  const [busy, setBusy] = useState(false);

  const { data, loading, refetch } = useFetch(() => osService.list({ search }), [search]);
  const { data: veiculos } = useFetch(() => veiculoService.listByOficina());
  const { data: funcionarios } = useFetch(() => funcionarioService.list());
  const { data: pecas } = useFetch(() => estoqueService.list());
  const toast = useToast();

  const all = data || [];
  const filtered = tab === 'todas' ? all : all.filter((item) => item.status === tab);
  const counts = {
    todas: all.length,
    em_andamento: all.filter((item) => item.status === 'em_andamento').length,
    aguardando_pecas: all.filter((item) => item.status === 'aguardando_pecas').length,
    concluida: all.filter((item) => item.status === 'concluida').length,
  };

  async function openDetail(row) {
    try {
      setSelected(await osService.get(row.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function create(payload) {
    setSaving(true);
    try {
      await osService.create(payload);
      toast.success('Ordem de serviço aberta com sucesso!');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(payload) {
    setSaving(true);
    try {
      await osService.update(selected.id, payload);
      toast.success('Ordem de serviço atualizada!');
      setSelected(await osService.get(selected.id));
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function openFinalizar(os) {
    setFinalForm({
      quilometragem: os.quilometragem ?? '',
      diagnostico: os.diagnostico || '',
      servicosRealizados: os.servicos_realizados || '',
      valorTotal: os.valor_total ?? '',
    });
    setFinalizando(os);
  }

  async function confirmFinalizar() {
    setBusy(true);
    try {
      const result = await osService.finalizar(finalizando.id, {
        quilometragem: Number(finalForm.quilometragem || 0),
        diagnostico: finalForm.diagnostico,
        servicosRealizados: finalForm.servicosRealizados,
        valorTotal: Number(finalForm.valorTotal || 0),
      });
      toast.success(result?.message || 'OS concluída e histórico registrado!');
      setFinalizando(null);
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancel() {
    setBusy(true);
    try {
      await osService.cancel(cancelando.id);
      toast.success('Ordem de serviço cancelada.');
      setCancelando(null);
      setSelected(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function addPeca() {
    setBusy(true);
    try {
      const result = await osService.addPeca(selected.id, {
        pecaId: Number(pecaForm.pecaId),
        quantidade: Number(pecaForm.quantidade),
      });
      setSelected({ ...selected, ...result, pecas: result.pecas || selected.pecas });
      setPecaOpen(false);
      setPecaForm({ pecaId: '', quantidade: 1 });
      toast.success('Peça adicionada. A baixa ocorrerá ao concluir a OS.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const [editOpen, setEditOpen] = useState(false);

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Ordens de serviço" subtitle="Acompanhe, edite e conclua os atendimentos da oficina."
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)}>Abrir OS</Button>} />

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <Tabs active={tab} onChange={setTab} tabs={[
            { id: 'todas', label: 'Todas', count: counts.todas },
            { id: 'em_andamento', label: 'Em andamento', count: counts.em_andamento },
            { id: 'aguardando_pecas', label: 'Aguardando peças', count: counts.aguardando_pecas },
            { id: 'concluida', label: 'Concluídas', count: counts.concluida },
          ]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por placa, cliente ou OS..." className="w-full sm:w-72" />
        </div>
        <div className="px-5 pb-5">
          <Table loading={loading} data={filtered} onRowClick={openDetail}
            emptyTitle="Nenhuma ordem de serviço" emptyDescription="Abra uma nova OS para começar."
            columns={[
              { key: 'id', label: 'OS', render: (row) => <span className="font-bold text-navy-900">#{row.id}</span> },
              { key: 'veiculo', label: 'Veículo', render: (row) => (
                <div><p className="font-semibold text-navy-900">{formatPlate(row.placa)}</p><p className="text-xs text-ink-500">{row.marca} {row.modelo}</p></div>
              ) },
              { key: 'cliente', label: 'Cliente', render: (row) => row.cliente_nome || '—' },
              { key: 'mecanico', label: 'Mecânico', render: (row) => row.mecanico_nome || <Badge tone="neutral">Não atribuído</Badge> },
              { key: 'entrada', label: 'Entrada', render: (row) => formatDate(row.data_entrada) },
              { key: 'valor', label: 'Valor', render: (row) => <span className="font-bold text-navy-900">{formatCurrency(row.valor_total)}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} map={OS_STATUS} /> },
            ]}
          />
        </div>
      </Card>

      <OsForm open={formOpen} onClose={() => setFormOpen(false)} veiculos={veiculos || []} funcionarios={funcionarios || []}
        pecas={pecas || []} onSubmit={create} loading={saving} />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={`Ordem de Serviço #${selected?.id || ''}`}
        subtitle={selected ? `${formatPlate(selected.placa)} · ${selected.marca} ${selected.modelo}` : ''} size="xl"
        footer={selected ? (
          <>
            <Button variant="outline" icon={FileDown} onClick={() => downloadOsPdf(selected)}>Baixar PDF</Button>
            {!['concluida', 'cancelada'].includes(selected.status) && (
              <>
                <Button variant="ghost" icon={Ban} onClick={() => setCancelando(selected)}>Cancelar OS</Button>
                <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>Editar</Button>
                <Button icon={CheckCircle2} onClick={() => openFinalizar(selected)}>Concluir OS</Button>
              </>
            )}
            {['concluida', 'cancelada'].includes(selected.status) && <Button variant="ghost" onClick={() => setSelected(null)}>Fechar</Button>}
          </>
        ) : null}>
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-4">
              <div className="rounded-xl bg-white p-2.5 text-brand-600"><Wrench size={20} /></div>
              <div className="flex-1">
                <p className="font-display font-bold text-navy-900">{selected.cliente_nome}</p>
                <p className="text-xs text-ink-500">{formatDateTime(selected.data_entrada)} · {selected.oficina_nome}</p>
              </div>
              <StatusBadge status={selected.status} map={OS_STATUS} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Mecânico', selected.mecanico_nome || 'Não atribuído'],
                ['Quilometragem', `${selected.quilometragem ?? 0} km`],
                ['Valor total', formatCurrency(selected.valor_total)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-surface-line p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
                  <p className="mt-1 text-sm font-bold text-navy-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="field-label">Problema relatado</p><p className="rounded-xl bg-surface-soft p-3.5 text-sm text-ink-700">{selected.problema_relatado || '—'}</p></div>
              <div><p className="field-label">Diagnóstico</p><p className="rounded-xl bg-surface-soft p-3.5 text-sm text-ink-700">{selected.diagnostico || '—'}</p></div>
            </div>
            {selected.servicos_realizados && (
              <div><p className="field-label">Serviços realizados</p><p className="rounded-xl bg-surface-soft p-3.5 text-sm text-ink-700">{selected.servicos_realizados}</p></div>
            )}

            <div className="overflow-hidden rounded-xl border border-surface-line">
              <div className="flex items-center justify-between bg-surface-soft px-4 py-2.5">
                <p className="text-sm font-bold text-navy-900">Peças utilizadas</p>
                {!['concluida', 'cancelada'].includes(selected.status) && (
                  <Button size="sm" variant="ghost" icon={Plus} onClick={() => setPecaOpen(true)}>Adicionar peça</Button>
                )}
              </div>
              {selected.pecas?.length ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-xs uppercase text-ink-500"><tr>
                    <th className="px-4 py-2">Peça</th><th className="px-4 py-2">Qtd.</th><th className="px-4 py-2">Unitário</th><th className="px-4 py-2 text-right">Subtotal</th>
                  </tr></thead>
                  <tbody>
                    {selected.pecas.map((peca) => (
                      <tr key={peca.id} className="border-t border-surface-line">
                        <td className="px-4 py-2.5"><span className="font-semibold text-navy-900">{peca.peca_nome}</span><span className="ml-2 text-xs text-ink-400">{peca.peca_codigo}</span></td>
                        <td className="px-4 py-2.5">{peca.quantidade}</td>
                        <td className="px-4 py-2.5">{formatCurrency(peca.preco_unitario)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(peca.quantidade * peca.preco_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="p-4 text-sm text-ink-500">Nenhuma peça adicionada a esta OS.</p>}
            </div>

            {selected.concluida_em && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} /> Concluída em {formatDateTime(selected.concluida_em)} — histórico do veículo atualizado.
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={pecaOpen} onClose={() => setPecaOpen(false)} title="Adicionar peça à OS" size="sm"
        footer={<><Button variant="ghost" onClick={() => setPecaOpen(false)}>Cancelar</Button><Button onClick={addPeca} loading={busy} disabled={!pecaForm.pecaId}>Adicionar</Button></>}>
        <div className="space-y-4">
          <Select label="Peça do estoque" value={pecaForm.pecaId} onChange={(e) => setPecaForm((c) => ({ ...c, pecaId: e.target.value }))}>
            <option value="">Selecione...</option>
            {(pecas || []).map((peca) => <option key={peca.id} value={peca.id}>{peca.nome} · {formatCurrency(peca.preco_unitario)} · {peca.quantidade} und.</option>)}
          </Select>
          <Input label="Quantidade" type="number" min="1" value={pecaForm.quantidade} onChange={(e) => setPecaForm((c) => ({ ...c, quantidade: e.target.value }))} />
          <p className="text-xs text-ink-500">A baixa de estoque será realizada automaticamente ao concluir a OS.</p>
        </div>
      </Modal>

      <Modal open={Boolean(finalizando)} onClose={() => setFinalizando(null)} title="Concluir ordem de serviço"
        subtitle="Esta ação grava o histórico do veículo e baixa as peças do estoque em uma única transação." size="lg"
        footer={<><Button variant="ghost" onClick={() => setFinalizando(null)}>Cancelar</Button><Button icon={CheckCircle2} onClick={confirmFinalizar} loading={busy}>Concluir e gravar histórico</Button></>}>
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800">
            <strong>Atenção:</strong> após a conclusão, a OS e o histórico gerado não poderão ser alterados.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Quilometragem final" type="number" min="0" value={finalForm.quilometragem} onChange={(e) => setFinalForm((c) => ({ ...c, quilometragem: e.target.value }))} />
            <Input label="Valor total (R$)" type="number" min="0" step="0.01" value={finalForm.valorTotal} onChange={(e) => setFinalForm((c) => ({ ...c, valorTotal: e.target.value }))} />
          </div>
          <Textarea label="Diagnóstico final" rows={3} value={finalForm.diagnostico} onChange={(e) => setFinalForm((c) => ({ ...c, diagnostico: e.target.value }))} />
          <Textarea label="Serviços realizados" rows={3} value={finalForm.servicosRealizados} onChange={(e) => setFinalForm((c) => ({ ...c, servicosRealizados: e.target.value }))} />
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(cancelando)} onClose={() => setCancelando(null)} onConfirm={confirmCancel} loading={busy}
        title="Cancelar ordem de serviço" message={`Deseja cancelar a OS #${cancelando?.id}? Nenhuma peça será baixada do estoque.`} confirmLabel="Cancelar OS" />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar ordem de serviço" size="lg"
        footer={<Button variant="ghost" onClick={() => setEditOpen(false)}>Fechar</Button>}>
        {selected && (
          <OsEditForm os={selected} funcionarios={funcionarios || []} onSubmit={saveEdit} loading={saving} onDone={() => setEditOpen(false)} />
        )}
      </Modal>
    </div>
  );
}

function OsEditForm({ os, funcionarios, onSubmit, loading, onDone }) {
  const [form, setForm] = useState({
    funcionarioId: os.funcionario_id || '',
    quilometragem: os.quilometragem ?? '',
    problemaRelatado: os.problema_relatado || '',
    diagnostico: os.diagnostico || '',
    servicosRealizados: os.servicos_realizados || '',
    valorTotal: os.valor_total ?? '',
    status: os.status || 'em_andamento',
  });
  const set = (key) => (event) => setForm((c) => ({ ...c, [key]: event.target.value }));

  return (
    <form id="os-edit-form" onSubmit={(event) => {
      event.preventDefault();
      onSubmit({
        funcionarioId: form.funcionarioId ? Number(form.funcionarioId) : null,
        quilometragem: Number(form.quilometragem || 0),
        problemaRelatado: form.problemaRelatado,
        diagnostico: form.diagnostico,
        servicosRealizados: form.servicosRealizados,
        valorTotal: Number(form.valorTotal || 0),
        status: form.status,
      });
      onDone();
    }} className="grid gap-4 sm:grid-cols-2">
      <Select label="Mecânico" value={form.funcionarioId} onChange={set('funcionarioId')}>
        <option value="">Não atribuído</option>
        {funcionarios.filter((f) => !/administrad/i.test(f.funcao)).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
      </Select>
      <Input label="Quilometragem" type="number" min="0" value={form.quilometragem} onChange={set('quilometragem')} />
      <Textarea label="Problema relatado" value={form.problemaRelatado} onChange={set('problemaRelatado')} rows={2} className="sm:col-span-2" />
      <Textarea label="Diagnóstico" value={form.diagnostico} onChange={set('diagnostico')} rows={2} className="sm:col-span-2" />
      <Textarea label="Serviços realizados" value={form.servicosRealizados} onChange={set('servicosRealizados')} rows={2} className="sm:col-span-2" />
      <Input label="Valor total (R$)" type="number" min="0" step="0.01" value={form.valorTotal} onChange={set('valorTotal')} />
      <Select label="Status" value={form.status} onChange={set('status')}>
        <option value="em_andamento">Em andamento</option>
        <option value="aguardando_pecas">Aguardando peças</option>
        <option value="aguardando_aprovacao">Aguardando aprovação</option>
      </Select>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" loading={loading}>Salvar alterações</Button>
      </div>
    </form>
  );
}
