import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, FileText, CalendarDays, CarFront, Package,
  ChartNoAxesCombined, Users, Building2, History, UserRound, X,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { NAV_ADMIN, NAV_CLIENTE, NAV_OFICINA, PERFIS } from '../../utils/constants.js';

const ICONS = {
  LayoutDashboard, Wrench, FileText, CalendarDays, CarFront, Package,
  ChartNoAxesCombined, Users, Building2, History, UserRound,
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const isCliente = user?.perfil === 'cliente';
  const isAdminGeral = user?.perfil === 'admin_geral';
  const nav = isCliente ? NAV_CLIENTE : isAdminGeral ? NAV_ADMIN : NAV_OFICINA;

  const items = nav.filter((item) => !item.adminOnly || user?.perfil === 'admin_oficina');

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <NavLink to="/app"><Logo size={36} light /></NavLink>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/60 lg:hidden" aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Perfil ativo</p>
          <p className="mt-1 text-sm font-semibold text-white">{PERFIS[user?.perfil] || '—'}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || LayoutDashboard;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app' || item.to === '/app/oficina' || item.to === '/app/cliente' || item.to === '/app/admin'}
                onClick={onClose}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs font-semibold text-white/80">{user?.nome}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/40">{user?.email}</p>
          </div>
          <p className="mt-3 text-center text-[10px] text-white/30">AutoTrack Pro v1.0</p>
        </div>
      </aside>
    </>
  );
}
