import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CarFront, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';

const EMPTY_CLIENTE = { nome: '', email: '', senha: '', telefone: '', cpf: '', endereco: '' };
const EMPTY_OFICINA = {
  nomeOficina: '', cnpj: '', responsavelNome: '', emailResponsavel: '', senha: '',
  telefoneOficina: '', emailOficina: '', endereco: '',
};

export default function CadastroPage() {
  const [tab, setTab] = useState('cliente');
  const [cliente, setCliente] = useState(EMPTY_CLIENTE);
  const [oficina, setOficina] = useState(EMPTY_OFICINA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerCliente, registerOficina } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = tab === 'cliente' ? await registerCliente(cliente) : await registerOficina(oficina);
      toast.success(`Conta criada! Bem-vindo, ${user.nome.split(' ')[0]}.`);
      navigate(user.perfil === 'cliente' ? '/app/cliente' : '/app/oficina', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível concluir o cadastro.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:py-20">
      <div className="hidden lg:block">
        <Link to="/"><Logo size={44} /></Link>
        <h1 className="mt-10 font-display text-4xl font-extrabold leading-tight text-navy-900">
          Comece agora. <span className="text-brand-600">É rápido e simples.</span>
        </h1>
        <p className="mt-4 max-w-md text-ink-500">Escolha o seu perfil e tenha acesso imediato a todos os recursos da plataforma.</p>
        <div className="mt-10 space-y-5">
          {[
            { icon: CarFront, title: 'Para motoristas', text: 'Organize sua garagem, autorize oficinas e acompanhe cada manutenção do seu veículo.' },
            { icon: Building2, title: 'Para oficinas', text: 'Gerencie OS, equipe, orçamentos e estoque com isolamento total dos seus dados.' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white"><item.icon size={20} /></div>
              <div>
                <h3 className="font-display font-bold text-navy-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-700">
          <CheckCircle2 size={20} className="mb-2" />
          <strong>Sem cartão de crédito.</strong> Sem necessidade de contrato. Comece a usar agora mesmo.
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="lg:hidden"><Logo size={38} /></div>
        <h2 className="mt-4 font-display text-2xl font-extrabold text-navy-900 lg:mt-0">Crie sua conta</h2>
        <p className="mt-1 text-sm text-ink-500">Já possui conta? <Link to="/login" className="link-primary">Fazer login</Link></p>

        <Tabs
          className="mt-6"
          active={tab}
          onChange={(value) => { setTab(value); setError(''); }}
          tabs={[
            { id: 'cliente', label: 'Sou motorista' },
            { id: 'oficina', label: 'Sou oficina' },
          ]}
        />

        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {tab === 'cliente' ? (
            <>
              <Input label="Nome completo" name="nome" value={cliente.nome} onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="E-mail" name="email" type="email" value={cliente.email} onChange={(e) => setCliente((c) => ({ ...c, email: e.target.value }))} required />
                <Input label="Telefone" name="telefone" value={cliente.telefone} onChange={(e) => setCliente((c) => ({ ...c, telefone: e.target.value }))} placeholder="(11) 99999-0000" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="CPF (opcional)" name="cpf" value={cliente.cpf} onChange={(e) => setCliente((c) => ({ ...c, cpf: e.target.value }))} />
                <Input label="Senha" name="senha" type="password" minLength={6} value={cliente.senha} onChange={(e) => setCliente((c) => ({ ...c, senha: e.target.value }))} required />
              </div>
              <Input label="Endereço (opcional)" name="endereco" value={cliente.endereco} onChange={(e) => setCliente((c) => ({ ...c, endereco: e.target.value }))} />
            </>
          ) : (
            <>
              <Input label="Nome da oficina" name="nomeOficina" value={oficina.nomeOficina} onChange={(e) => setOficina((c) => ({ ...c, nomeOficina: e.target.value }))} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="CNPJ" name="cnpj" value={oficina.cnpj} onChange={(e) => setOficina((c) => ({ ...c, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" required />
                <Input label="Responsável" name="responsavelNome" value={oficina.responsavelNome} onChange={(e) => setOficina((c) => ({ ...c, responsavelNome: e.target.value }))} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="E-mail do responsável" name="emailResponsavel" type="email" value={oficina.emailResponsavel} onChange={(e) => setOficina((c) => ({ ...c, emailResponsavel: e.target.value }))} required />
                <Input label="Senha" name="senha" type="password" minLength={6} value={oficina.senha} onChange={(e) => setOficina((c) => ({ ...c, senha: e.target.value }))} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Telefone da oficina" name="telefoneOficina" value={oficina.telefoneOficina} onChange={(e) => setOficina((c) => ({ ...c, telefoneOficina: e.target.value }))} />
                <Input label="E-mail da oficina" name="emailOficina" type="email" value={oficina.emailOficina} onChange={(e) => setOficina((c) => ({ ...c, emailOficina: e.target.value }))} />
              </div>
              <Input label="Endereço" name="endereco" value={oficina.endereco} onChange={(e) => setOficina((c) => ({ ...c, endereco: e.target.value }))} />
            </>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>Criar conta</Button>
          <p className="text-center text-[11px] leading-relaxed text-ink-400">
            Ao continuar, você concorda com os termos de uso e a política de privacidade da plataforma.
          </p>
        </form>
      </div>
    </div>
  );
}
