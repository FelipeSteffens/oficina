import { useState } from 'react';
import { CalendarDays, Clock, MapPin, Plus } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import AgendamentoForm from '../../../components/oficina/AgendamentoForm.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { agendamentoService } from '../../../services/agendamentoService.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { AGENDAMENTO_STATUS } from '../../../utils/constants.js';
import { formatDate, formatDay, formatPlate, formatTime } from '../../../utils/formatters.js';

export default function AgendamentosPage() {
  const { data, loading, refetch } = useFetch(() => agendamentoService.list());
  const { data: veiculos } = useFetch(() => veiculoService.list());
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const toast = useToast();

  async function create(payload) {
    setSaving(true);
    try {
      await agendamentoService.create(payload);
      toast.success('Agendamento solicitado! A oficina confirmará em breve.');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    try {
      await agendamentoService.remove(cancelando.id);
      toast.success('Agendamento cancelado.');
      setCancelando(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Área do cliente" title="Agendamentos" subtitle="Solicite atendimentos e acompanhe a agenda com as oficinas autorizadas."
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)} disabled={!veiculos?.length}>Novo agendamento</Button>} />

      {loading ? <Spinner fullPage label="Carregando agendamentos..." /> : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => (
            <Card key={item.id} className="relative overflow-hidden">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-brand-50 opacity-60" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-navy-900 text-white">
                      <span className="font-display text-base font-extrabold leading-none">{formatDay(item.data_agendamento)}</span>
                      <span className="mt-0.5 text-[9px] uppercase text-white/60">{formatDate(item.data_agendamento).split('/')[1]}</span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-navy-900">{formatPlate(item.placa)}</p>
                      <p className="text-xs text-ink-500">{item.marca} {item.modelo}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} map={AGENDAMENTO_STATUS} />
                </div>

                <div className="mt-5 space-y-2.5 text-sm text-ink-700">
                  <p className="flex items-center gap-2"><Clock size={16} className="text-brand-600" /> {formatTime(item.horario)} · {formatDate(item.data_agendamento)}</p>
                  {item.oficina_nome && <p className="flex items-center gap-2"><MapPin size={16} className="text-brand-600" /> {item.oficina_nome}</p>}
                  {item.observacoes && <p className="rounded-xl bg-surface-soft p-3 text-xs leading-relaxed text-ink-500">{item.observacoes}</p>}
                </div>

                {item.status === 'pendente' && (
                  <div className="mt-4 border-t border-surface-line pt-3">
                    <Button variant="ghost" size="sm" onClick={() => setCancelando(item)}>Cancelar agendamento</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarDays} title="Nenhum agendamento" description="Solicite um horário para levar seu veículo à oficina."
          action={<Button icon={Plus} onClick={() => setFormOpen(true)} disabled={!veiculos?.length}>Solicitar atendimento</Button>} />
      )}

      <AgendamentoForm open={formOpen} onClose={() => setFormOpen(false)} veiculos={veiculos || []} onSubmit={create} loading={saving} />
      <ConfirmDialog open={Boolean(cancelando)} onClose={() => setCancelando(null)} onConfirm={cancel}
        title="Cancelar agendamento" message={`Deseja cancelar o atendimento de ${formatPlate(cancelando?.placa)} em ${formatDate(cancelando?.data_agendamento)}?`}
        confirmLabel="Cancelar agendamento" />
    </div>
  );
}
