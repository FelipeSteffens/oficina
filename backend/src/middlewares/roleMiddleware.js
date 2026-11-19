import { forbidden, unauthorized } from '../utils/AppError.js';

/** Fábrica de middlewares RBAC. Uso: requireRole('admin_oficina', 'funcionario'). */
export function requireRole(...perfis) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!perfis.includes(req.user.perfil)) {
      return next(forbidden(`Acesso restrito a: ${perfis.join(', ')}.`));
    }
    return next();
  };
}

export const requireAdminGeral = requireRole('admin_geral');
export const requireGestorOficina = requireRole('admin_oficina');
export const requireEquipeOficina = requireRole('admin_oficina', 'funcionario');
export const requireCliente = requireRole('cliente');
export const requireAdminOuOficina = requireRole('admin_geral', 'admin_oficina');
export const requireAdminOuEquipe = requireRole('admin_geral', 'admin_oficina', 'funcionario');
