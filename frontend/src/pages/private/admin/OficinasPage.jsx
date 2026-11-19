import { useState } from 'react';
import { Building2, CarFront, Pencil, Plus, Power, Users } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import OficinaForm from '../../../components/admin/OficinaForm.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { oficinaService } from '../../../services/oficinaService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { formatCpfCnpj } from '../../../utils/formatters.js';

export default function OficinasPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const { data, loading, refetch } = useFetch(() => oficinaService.list());
  const toast = useToast();

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(item) { setEditing(item); setFormOpen(true); }

  async function save(payload) {
    setSaving(true);
    try {
      if (editing) await oficinaService.update(editing.id, payload);
      else await oficinaService.create(payload);
      toast.success(editing ? 'Oficina atualizada!' : 'Oficina cadastrada!');
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    setSaving(true);
    try {
      await oficinaService.setActive(toggling.id, !toggling.ativa);
      toast.success(toggling.ativa ? 'Oficina desativada.' : 'Oficina ativada.');
      setToggling(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Administração global" title="Oficinas" subtitle="Gerencie as unidades cadastradas na plataforma."
        actions={<Button icon={Plus} onClick={openCreate}>Nova oficina</Button>} />

      <Card padded={false}>
        <div className="px-5 pb-5 pt-5">
          <Table loading={loading} data={data || []} emptyTitle="Nenhuma oficina" emptyDescription="Cadastre a primeira oficina."
            columns={[
              { key: 'nome', label: 'Oficina', render: (row) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white"><Building2 size={17} /></span>
                  <div><p className="font-semibold text-navy-900">{row.nome}</p><p className="text-xs text-ink-500">{formatCpfCnpj(row.cnpj)}</p></div>
                </div>
              ) },
              { key: 'contato', label: 'Contato', render: (row) => (
                <div><p className="text-sm">{row.email}</p><p className="text-xs text-ink-500">{row.telefone || '—'}</p></div>
              ) },
              { key: 'equipe', label: 'Equipe', render: (row) => <Badge tone="info"><Users size={12} className="mr-1" />{row.total_funcionarios ?? 0}</Badge> },
              { key: 'veiculos', label: 'Veículos', render: (row) => <Badge tone="neutral"><CarFront size={12} className="mr-1" />{row.total_veiculos ?? 0}</Badge> },
              { key: 'os', label: 'OS', render: (row) => <span className="font-semibold text-navy-900">{row.total_os ?? 0}</span> },
              { key: 'status', label: 'Status', render: (row) => <Badge tone={row.ativa ? 'success' : 'danger'}>{row.ativa ? 'Ativa' : 'Inativa'}</Badge> },
              { key: 'acoes', label: '', render: (row) => (
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100" title="Editar"><Pencil size={16} /></button>
                  <button type="button" onClick={() => setToggling(row)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" title={row.ativa ? 'Desativar' : 'Ativar'}><Power size={16} /></button>
                </div>
              ) },
            ]}
          />
        </div>
      </Card>

      <OficinaForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSubmit={save} loading={saving} />

      <ConfirmDialog open={Boolean(toggling)} onClose={() => setToggling(null)} onConfirm={toggleStatus} loading={saving}
        title={toggling?.ativa ? 'Desativar oficina' : 'Ativar oficina'}
        message={toggling?.ativa
          ? `Deseja desativar "${toggling?.nome}"? Novos agendamentos serão bloqueados.`
          : `Deseja reativar "${toggling?.nome}"?`}
        confirmLabel={toggling?.ativa ? 'Desativar' : 'Ativar'} danger={Boolean(toggling?.ativa)} />
    </div>
  );
}
