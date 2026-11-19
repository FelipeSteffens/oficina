import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';
import { COMBUSTIVEIS } from '../../utils/constants.js';

const EMPTY = { marca: '', modelo: '', ano: '', placa: '', cor: '', quilometragem: 0, combustivel: 'Flex', chassi: '' };

export default function VeiculoForm({ open, onClose, initial, onSubmit, loading = false }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? {
      marca: initial.marca || '', modelo: initial.modelo || '', ano: initial.ano || '',
      placa: initial.placa || '', cor: initial.cor || '', quilometragem: initial.quilometragem ?? 0,
      combustivel: initial.combustivel || 'Flex', chassi: initial.chassi || '',
    } : EMPTY);
  }, [initial, open]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      ano: Number(form.ano),
      quilometragem: Number(form.quilometragem),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Editar veículo' : 'Novo veículo'}
      subtitle={initial ? 'Atualize os dados cadastrais do veículo.' : 'Adicione um veículo à sua garagem digital.'}
      size="lg"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="veiculo-form" loading={loading}>{initial ? 'Salvar alterações' : 'Cadastrar veículo'}</Button>
      </>}
    >
      <form id="veiculo-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Marca" name="marca" value={form.marca} onChange={set('marca')} placeholder="Ex.: Toyota" required />
        <Input label="Modelo" name="modelo" value={form.modelo} onChange={set('modelo')} placeholder="Ex.: Corolla XEi" required />
        <Input label="Ano" name="ano" type="number" min="1950" max="2100" value={form.ano} onChange={set('ano')} required />
        <Input label="Placa" name="placa" value={form.placa} onChange={set('placa')} placeholder="ABC1D23" maxLength={8} required hint="Formato Mercosul ou antigo" />
        <Input label="Cor" name="cor" value={form.cor} onChange={set('cor')} placeholder="Ex.: Prata" />
        <Input label="Quilometragem" name="quilometragem" type="number" min="0" value={form.quilometragem} onChange={set('quilometragem')} />
        <Select label="Combustível" name="combustivel" value={form.combustivel} onChange={set('combustivel')}>
          {COMBUSTIVEIS.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <Input label="Chassi (opcional)" name="chassi" value={form.chassi} onChange={set('chassi')} placeholder="17 caracteres" />
      </form>
    </Modal>
  );
}
