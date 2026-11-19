import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import { formatCurrency, formatPlate } from '../../utils/formatters.js';

export default function OsForm({ open, onClose, veiculos = [], funcionarios = [], pecas = [], onSubmit, loading = false }) {
  const [form, setForm] = useState({ veiculoId: '', funcionarioId: '', quilometragem: '', problemaRelatado: '', diagnostico: '', valorTotal: '' });
  const [linhas, setLinhas] = useState([]);
  const [novaPeca, setNovaPeca] = useState({ pecaId: '', quantidade: 1 });

  useEffect(() => {
    if (!open) return;
    setForm({ veiculoId: veiculos[0]?.id || '', funcionarioId: '', quilometragem: '', problemaRelatado: '', diagnostico: '', valorTotal: '' });
    setLinhas([]);
    setNovaPeca({ pecaId: '', quantidade: 1 });
  }, [open, veiculos]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function addPeca() {
    const peca = pecas.find((item) => Number(item.id) === Number(novaPeca.pecaId));
    if (!peca) return;
    setLinhas((current) => [
      ...current,
      { pecaId: peca.id, nome: peca.nome, quantidade: Number(novaPeca.quantidade), precoUnitario: Number(peca.preco_unitario) },
    ]);
    setNovaPeca({ pecaId: '', quantidade: 1 });
  }

  const totalPecas = linhas.reduce((sum, item) => sum + item.quantidade * item.precoUnitario, 0);

  function submit(event) {
    event.preventDefault();
    onSubmit({
      veiculoId: Number(form.veiculoId),
      funcionarioId: form.funcionarioId ? Number(form.funcionarioId) : null,
      quilometragem: Number(form.quilometragem || 0),
      problemaRelatado: form.problemaRelatado,
      diagnostico: form.diagnostico,
      valorTotal: form.valorTotal ? Number(form.valorTotal) : Number(totalPecas.toFixed(2)),
      pecas: linhas.map(({ pecaId, quantidade, precoUnitario }) => ({ pecaId, quantidade, precoUnitario })),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Abrir ordem de serviço" subtitle="Registre a entrada do veículo e as peças previstas." size="xl"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="os-form" loading={loading}>Abrir OS</Button>
      </>}>
      <form id="os-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Veículo *" name="veiculoId" value={form.veiculoId} onChange={set('veiculoId')} required>
            <option value="">Selecione...</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>{veiculo.marca} {veiculo.modelo} — {formatPlate(veiculo.placa)}</option>
            ))}
          </Select>
          <Select label="Mecânico responsável" name="funcionarioId" value={form.funcionarioId} onChange={set('funcionarioId')}>
            <option value="">Não atribuir</option>
            {funcionarios.filter((f) => !/administrad/i.test(f.funcao)).map((funcionario) => (
              <option key={funcionario.id} value={funcionario.id}>{funcionario.nome} · {funcionario.funcao}</option>
            ))}
          </Select>
          <Input label="Quilometragem atual" name="quilometragem" type="number" min="0" value={form.quilometragem} onChange={set('quilometragem')} placeholder="Ex.: 48200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Problema relatado" name="problemaRelatado" value={form.problemaRelatado} onChange={set('problemaRelatado')} placeholder="O que o cliente relatou?" rows={3} />
          <Textarea label="Diagnóstico inicial" name="diagnostico" value={form.diagnostico} onChange={set('diagnostico')} placeholder="Diagnóstico técnico (opcional)" rows={3} />
        </div>

        <div className="rounded-xl border border-surface-line p-4">
          <h4 className="section-title mb-3 text-sm">Peças previstas</h4>
          <div className="flex flex-wrap items-end gap-2">
            <Select label="Peça" value={novaPeca.pecaId} onChange={(e) => setNovaPeca((c) => ({ ...c, pecaId: e.target.value }))} className="min-w-[220px] flex-1">
              <option value="">Selecione uma peça...</option>
              {pecas.map((peca) => <option key={peca.id} value={peca.id}>{peca.nome} · {formatCurrency(peca.preco_unitario)} · {peca.quantidade} und.</option>)}
            </Select>
            <Input label="Qtd." type="number" min="1" value={novaPeca.quantidade} onChange={(e) => setNovaPeca((c) => ({ ...c, quantidade: e.target.value }))} className="w-24" />
            <Button variant="outline" icon={Plus} onClick={addPeca}>Adicionar</Button>
          </div>

          {linhas.length > 0 && (
            <div className="mt-4 space-y-2">
              {linhas.map((linha, index) => (
                <div key={`${linha.pecaId}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-surface-soft px-3 py-2 text-sm">
                  <span className="font-medium text-ink-700">{linha.nome}</span>
                  <span className="text-ink-500">{linha.quantidade}x {formatCurrency(linha.precoUnitario)}</span>
                  <button type="button" onClick={() => setLinhas((current) => current.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700" aria-label="Remover peça">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <p className="pt-1 text-right text-sm font-bold text-navy-900">Total em peças: {formatCurrency(totalPecas)}</p>
            </div>
          )}
        </div>

        <Input label="Valor total da OS (opcional)" name="valorTotal" type="number" min="0" step="0.01" value={form.valorTotal} onChange={set('valorTotal')} hint="Se vazio, usa o total das peças adicionadas." />
      </form>
    </Modal>
  );
}
