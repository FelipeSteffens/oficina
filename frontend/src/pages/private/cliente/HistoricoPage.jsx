import { useState } from 'react';
import { History } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Select from '../../../components/ui/Select.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import HistoricoTimeline from '../../../components/veiculos/HistoricoTimeline.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { historicoService } from '../../../services/historicoService.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { formatPlate } from '../../../utils/formatters.js';

export default function HistoricoPage() {
  const [veiculoId, setVeiculoId] = useState('');
  const { data: veiculos } = useFetch(() => veiculoService.list());
  const { data, loading } = useFetch(
    () => (veiculoId ? historicoService.byVeiculo(veiculoId) : historicoService.mine()),
    [veiculoId],
  );

  return (
    <div>
      <PageHeader eyebrow="Histórico digital" title="Histórico dos veículos" subtitle="Registros imutáveis que pertencem ao veículo, não à oficina." />

      <div className="mb-6 max-w-md">
        <Select label="Filtrar por veículo" value={veiculoId} onChange={(event) => setVeiculoId(event.target.value)}>
          <option value="">Todos os veículos</option>
          {(veiculos || []).map((veiculo) => (
            <option key={veiculo.id} value={veiculo.id}>{veiculo.marca} {veiculo.modelo} — {formatPlate(veiculo.placa)}</option>
          ))}
        </Select>
      </div>

      {loading ? <Spinner label="Carregando histórico..." /> : (
        <HistoricoTimeline data={
          Array.isArray(data)
            ? {
                veiculo: { placa: 'TODOS OS VEÍCULOS' },
                registros: data.flatMap((item) => item.registros.map((registro) => ({
                  ...registro,
                  oficina_nome: registro.oficina_nome,
                  veiculo_label: `${item.modelo} · ${item.placa}`,
                }))),
              }
            : data
        } />
      )}
    </div>
  );
}
