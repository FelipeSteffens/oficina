import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, Zap } from 'lucide-react';
import Logo from '../../components/layout/Logo.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { QUICK_CREDENTIALS, PERFIS } from '../../utils/constants.js';

function homeFor(perfil) {
  if (perfil === 'cliente') return '/app/cliente';
  if (perfil === 'admin_geral') return '/app/admin';
  return '/app/oficina';
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email.trim(), form.senha);
      toast.success(`Bem-vindo de volta, ${user.nome.split(' ')[0]}!`);
      navigate(location.state?.from || homeFor(user.perfil), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao entrar. Verifique suas credenciais.'));
    } finally {
      setLoading(false);
    }
  }

  function fill(credential) {
    setForm({ email: credential.email, senha: credential.senha });
    setError('');
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Formulário */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-block"><Logo size={42} /></Link>
          <h1 className="mt-8 font-display text-3xl font-extrabold text-navy-900">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-ink-500">Entre com seu e-mail e senha para continuar.</p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Input label="E-mail" name="email" type="email" icon={Mail} placeholder="voce@empresa.com" value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} required autoComplete="email" />
            <div className="relative">
              <Input label="Senha" name="senha" type={showPassword ? 'text' : 'password'} icon={LockKeyhole} placeholder="••••••••"
                value={form.senha} onChange={(e) => setForm((c) => ({ ...c, senha: e.target.value }))} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-[38px] text-ink-400 hover:text-ink-700" aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading} icon={ArrowRight}>Entrar</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Ainda não tem conta? <Link to="/cadastro" className="font-bold text-brand-600 hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>

      {/* Acesso rápido */}
      <div className="relative hidden overflow-hidden bg-navy-900 px-10 py-14 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 bg-hero-glow opacity-70" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-20" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-brand-200">
            <Zap size={14} /> Acesso rápido para testes
          </div>
          <h2 className="mt-5 font-display text-3xl font-extrabold">Credenciais de demonstração</h2>
          <p className="mt-2 text-sm text-white/60">Clique em um perfil para preencher o formulário automaticamente.</p>

          <div className="mt-7 grid gap-3 xl:grid-cols-2">
            {QUICK_CREDENTIALS.map((credential) => (
              <button key={credential.email} type="button" onClick={() => fill(credential)}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-brand-200/40 hover:bg-white/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                    <KeyRound size={15} className="text-brand-200" /> {credential.perfil}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">clique para preencher</span>
                </div>
                <p className="mt-3 truncate font-mono text-xs text-brand-200">{credential.email}</p>
                <p className="mt-1 font-mono text-xs text-emerald-300">{credential.senha}</p>
                <p className="mt-2 text-[11px] text-white/50">{credential.descricao}</p>
              </button>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/60">
            <strong className="text-white">Dica:</strong> os seeds também incluem uma segunda oficina (oficina2@autotrackpro.com),
            outro funcionário e outro cliente. Todos com as mesmas senhas por perfil.
          </div>
          <p className="mt-5 text-[11px] text-white/30">Perfis cadastrados: {Object.values(PERFIS).join(' · ')}</p>
        </div>
      </div>

      {/* Acesso rápido em mobile */}
      <div className="border-t border-surface-line bg-white px-4 py-10 lg:hidden">
        <div className="mx-auto max-w-md">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900"><Zap size={18} className="text-brand-600" /> Acesso rápido</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {QUICK_CREDENTIALS.map((credential) => (
              <button key={credential.email} type="button" onClick={() => fill(credential)} className="rounded-xl border border-surface-line p-3 text-left transition hover:border-brand-500">
                <p className="text-xs font-bold text-navy-900">{credential.perfil}</p>
                <p className="mt-1 truncate font-mono text-[10px] text-brand-600">{credential.email}</p>
                <p className="font-mono text-[10px] text-emerald-600">{credential.senha}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
