import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { PERFIS } from '../../utils/constants.js';
import { initials } from '../../utils/formatters.js';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.info('Sessão encerrada com segurança.');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface-soft">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-line bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-navy-900 hover:bg-surface-soft lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-navy-900">Olá, {user?.nome?.split(' ')[0]} 👋</p>
              <p className="text-xs text-ink-500">Acompanhe a operação em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 sm:inline">
              {PERFIS[user?.perfil]}
            </span>
            <button type="button" className="relative rounded-lg p-2 text-ink-500 transition hover:bg-surface-soft" aria-label="Notificações">
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-surface-line bg-white py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-navy-900 transition hover:border-brand-500"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white">
                  {initials(user?.nome)}
                </span>
                <ChevronDown size={15} className="text-ink-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-60 animate-fade-up overflow-hidden rounded-xl border border-surface-line bg-white shadow-lift">
                    <div className="border-b border-surface-line px-4 py-3">
                      <p className="truncate text-sm font-bold text-navy-900">{user?.nome}</p>
                      <p className="truncate text-xs text-ink-500">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); navigate(user?.perfil === 'cliente' ? '/app/cliente/perfil' : '/app'); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-soft"
                    >
                      <UserRound size={16} /> Minha conta
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-surface-line px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
