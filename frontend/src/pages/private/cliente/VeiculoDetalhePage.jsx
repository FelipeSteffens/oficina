import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CarFront, Gauge, History, Pencil, ShieldCheck } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import VeiculoForm from '../../../components/veiculos/VeiculoForm.jsx';
import HistoricoTimeline from '../../../components/veiculos/HistoricoTimeline.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { historicoService } from '../../../services/historicoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { formatNumber, formatPlate } from '../../../utils/formatters.js';

export default function VeiculoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: veiculo, loading, refetch } = useFetch(() => veiculoService.get(id), [id]);
  const { data: historico, loading: loadingHistorico } = useFetch(() => historicoService.byVeiculo(id), [id]);
  const { data: oficinas } = useFetch(() => veiculoService.listOficinasDisponiveis());
  const [vinculos, setVinculos] = useState([]);
  const [loadingVinculos, setLoadingVinculos] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState(null);

  async function loadVinculos() {
    setLoadingVinculos(true);
    try {
      setVinculos(await veiculoService.listVinculos(id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingVinculos(false);
    }
  }

  // carrega vínculos quando o veículo fica disponível
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (veiculo) loadVinculos(); }, [veiculo?.id]);

  async function toggle(oficinaId, status) {
    setToggleId(oficinaId);
    try {
      setVinculos(await veiculoService.setVinculo(id, oficinaId, status));
      toast.success(status === 'autorizado' ? 'Oficina autorizada!' : 'Autorização revogada.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggleId(null);
    }
  }

  async function save(payload) {
    setSaving(true);
    try {
      await veiculoService.update(id, payload);
      toast.success('Veículo atualizado!');
      setEditOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner fullPage label="Carregando veículo..." />;
  if (!veiculo) return <PageHeader title="Veículo não encontrado" actions={<Button onClick={() => navigate(-1)}>Voltar</Button>} />;

  const autorizadas = vinculos.filter((vinculo) => vinculo.status === 'autorizado');

  return (
    <div>
      <PageHeader
        eyebrow="Garagem digital"
        title={`${veiculo.marca} ${veiculo.modelo}`}
        subtitle={`${formatPlate(veiculo.placa)} · ${veiculo.ano} · ${veiculo.cor || 'Cor não informada'}`}
        actions={
          <>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/app/cliente/garagem')}>Voltar</Button>
            <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>Editar</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><Gauge size={20} /></div><div><p className="text-xs font-semibold uppercase text-ink-500">Quilometragem</p><p className="font-display text-lg font-bold text-navy-900">{formatNumber(veiculo.quilometragem)} km</p></div></Card>
        <Card className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><CarFront size={20} /></div><div><p className="text-xs font-semibold uppercase text-ink-500">Combustível</p><p className="font-display text-lg font-bold text-navy-900">{veiculo.combustivel || '—'}</p></div></Card>
        <Card className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-600"><ShieldCheck size={20} /></div><div><p className="text-xs font-semibold uppercase text-ink-500">Oficinas autorizadas</p><p className="font-display text-lg font-bold text-navy-900">{autorizadas.length}</p></div></Card>
      </div>

      <Card title="Oficinas com acesso" subtitle="Você controla quem pode ver e atender este veículo." className="mt-6">
        {loadingVinculos ? <Spinner /> : (oficinas || []).length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {oficinas.map((oficina) => {
              const vinculo = vinculos.find((item) => Number(item.oficina_id) === Number(oficina.id));
              const autorizado = vinculo?.status === 'autorizado';
              return (
                <div key={oficina.id} className="flex items-center gap-3 rounded-xl border border-surface-line p-4">
                  <div className="rounded-xl bg-navy-900 p-2.5 text-white"><Building2 size={17} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{oficina.nome}</p>
                    <p className="text-xs text-ink-500">{autorizado ? 'Acesso autorizado' : 'Sem acesso'}</p>
                  </div>
                  <Button size="sm" variant={autorizado ? 'outline' : 'primary'} loading={toggleId === oficina.id}
                    onClick={() => toggle(oficina.id, autorizado ? 'revogado' : 'autorizado')}>
                    {autorizado ? 'Revogar' : 'Autorizar'}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-ink-500">Nenhuma oficina disponível no momento.</p>}
      </Card>

      <Card title="Histórico de manutenções" className="mt-6">
        {loadingHistorico ? <Spinner /> : <HistoricoTimeline data={historico} />}
      </Card>

      <VeiculoForm open={editOpen} onClose={() => setEditOpen(false)} initial={veiculo} onSubmit={save} loading={saving} />

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-400"><History size={14} /> Registros históricos são imutáveis por design.</div>
    </div>
  );
}
