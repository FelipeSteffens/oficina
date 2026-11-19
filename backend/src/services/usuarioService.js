import * as usuarioRepository from '../repositories/usuarioRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { badRequest, notFound } from '../utils/AppError.js';

const PERFIS = ['admin_geral', 'admin_oficina', 'funcionario', 'cliente'];

export async function list() {
  return usuarioRepository.listAll();
}

export async function get(id) {
  const user = await usuarioRepository.findById(id);
  if (!user) throw notFound('Usuário não encontrado.');
  return user;
}

export async function update(id, data, actor) {
  if (data.perfil && !PERFIS.includes(data.perfil)) throw badRequest('Perfil inválido.');
  const existing = await get(id);
  const fields = {};
  if (data.nome !== undefined) fields.nome = String(data.nome).trim();
  if (data.email !== undefined) fields.email = String(data.email).trim().toLowerCase();
  if (data.perfil !== undefined) fields.perfil = data.perfil;
  if (data.ativo !== undefined) fields.ativo = data.ativo ? 1 : 0;

  const updated = await usuarioRepository.update(id, fields);
  await auditoriaRepository.insert({
    usuarioId: actor.id,
    oficinaId: null,
    acao: 'USUARIO_ATUALIZADO',
    referencia: `usuario#${id}`,
    detalhes: `Campos alterados: ${Object.keys(fields).join(', ') || 'nenhum'} (perfil anterior: ${existing.perfil}).`,
  });
  return updated;
}

export async function setActive(id, ativo, actor) {
  await get(id);
  if (actor.id === Number(id) && !ativo) throw badRequest('Você não pode desativar a própria conta.');
  const updated = await usuarioRepository.setActive(id, ativo);
  await auditoriaRepository.insert({
    usuarioId: actor.id,
    oficinaId: null,
    acao: ativo ? 'USUARIO_ATIVADO' : 'USUARIO_DESATIVADO',
    referencia: `usuario#${id}`,
    detalhes: `Status do usuário alterado para ${ativo ? 'ativo' : 'inativo'}.`,
  });
  return updated;
}
