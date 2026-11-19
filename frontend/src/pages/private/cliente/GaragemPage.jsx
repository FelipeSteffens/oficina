import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarFront, Plus, ShieldCheck } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import VeiculoCard from '../../../components/veiculos/VeiculoCard.jsx';
import VeiculoForm from '../../../components/veiculos/VeiculoForm.jsx';
import VinculosPanel from '../../../components/veiculos/VinculosPanel.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { veiculoService } from '../../../services/veiculoService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';

export default function GaragemPage() {
  const { data: veiculos, loading, refetch } = useFetch(() => veiculoService.list());
  const { data: oficinas } = useFetch(() => veiculoService.listOficinasDisponiveis());
  const toast = useToast();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [vinculosVeiculo, setVinculosVeiculo] = useState(null);
  const [vinculos, setVinculos] = useState([]);
  const [loadingVinculos, setLoadingVinculos] = useState(null);
  const [loadingToggle, setLoadingToggle] = useState(null);

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(veiculo) { setEditing(veiculo); setFormOpen(true); }

  async function save(payload) {
    setSaving(true);
    try {
      if (editing) await veiculoService.update(editing.id, payload);
      else await veiculoService.create(payload);
      toast.success(editing ? 'Veículo atualizado!' : 'Veículo adicionado à garagem!');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await veiculoService.remove(deleting.id);
      toast.success('Veículo removido.');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function openVinculos(veiculo) {
    setVinculosVeiculo(veiculo);
    setLoadingVinculos(true);
    try {
      setVinculos(await veiculoService.listVinculos(veiculo.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingVinculos(false);
    }
  }

  async function toggleVinculo(veiculoId, oficinaId, status) {
    setLoadingToggle(`${veiculoId}-${oficinaId}`);
    try {
      const result = await veiculoService.setVinculo(veiculoId, oficinaId, status);
      setVinculos(result);
      toast.success(status === 'autorizado' ? 'Oficina autorizada!' : 'Autorização revogada.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingToggle(null);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Garagem digital" title="Meus veículos" subtitle="Cadastre, edite e autorize oficinas para cada veículo."
        actions={<Button icon={Plus} onClick={openCreate}>Novo veículo</Button>} />

      {loading ? <Spinner fullPage label="Carregando garagem..." /> : veiculos?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {veiculos.map((veiculo) => (
            <VeiculoCard
              key={veiculo.id}
              veiculo={veiculo}
              onEdit={openEdit}
              onDetail={(item) => window.location.assign(`/app/cliente/veiculos/${item.id}`)}
              onVinculos={openVinculos}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={CarFront} title="Sua garagem está vazia" description="Cadastre seu primeiro veículo para acompanhar manutenções e autorizar oficinas."
          action={<Button icon={Plus} onClick={openCreate}>Cadastrar veículo</Button>} />
      )}

      <VeiculoForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSubmit={save} loading={saving} />

      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={remove} loading={false}
        title="Remover veículo" message={`Tem certeza que deseja remover ${deleting?.marca} ${deleting?.modelo} (${deleting?.placa}) da sua garagem? O histórico será removido junto.`} confirmLabel="Remover" />

      <Modal open={Boolean(vinculosVeiculo)} onClose={() => setVinculosVeiculo(null)}
        title="Oficinas autorizadas" subtitle={`Controle o acesso ao veículo ${vinculosVeiculo?.placa || ''}`} size="lg"
        footer={<Button variant="ghost" onClick={() => setVinculosVeiculo(null)}>Fechar</Button>}>
        {loadingVinculos ? <Spinner /> : (
          <VinculosPanel veiculo={vinculosVeiculo || {}} oficinas={oficinas || []} vinculos={vinculos}
            onToggle={toggleVinculo} loadingId={loadingToggle} />
        )}
      </Modal>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-brand-600" size={20} />
          <div>
            <h3 className="font-display font-bold text-navy-900">Você tem o controle</h3>
            <p className="mt-1 text-sm text-brand-700">Somente as oficinas que você autorizar poderão visualizar o veículo, enviar orçamentos e registrar manutenções. Revogue o acesso a qualquer momento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
