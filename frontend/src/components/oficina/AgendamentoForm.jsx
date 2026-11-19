import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Textarea from '../ui/Textarea.jsx';
import Button from '../ui/Button.jsx';
import { formatPlate } from '../../utils/formatters.js';

export default function AgendamentoForm({ open, onClose, veiculos = [], onSubmit, loading = false, initial = null, allowStatus = false }) {
  const [form, setForm] = useState({ veiculoId: '', dataAgendamento: '', horario: '08:00', observacoes: '', status: 'pendente' });

  useEffect(() => {
    setForm(initial ? {
      veiculoId: initial.veiculo_id || '',
      dataAgendamento: String(initial.data_agendamento || '').slice(0, 10),
      horario: String(initial.horario || '08:00').slice(0, 5),
      observacoes: initial.observacoes || '',
      status: initial.status || 'pendente',
    } : { veiculoId: veiculos[0]?.id || '', dataAgendamento: '', horario: '08:00', observacoes: '', status: 'pendente' });
  }, [initial, open, veiculos]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      veiculoId: Number(form.veiculoId),
      dataAgendamento: form.dataAgendamento,
      horario: form.horario,
      observacoes: form.observacoes,
      ...(allowStatus ? { status: form.status } : {}),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Atualizar agendamento' : 'Solicitar agendamento'} size="md"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="agend-form" loading={loading}>{initial ? 'Salvar' : 'Solicitar'}</Button>
      </>}>
      <form id="agend-form" onSubmit={submit} className="space-y-4">
        <Select label="Veículo" name="veiculoId" value={form.veiculoId} onChange={set('veiculoId')} required disabled={Boolean(initial)}>
          <option value="">Selecione...</option>
          {veiculos.map((veiculo) => (
            <option key={veiculo.id} value={veiculo.id}>{veiculo.marca} {veiculo.modelo} — {formatPlate(veiculo.placa)}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data" name="dataAgendamento" type="date" value={form.dataAgendamento} onChange={set('dataAgendamento')} required />
          <Input label="Horário" name="horario" type="time" value={form.horario} onChange={set('horario')} required />
        </div>
        {allowStatus && (
          <Select label="Status" name="status" value={form.status} onChange={set('status')}>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        )}
        <Textarea label="Observações" name="observacoes" value={form.observacoes} onChange={set('observacoes')} rows={3} placeholder="Descreva o problema ou detalhes do atendimento" />
      </form>
    </Modal>
  );
}
