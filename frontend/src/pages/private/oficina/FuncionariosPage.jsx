import { useState } from 'react';
import { KeyRound, Mail, Pencil, Plus, Trash2, UserRound, Users } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Table from '../../../components/ui/Table.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { funcionarioService } from '../../../services/funcionarioService.js';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { formatDate, initials } from '../../../utils/formatters.js';

const EMPTY = { nome: '', contato: '', funcao: '', email: '', senha: '' };

export default function FuncionariosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { data, loading, refetch } = useFetch(() => funcionarioService.list());
  const toast = useToast();

  function openCreate() { setEditing(null); setForm(EMPTY); setFormOpen(true); }
  function openEdit(item) {
    setEditing(item);
    setForm({ nome: item.nome, contato: item.contato, funcao: item.funcao, email: item.email || '', senha: '' });
    setFormOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) await funcionarioService.update(editing.id, form);
      else await funcionarioService.create(form);
      toast.success(editing ? 'Funcionário atualizado!' : 'Funcionário cadastrado com acesso de funcionário!');
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
      await funcionarioService.remove(deleting.id);
      toast.success('Funcionário removido da equipe.');
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Oficina" title="Equipe" subtitle="Cadastre mecânicos e colaboradores da oficina."
        actions={<Button icon={Plus} onClick={openCreate}>Novo funcionário</Button>} />

      <Card padded={false}>
        <div className="px-5 pb-5 pt-5">
          <Table loading={loading} data={data || []} emptyTitle="Nenhum funcionário" emptyDescription="Cadastre a equipe da sua oficina."
            columns={[
              { key: 'nome', label: 'Nome', render: (row) => (
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-xs font-bold text-white">{initials(row.nome)}</span>
                  <div><p className="font-semibold text-navy-900">{row.nome}</p><p className="text-xs text-ink-500">{row.email || 'Sem e-mail de acesso'}</p></div>
                </div>
              ) },
              { key: 'funcao', label: 'Função', render: (row) => <Badge tone={/administrad/i.test(row.funcao) ? 'info' : 'neutral'}>{row.funcao}</Badge> },
              { key: 'contato', label: 'Contato', render: (row) => row.contato || '—' },
              { key: 'criado', label: 'Desde', render: (row) => formatDate(row.criado_em) },
              { key: 'acoes', label: '', render: (row) => (
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100" title="Editar"><Pencil size={16} /></button>
                  {!/administrad/i.test(row.funcao) && (
                    <button type="button" onClick={() => setDeleting(row)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Remover"><Trash2 size={16} /></button>
                  )}
                </div>
              ) },
            ]}
          />
        </div>
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar funcionário' : 'Novo funcionário'}
        subtitle="O colaborador recebe acesso com perfil de funcionário para usar OS, agenda e estoque." size="md"
        footer={<><Button variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button><Button type="submit" form="func-form" loading={saving}>{editing ? 'Salvar' : 'Cadastrar'}</Button></>}>
        <form id="func-form" onSubmit={save} className="space-y-4">
          <Input label="Nome completo" name="nome" icon={UserRound} value={form.nome} onChange={(e) => setForm((c) => ({ ...c, nome: e.target.value }))} required />
          <Input label="Função" name="funcao" value={form.funcao} onChange={(e) => setForm((c) => ({ ...c, funcao: e.target.value }))} placeholder="Ex.: Mecânico geral" required />
          <Input label="Contato" name="contato" value={form.contato} onChange={(e) => setForm((c) => ({ ...c, contato: e.target.value }))} placeholder="(11) 99999-0000" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail de acesso" name="email" type="email" icon={Mail} value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="funcionario@oficina.com" required />
            <Input label={editing ? 'Nova senha (opcional)' : 'Senha de acesso'} name="senha" type="password" icon={KeyRound} value={form.senha} onChange={(e) => setForm((c) => ({ ...c, senha: e.target.value }))} placeholder="Mínimo 6 caracteres" required={!editing} minLength={6} />
          </div>
          <p className="text-xs text-ink-500">O e-mail informado cria o login do funcionário. Ao editar, deixe a senha em branco para mantê-la.</p>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={remove}
        title="Remover funcionário" message={`Deseja remover ${deleting?.nome} da equipe?`} confirmLabel="Remover" />
    </div>
  );
}
