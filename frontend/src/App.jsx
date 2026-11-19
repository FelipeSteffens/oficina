import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import Spinner from './components/ui/Spinner.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import CadastroPage from './pages/public/CadastroPage.jsx';
import ContatoPage from './pages/public/ContatoPage.jsx';

import ClienteDashboard from './pages/private/cliente/ClienteDashboard.jsx';
import GaragemPage from './pages/private/cliente/GaragemPage.jsx';
import VeiculoDetalhePage from './pages/private/cliente/VeiculoDetalhePage.jsx';
import OrcamentosPage from './pages/private/cliente/OrcamentosPage.jsx';
import AgendamentosPage from './pages/private/cliente/AgendamentosPage.jsx';
import HistoricoPage from './pages/private/cliente/HistoricoPage.jsx';
import PerfilPage from './pages/private/cliente/PerfilPage.jsx';

import OficinaDashboard from './pages/private/oficina/OficinaDashboard.jsx';
import OsPage from './pages/private/oficina/OsPage.jsx';
import OrcamentosOficinaPage from './pages/private/oficina/OrcamentosOficinaPage.jsx';
import AgendamentosOficinaPage from './pages/private/oficina/AgendamentosOficinaPage.jsx';
import VeiculosOficinaPage from './pages/private/oficina/VeiculosOficinaPage.jsx';
import EstoquePage from './pages/private/oficina/EstoquePage.jsx';
import RelatoriosPage from './pages/private/oficina/RelatoriosPage.jsx';
import FuncionariosPage from './pages/private/oficina/FuncionariosPage.jsx';
import EmpresaPage from './pages/private/oficina/EmpresaPage.jsx';

import AdminDashboard from './pages/private/admin/AdminDashboard.jsx';
import OficinasPage from './pages/private/admin/OficinasPage.jsx';
import UsuariosPage from './pages/private/admin/UsuariosPage.jsx';

function RoleHome() {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner fullPage label="Verificando sua sessão..." />;
  if (user?.perfil === 'admin_geral') return <Navigate to="/app/admin" replace />;
  if (user?.perfil === 'cliente') return <Navigate to="/app/cliente" replace />;
  return <Navigate to="/app/oficina" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contato" element={<ContatoPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />

      <Route path="/app" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

      <Route path="/app/cliente" element={<ProtectedRoute allowedRoles={['cliente']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ClienteDashboard />} />
        <Route path="garagem" element={<GaragemPage />} />
        <Route path="veiculos/:id" element={<VeiculoDetalhePage />} />
        <Route path="orcamentos" element={<OrcamentosPage />} />
        <Route path="agendamentos" element={<AgendamentosPage />} />
        <Route path="historico" element={<HistoricoPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>

      <Route path="/app/oficina" element={<ProtectedRoute allowedRoles={['funcionario', 'admin_oficina']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<OficinaDashboard />} />
        <Route path="os" element={<OsPage />} />
        <Route path="orcamentos" element={<OrcamentosOficinaPage />} />
        <Route path="agendamentos" element={<AgendamentosOficinaPage />} />
        <Route path="veiculos" element={<VeiculosOficinaPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="funcionarios" element={<ProtectedRoute allowedRoles={['admin_oficina']}><Outlet /></ProtectedRoute>}>
          <Route index element={<FuncionariosPage />} />
        </Route>
        <Route path="empresa" element={<ProtectedRoute allowedRoles={['admin_oficina']}><Outlet /></ProtectedRoute>}>
          <Route index element={<EmpresaPage />} />
        </Route>
      </Route>

      <Route path="/app/admin" element={<ProtectedRoute allowedRoles={['admin_geral']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="oficinas" element={<OficinasPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
