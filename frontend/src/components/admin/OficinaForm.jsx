import { useEffect, useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

const EMPTY = {
  nome: '', cnpj: '', endereco: '', telefone: '', email: '',
  responsavelNome: '', emailResponsavel: '', senha: '', ativa: true,
};

export default function OficinaForm({ open, onClose, initial, onSubmit, loading = false }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? {
      nome: initial.nome || '', cnpj: initial.cnpj || '', endereco: initial.endereco || '',
      telefone: initial.telefone || '', email: initial.email || '',
      responsavelNome: initial.responsavel_nome || '',
      emailResponsavel: initial.email_responsavel || '', senha: '',
      ativa: Boolean(initial.ativa),
    } : EMPTY);
  }, [initial, open]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function submit(event) {
    event.preventDefault();
    onSubmit({
      nome: form.nome,
      cnpj: form.cnpj,
      endereco: form.endereco,
      telefone: form.telefone,
      email: form.email,
      responsavel_nome: form.responsavelNome,
      emailResponsavel: form.emailResponsavel,
      senha: form.senha,
      ativa: form.ativa === true || form.ativa === 'true',
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar oficina' : 'Nova oficina'} size="lg"
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="oficina-form" loading={loading}>{initial ? 'Salvar' : 'Cadastrar'}</Button>
      </>}>
      <form id="oficina-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome da oficina" name="nome" value={form.nome} onChange={set('nome')} className="sm:col-span-2" required />
        <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" required />
        <Input label="Responsável" name="responsavelNome" value={form.responsavelNome} onChange={set('responsavelNome')} required />
        <Input label="E-mail da oficina" name="email" type="email" icon={Mail} value={form.email} onChange={set('email')} required />
        <Input label="Telefone" name="telefone" value={form.telefone} onChange={set('telefone')} />
        <Input label="Endereço" name="endereco" value={form.endereco} onChange={set('endereco')} className="sm:col-span-2" />

        <div className="sm:col-span-2 rounded-xl border border-surface-line bg-surface-soft/60 p-4">
          <p className="mb-3 text-sm font-bold text-navy-900">Acesso do administrador da oficina</p>
          <p className="mb-4 text-xs text-ink-500">
            O responsável receberá o perfil <strong>admin_oficina</strong> e poderá acessar o painel da unidade com este e-mail e senha.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail de acesso" name="emailResponsavel" type="email" icon={Mail}
              value={form.emailResponsavel} onChange={set('emailResponsavel')}
              placeholder="admin@oficina.com" required={!initial} />
            <Input label={initial ? 'Nova senha (opcional)' : 'Senha de acesso'} name="senha" type="password" icon={KeyRound}
              value={form.senha} onChange={set('senha')} placeholder="Mínimo 6 caracteres"
              required={!initial} minLength={6} />
          </div>
          {initial && <p className="mt-3 text-xs text-ink-500">Deixe os campos em branco para manter o acesso atual.</p>}
        </div>

        {initial && (
          <select name="ativa" value={String(form.ativa)} onChange={set('ativa')} className="field-input sm:col-span-2">
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        )}
      </form>
    </Modal>
  );
}
