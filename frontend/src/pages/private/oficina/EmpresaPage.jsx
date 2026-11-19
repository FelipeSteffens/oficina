import { useState } from 'react';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader.jsx';
import Card from '../../../components/ui/Card.jsx';
import Input from '../../../components/ui/Input.jsx';
import Button from '../../../components/ui/Button.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import { useFetch } from '../../../hooks/useFetch.js';
import { oficinaService } from '../../../services/oficinaService.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../../services/api.js';
import { formatCpfCnpj } from '../../../utils/formatters.js';

export default function EmpresaPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useFetch(() => oficinaService.get(user.oficinaId), [user.oficinaId]);
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = form || data || {};

  function set(key, value) {
    setForm((c) => ({ ...(c || data || {}), [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = form || data;
      await oficinaService.update(user.oficinaId, {
        nome: payload.nome,
        cnpj: payload.cnpj,
        endereco: payload.endereco,
        telefone: payload.telefone,
        email: payload.email,
        responsavel_nome: payload.responsavel_nome,
      });
      toast.success('Dados da empresa atualizados!');
      setForm(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <Spinner fullPage label="Carregando dados da empresa..." />;

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Configurações" title="Dados da empresa" subtitle="Informações exibidas em orçamentos, OS e relatórios." />

      <Card>
        <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-surface-line pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white"><Building2 size={24} /></div>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-navy-900">{current.nome}</p>
            <p className="text-sm text-ink-500">{formatCpfCnpj(current.cnpj)}</p>
          </div>
          <Badge tone={current.ativa ? 'success' : 'danger'}>{current.ativa ? 'Oficina ativa' : 'Oficina inativa'}</Badge>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome da oficina" name="nome" value={current.nome || ''} onChange={(e) => set('nome', e.target.value)} className="sm:col-span-2" required />
          <Input label="CNPJ" name="cnpj" value={current.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} required />
          <Input label="Responsável" name="responsavelNome" value={current.responsavel_nome || ''} onChange={(e) => set('responsavel_nome', e.target.value)} />
          <Input label="E-mail" name="email" icon={Mail} type="email" value={current.email || ''} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Telefone" name="telefone" icon={Phone} value={current.telefone || ''} onChange={(e) => set('telefone', e.target.value)} />
          <Input label="Endereço" name="endereco" icon={MapPin} value={current.endereco || ''} onChange={(e) => set('endereco', e.target.value)} className="sm:col-span-2" />
          <div className="sm:col-span-2 flex justify-end pt-2">
            <Button type="submit" loading={saving}>Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
