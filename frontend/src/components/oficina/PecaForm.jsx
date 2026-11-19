import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

const EMPTY = { nome: '', codigo: '', quantidade: 0, precoUnitario: '', estoqueMinimo: 0 };

export default function PecaForm({ open, onClose, initial, onSubmit, loading = false }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? {
      nome: initial.nome || '', codigo: initial.codigo || '', quantidade: initial.quantidade ?? 0,
      precoUnitario: initial.preco_unitario ?? '', estoqueMinimo: initial.estoque_minimo ?? 0,
    } : EMPTY);
  }, [initial, open]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      nome: form.nome,
      codigo: form.codigo,
      quantidade: Number(form.quantidade),
      precoUnitario: Number(form.precoUnitario || 0),
      estoqueMinimo: Number(form.estoqueMinimo || 0),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar peça' : 'Nova peça'} subtitle="Controle de estoque por oficina." size="md"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="peca-form" loading={loading}>{initial ? 'Salvar' : 'Cadastrar'}</Button>
      </>}>
      <form id="peca-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome da peça" name="nome" value={form.nome} onChange={set('nome')} className="sm:col-span-2" required placeholder="Ex.: Óleo motor 5W30" />
        <Input label="Código / SKU" name="codigo" value={form.codigo} onChange={set('codigo')} required placeholder="Ex.: OLEO-5W30" />
        <Input label="Preço unitário (R$)" name="precoUnitario" type="number" min="0" step="0.01" value={form.precoUnitario} onChange={set('precoUnitario')} required />
        <Input label="Quantidade" name="quantidade" type="number" min="0" value={form.quantidade} onChange={set('quantidade')} />
        <Input label="Estoque mínimo" name="estoqueMinimo" type="number" min="0" value={form.estoqueMinimo} onChange={set('estoqueMinimo')} hint="Alerta quando chegar a este nível." />
      </form>
    </Modal>
  );
}
