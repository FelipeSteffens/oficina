import { useState } from 'react';
import { Pencil, Power, ShieldCheck, UserRound } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import SearchInput from '../../../components/ui/SearchInput.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { usuarioService } from '../../../services/usuarioService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { PERFIS } from '../../../utils/constants.js';
import { formatDate, initials } from '../../../utils/formatters.js';

const TONES = {
  admin_geral: 'navy', admin_oficina: 'info', funcionario: 'purple', cliente: 'success',
};

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', perfil: 'cliente' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(() => usuarioService.list());
  const toast = useToast();

  const usuarios = (data || []).filter((item) => {
    const term = search.toLowerCase();
    return !term || item.nome.toLowerCase().includes(term) || item.email.toLowerCase().includes(term) || item.perfil.includes(term);
  });

  function openEdit(item) {
    setEditing(item);
    setForm({ nome: item.nome, email: item.email, perfil: item.perfil });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await usuarioService.update(editing.id, form);
      toast.success('Usuário atualizado!');
      setEditing(null);
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
      await usuarioService.setActive(toggling.id, !toggling.ativo);
      toast.success(toggling.ativo ? 'Usuário desativado.' : 'Usuário ativado.');
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
      <PageHeader eyebrow="Administração global" title="Usuários" subtitle="Gerencie perfis e status de acesso à plataforma." />

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
          <div className="flex items-center gap-2 text-sm text-ink-500"><ShieldCheck size={17} className="text-brand-600" /> {usuarios.length} usuário(s)</div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar nome, e-mail ou perfil..." className="w-full sm:w-72" />
        </div>
        <div className="px-5 pb-5">
          <Table loading={loading} data={usuarios} emptyTitle="Nenhum usuário" emptyDescription="Ajuste a busca ou cadastre um novo usuário."
            columns={[
              { key: 'nome', label: 'Usuário', render: (row) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-xs font-bold text-white">{initials(row.nome)}</span>
                  <div><p className="font-semibold text-navy-900">{row.nome}</p><p className="text-xs text-ink-500">{row.email}</p></div>
                </div>
              ) },
              { key: 'perfil', label: 'Perfil', render: (row) => <Badge tone={TONES[row.perfil] || 'neutral'}>{PERFIS[row.perfil] || row.perfil}</Badge> },
              { key: 'oficina', label: 'Oficina', render: (row) => row.oficina_nome || <span className="text-ink-400">—</span> },
              { key: 'status', label: 'Status', render: (row) => <Badge tone={row.ativo ? 'success' : 'danger'}>{row.ativo ? 'Ativo' : 'Inativo'}</Badge> },
              { key: 'criado', label: 'Cadastro', render: (row) => formatDate(row.criado_em) },
              { key: 'acoes', label: '', render: (row) => (
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100" title="Editar"><Pencil size={16} /></button>
                  {Number(row.id) !== Number(user?.id) && (
                    <button type="button" onClick={() => setToggling(row)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" title={row.ativo ? 'Desativar' : 'Ativar'}><Power size={16} /></button>
                  )}
                </div>
              ) },
            ]}
          />
        </div>
      </Card>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar usuário" subtitle={`ID #${editing?.id || ''}`} size="md"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" form="user-form" loading={saving}>Salvar</Button></>}>
        <form id="user-form" onSubmit={save} className="space-y-4">
          <Input label="Nome" name="nome" icon={UserRound} value={form.nome} onChange={(e) => setForm((c) => ({ ...c, nome: e.target.value }))} required />
          <Input label="E-mail" name="email" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required />
          <Select label="Perfil" name="perfil" value={form.perfil} onChange={(e) => setForm((c) => ({ ...c, perfil: e.target.value }))}>
            {Object.entries(PERFIS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <p className="text-xs text-ink-500">Alterar o perfil afetará as permissões imediatamente no próximo acesso.</p>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(toggling)} onClose={() => setToggling(null)} onConfirm={toggleStatus} loading={saving}
        title={toggling?.ativo ? 'Desativar usuário' : 'Ativar usuário'}
        message={`Deseja ${toggling?.ativo ? 'desativar' : 'reativar'} o acesso de ${toggling?.nome}?`}
        confirmLabel={toggling?.ativo ? 'Desativar' : 'Ativar'} danger={Boolean(toggling?.ativo)} />
    </div>
  );
}
