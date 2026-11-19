import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { authenticated, ready, user, hasRole } = useAuth();
  const location = useLocation();

  if (!ready) return <Spinner fullPage label="Verificando sua sessão..." />;
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles?.length && !hasRole(...allowedRoles)) {
    return <Navigate to={homeFor(user?.perfil)} replace />;
  }
  return children;
}

function homeFor(perfil) {
  if (perfil === 'cliente') return '/app/cliente';
  if (perfil === 'admin_geral') return '/app/admin';
  return '/app/oficina';
}
