import { useState } from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { clienteService } from '../../../services/clienteService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { initials } from '../../../utils/formatters.js';

export default function PerfilPage() {
  const { data: perfil, loading, refetch } = useFetch(() => clienteService.getPerfil());
  const { updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = form || perfil || {};

  function set(key, value) {
    setForm((currentForm) => ({ ...(currentForm || perfil || {}), [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await clienteService.updatePerfil({
        nome: form.nome,
        telefone: form.telefone,
        cpf: form.cpf,
        endereco: form.endereco,
      });
      updateUser({ nome: form.nome });
      toast.success('Perfil atualizado com sucesso!');
      setForm(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !perfil) return <Spinner fullPage label="Carregando perfil..." />;

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Minha conta" title="Meu perfil" subtitle="Mantenha seus dados cadastrais atualizados." />

      <Card>
        <div className="mb-6 flex items-center gap-4 border-b border-surface-line pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 font-display text-xl font-extrabold text-white">
            {initials(current.nome)}
          </div>
          <div>
            <p className="font-display text-lg font-bold text-navy-900">{current.nome}</p>
            <p className="text-sm text-ink-500">{current.email}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input label="Nome completo" name="nome" icon={UserRound} value={current.nome || ''} onChange={(e) => set('nome', e.target.value)} required />
          <Input label="E-mail" name="email" icon={Mail} value={current.email || ''} disabled hint="O e-mail não pode ser alterado por aqui." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Telefone" name="telefone" icon={Phone} value={current.telefone || ''} onChange={(e) => set('telefone', e.target.value)} />
            <Input label="CPF" name="cpf" value={current.cpf || ''} onChange={(e) => set('cpf', e.target.value)} />
          </div>
          <Input label="Endereço" name="endereco" value={current.endereco || ''} onChange={(e) => set('endereco', e.target.value)} />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving}>Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
