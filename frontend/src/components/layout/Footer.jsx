import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Phone, MapPin } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size={42} light />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
              A plataforma que conecta motoristas e oficinas com transparência, organização e um histórico digital que acompanha o veículo onde ele estiver.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <a href="https://wa.me/551140001234" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-semibold transition hover:bg-white/20">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href="mailto:contato@autotrackpro.com" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-semibold transition hover:bg-white/20">
                <Mail size={16} /> E-mail
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">Plataforma</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/#recursos" className="hover:text-white">Para oficinas</Link></li>
              <li><Link to="/#motoristas" className="hover:text-white">Para motoristas</Link></li>
              <li><Link to="/#como-funciona" className="hover:text-white">Como funciona</Link></li>
              <li><Link to="/cadastro" className="hover:text-white">Criar conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">Contato</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2"><Phone size={15} className="mt-0.5 shrink-0 text-brand-200" /> (11) 4000-1234</li>
              <li className="flex items-start gap-2"><Mail size={15} className="mt-0.5 shrink-0 text-brand-200" /> contato@autotrackpro.com</li>
              <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-200" /> Av. das Nações, 1200 — São Paulo/SP</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40">
          <p>© {new Date().getFullYear()} AutoTrack Pro. Todos os direitos reservados.</p>
          <p>Feito com precisão para a engenharia automotiva.</p>
        </div>
      </div>
    </footer>
  );
}
