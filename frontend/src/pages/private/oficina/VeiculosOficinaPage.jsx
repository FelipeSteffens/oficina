import { useState } from 'react';
import { CarFront, ShieldCheck } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import SearchInput from '../../../components/ui/SearchInput.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import HistoricoTimeline from '../../../components/veiculos/HistoricoTimeline.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { historicoService } from '../../../services/historicoService.js';
import { formatNumber, formatPlate } from '../../../utils/formatters.js';

export default function VeiculosOficinaPage() {
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const { data, loading } = useFetch(() => veiculoService.listByOficina(search), [search]);

  async function openDetail(veiculo) {
    setDetail(veiculo);
  }

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Veículos atendidos" subtitle="Frota com autorização ativa para a sua oficina." />

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <ShieldCheck size={17} className="text-brand-600" />
            Somente veículos autorizados pelo proprietário aparecem nesta lista.
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por placa, modelo ou cliente..." className="w-full sm:w-72" />
        </div>
        <div className="px-5 pb-5">
          {loading ? <Spinner /> : (
            <Table data={data || []} onRowClick={openDetail}
              emptyTitle="Nenhum veículo autorizado" emptyDescription="Aguarde o proprietário autorizar o acesso na Garagem Digital."
              columns={[
                { key: 'placa', label: 'Placa', render: (row) => <span className="font-bold text-navy-900">{formatPlate(row.placa)}</span> },
                { key: 'veiculo', label: 'Veículo', render: (row) => (
                  <div><p className="font-semibold text-navy-900">{row.marca} {row.modelo}</p><p className="text-xs text-ink-500">{row.ano} · {row.cor || '—'}</p></div>
                ) },
                { key: 'cliente', label: 'Proprietário', render: (row) => row.cliente_nome || '—' },
                { key: 'km', label: 'KM atual', render: (row) => `${formatNumber(row.quilometragem)} km` },
                { key: 'os', label: 'Atendimentos', render: (row) => <Badge tone="info">{row.total_os ?? 0}</Badge> },
                { key: 'combustivel', label: 'Combustível', render: (row) => row.combustivel || '—' },
              ]}
            />
          )}
        </div>
      </Card>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)}
        title={`${detail?.marca || ''} ${detail?.modelo || ''}`}
        subtitle={detail ? `${formatPlate(detail.placa)} · ${detail.cliente_nome}` : ''} size="xl"
        footer={<Button variant="ghost" onClick={() => setDetail(null)}>Fechar</Button>}>
        {detail && <HistoricoVeiculo veiculoId={detail.id} />}
      </Modal>
    </div>
  );
}

function HistoricoVeiculo({ veiculoId }) {
  const { data, loading } = useFetch(() => historicoService.byVeiculo(veiculoId), [veiculoId]);
  if (loading) return <Spinner />;
  if (!data?.registros?.length) return <EmptyState icon={CarFront} title="Sem histórico" description="Nenhum serviço concluído para este veículo ainda." />;
  return <HistoricoTimeline data={data} />;
}
