import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as usuarioRepository from '../repositories/usuarioRepository.js';
import { AppError, unauthorized } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifica o JWT e hidrata req.user com o contexto atual do banco.
 * Reconsultar o usuário garante que perfil.ativo e vínculos estejam atualizados.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) throw unauthorized('Token de acesso não fornecido.');

  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Sua sessão expirou. Faça login novamente.', 401);
    }
    throw unauthorized('Token inválido.');
  }

  const user = await usuarioRepository.findAuthContext(payload.id);
  if (!user || !user.ativo) throw unauthorized('Usuário inexistente ou inativo.');

  req.user = {
    id: user.id,
    nome: user.nome,
    email: user.email,
    perfil: user.perfil,
    oficinaId: user.oficina_id ?? null,
    funcionarioId: user.funcionario_id ?? null,
    clienteId: user.cliente_id ?? null,
    token,
  };

  next();
});

/** Autenticação opcional (usada apenas em rotas públicas que enriquecem dados). */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  return protect(req, _res, next);
});
