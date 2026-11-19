import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import { formatCurrency, formatPlate } from '../../utils/formatters.js';

const emptyItem = () => ({ tipo: 'servico', descricao: '', quantidade: 1, valorUnitario: '', pecaId: '' });

export default function OrcamentoForm({ open, onClose, veiculos = [], pecas = [], onSubmit, loading = false }) {
  const [form, setForm] = useState({ veiculoId: '', descricaoServicos: '', itens: [emptyItem()] });

  useEffect(() => {
    if (!open) return;
    setForm({ veiculoId: veiculos[0]?.id || '', descricaoServicos: '', itens: [emptyItem()] });
  }, [open, veiculos]);

  function updateItem(index, key, value) {
    setForm((current) => ({
      ...current,
      itens: current.itens.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  }

  function changeTipo(index, tipo) {
    setForm((current) => ({
      ...current,
      itens: current.itens.map((item, i) => (i === index ? { ...emptyItem(), tipo } : item)),
    }));
  }

  const total = form.itens.reduce((sum, item) => sum + Number(item.quantidade || 0) * Number(item.valorUnitario || 0), 0);

  function submit(event) {
    event.preventDefault();
    onSubmit({
      veiculoId: Number(form.veiculoId),
      descricaoServicos: form.descricaoServicos,
      valorTotal: Number(total.toFixed(2)),
      itens: form.itens
        .filter((item) => item.descricao)
        .map((item) => ({
          tipo: item.tipo,
          descricao: item.descricao,
          quantidade: Number(item.quantidade || 1),
          valorUnitario: Number(item.valorUnitario || 0),
          ...(item.tipo === 'peca' && item.pecaId ? { pecaId: Number(item.pecaId) } : {}),
        })),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo orçamento" subtitle="Detalhe serviços e peças. O cliente aprova pelo painel dele." size="xl"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="orc-form" loading={loading}>Enviar orçamento</Button>
      </>}>
      <form id="orc-form" onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Veículo *" name="veiculoId" value={form.veiculoId} onChange={(e) => setForm((c) => ({ ...c, veiculoId: e.target.value }))} required>
            <option value="">Selecione...</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>{veiculo.marca} {veiculo.modelo} — {formatPlate(veiculo.placa)}</option>
            ))}
          </Select>
          <Input label="Valor total calculado" value={formatCurrency(total)} disabled className="font-bold" />
        </div>

        <Textarea label="Descrição geral dos serviços *" value={form.descricaoServicos} onChange={(e) => setForm((c) => ({ ...c, descricaoServicos: e.target.value }))} rows={3} placeholder="Ex.: Revisão completa com troca de óleo e filtros" required />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="section-title text-sm">Itens do orçamento</h4>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={() => setForm((c) => ({ ...c, itens: [...c.itens, emptyItem()] }))}>Adicionar item</Button>
          </div>

          {form.itens.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-surface-line bg-surface-soft/60 p-3 sm:grid-cols-[130px_1fr_80px_120px_36px]">
              <Select value={item.tipo} onChange={(e) => changeTipo(index, e.target.value)} aria-label="Tipo do item">
                <option value="servico">Serviço</option>
                <option value="peca">Peça</option>
              </Select>
              {item.tipo === 'peca' ? (
                <Select value={item.pecaId} onChange={(e) => {
                  const peca = pecas.find((p) => Number(p.id) === Number(e.target.value));
                  setForm((c) => ({ ...c, itens: c.itens.map((it, i) => (i === index ? { ...it, pecaId: e.target.value, descricao: peca?.nome || it.descricao, valorUnitario: peca ? String(peca.preco_unitario) : it.valorUnitario } : it)) }));
                }} aria-label="Peça">
                  <option value="">Selecione a peça...</option>
                  {pecas.map((peca) => <option key={peca.id} value={peca.id}>{peca.nome}</option>)}
                </Select>
              ) : (
                <Input value={item.descricao} onChange={(e) => updateItem(index, 'descricao', e.target.value)} placeholder="Descrição do serviço" aria-label="Descrição" />
              )}
              <Input type="number" min="1" value={item.quantidade} onChange={(e) => updateItem(index, 'quantidade', e.target.value)} aria-label="Quantidade" />
              <Input type="number" min="0" step="0.01" value={item.valorUnitario} onChange={(e) => updateItem(index, 'valorUnitario', e.target.value)} placeholder="R$ 0,00" aria-label="Valor unitário" />
              <button type="button" onClick={() => setForm((c) => ({ ...c, itens: c.itens.filter((_, i) => i !== index) }))} className="flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50" aria-label="Remover item">
                <Trash2 size={16} />
              </button>
              {item.tipo === 'peca' && (
                <Input value={item.descricao} onChange={(e) => updateItem(index, 'descricao', e.target.value)} placeholder="Descrição (opcional)" className="sm:col-span-5" aria-label="Descrição da peça" />
              )}
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
