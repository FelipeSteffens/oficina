import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { authenticated } = useAuth();

  const links = [
    { to: '/#recursos', label: 'Recursos' },
    { to: '/#como-funciona', label: 'Como funciona' },
    { to: '/contato', label: 'Contato' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Página inicial"><Logo size={36} /></Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.label} href={link.to} className="text-sm font-semibold text-ink-700 transition hover:text-brand-600">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authenticated ? (
            <Button to="/app" variant="primary">Ir para o painel</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost">Entrar</Button>
              <Button to="/cadastro" variant="primary">Criar conta</Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg p-2 text-navy-900 md:hidden"
          aria-label="Abrir menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-up border-t border-surface-line bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <a key={link.label} href={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-surface-soft">
                {link.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {authenticated ? (
                <Button to="/app" className="col-span-2">Ir para o painel</Button>
              ) : (
                <>
                  <Button to="/login" variant="outline">Entrar</Button>
                  <Button to="/cadastro">Criar conta</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
