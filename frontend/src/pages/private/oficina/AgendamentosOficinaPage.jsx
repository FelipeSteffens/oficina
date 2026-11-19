import { useState } from 'react';
import { CalendarDays, Check, Clock, MessageCircle, UserRound, X } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import StatusBadge from '../../../components/ui/StatusBadge.jsx';
import Tabs from '../../../components/ui/Tabs.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { agendamentoService } from '../../../services/agendamentoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { AGENDAMENTO_STATUS } from '../../../utils/constants.js';
import { formatDate, formatDay, formatPlate, formatTime } from '../../../utils/formatters.js';

export default function AgendamentosOficinaPage() {
  const [tab, setTab] = useState('todos');
  const [busy, setBusy] = useState(null);
  const { data, loading, refetch } = useFetch(() => agendamentoService.list());
  const toast = useToast();

  const all = data || [];
  const filtered = tab === 'todos' ? all : all.filter((item) => item.status === tab);
  const counts = {
    todos: all.length,
    pendente: all.filter((item) => item.status === 'pendente').length,
    confirmado: all.filter((item) => item.status === 'confirmado').length,
    concluido: all.filter((item) => item.status === 'concluido').length,
  };

  async function setStatus(item, status) {
    setBusy(`${status}-${item.id}`);
    try {
      await agendamentoService.update(item.id, { status });
      toast.success(status === 'confirmado' ? 'Agendamento confirmado!' : status === 'concluido' ? 'Agendamento concluído.' : 'Agendamento cancelado.');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Agenda de atendimentos" subtitle="Confirme solicitações e organize o fluxo da oficina." />

      <div className="mb-5">
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: 'todos', label: 'Todos', count: counts.todos },
          { id: 'pendente', label: 'Pendentes', count: counts.pendente },
          { id: 'confirmado', label: 'Confirmados', count: counts.confirmado },
          { id: 'concluido', label: 'Concluídos', count: counts.concluido },
        ]} />
      </div>

      {loading ? <Spinner fullPage label="Carregando agenda..." /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-navy-900 px-2 py-1.5 text-white">
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
                <p className="flex items-center gap-2"><UserRound size={16} className="text-brand-600" /> {item.cliente_nome}</p>
                {item.cliente_telefone && <p className="flex items-center gap-2 text-xs text-ink-500"><MessageCircle size={15} className="text-brand-600" /> {item.cliente_telefone}</p>}
                {item.observacoes && <p className="rounded-xl bg-surface-soft p-3 text-xs leading-relaxed text-ink-500">{item.observacoes}</p>}
              </div>

              {!['concluido', 'cancelado'].includes(item.status) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-surface-line pt-4">
                  {item.status === 'pendente' && (
                    <Button size="sm" icon={Check} loading={busy === `confirmado-${item.id}`} onClick={() => setStatus(item, 'confirmado')}>Confirmar</Button>
                  )}
                  {item.status !== 'cancelado' && (
                    <Button size="sm" variant="outline" icon={Check} loading={busy === `concluido-${item.id}`} onClick={() => setStatus(item, 'concluido')}>Concluir</Button>
                  )}
                  <Button size="sm" variant="ghost" icon={X} loading={busy === `cancelado-${item.id}`} onClick={() => setStatus(item, 'cancelado')}>Cancelar</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarDays} title="Nenhum agendamento" description="As solicitações dos clientes aparecerão aqui." />
      )}
    </div>
  );
}
