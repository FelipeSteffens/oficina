import { withTransaction } from '../config/db.js';
import * as funcionarioRepository from '../repositories/funcionarioRepository.js';
import * as usuarioRepository from '../repositories/usuarioRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { hashPassword } from '../utils/password.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

function requireOficina(context) {
  if (!context.oficinaId) throw badRequest('Usuário sem oficina vinculada.');
  return Number(context.oficinaId);
}

function requireGestor(context) {
  if (context.perfil !== 'admin_oficina') {
    throw forbidden('Somente o administrador da oficina pode gerenciar funcionários.');
  }
}

export async function list(context) {
  return funcionarioRepository.listByOficina(requireOficina(context));
}

export async function get(id, context) {
  const oficinaId = requireOficina(context);
  const funcionario = await funcionarioRepository.findById(id, oficinaId);
  if (!funcionario) throw notFound('Funcionário não encontrado nesta oficina.');
  return funcionario;
}

/**
 * Cria o funcionário e, na mesma transação, um usuário com perfil `funcionario`.
 * Assim o colaborador consegue fazer login imediatamente com o e-mail e a senha informados.
 */
export async function create(data, context) {
  requireGestor(context);
  const oficinaId = requireOficina(context);

  const nome = String(data.nome || '').trim();
  const contato = String(data.contato || '').trim();
  const funcao = String(data.funcao || 'Funcionário').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const senha = String(data.senha || '');

  if (!nome || !contato || !funcao) {
    throw badRequest('Nome, contato e função são obrigatórios.');
  }
  if (!email || !senha) {
    throw badRequest('E-mail e senha são obrigatórios para liberar o acesso do funcionário.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest('Informe um e-mail válido para o acesso.');
  }
  if (senha.length < 6) {
    throw badRequest('A senha do funcionário deve ter pelo menos 6 caracteres.');
  }
  if (await usuarioRepository.findByEmail(email)) {
    throw conflict('Já existe um usuário com este e-mail. Escolha outro ou reative a conta existente.');
  }

  const senhaHash = await hashPassword(senha);

  const funcionario = await withTransaction(async (conn) => {
    const usuario = await usuarioRepository.create({
      nome,
      email,
      senhaHash,
      perfil: 'funcionario',
    }, conn);

    return funcionarioRepository.create({
      usuarioId: usuario.id,
      oficinaId,
      nome,
      contato,
      funcao,
    }, conn);
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'FUNCIONARIO_CRIADO',
    referencia: `funcionario#${funcionario.id}`,
    detalhes: `Funcionário ${funcionario.nome} cadastrado como ${funcionario.funcao}, com acesso ${email} (perfil funcionario).`,
  });

  return funcionario;
}

export async function update(id, data, context) {
  requireGestor(context);
  const oficinaId = requireOficina(context);
  const anterior = await get(id, context);

  const fields = {};
  for (const key of ['nome', 'contato', 'funcao']) {
    if (data[key] !== undefined) fields[key] = String(data[key]).trim();
  }
  if (fields.nome === '' || fields.contato === '' || fields.funcao === '') {
    throw badRequest('Nome, contato e função não podem ficar vazios.');
  }

  const userFields = {};
  if (data.email !== undefined && String(data.email).trim() !== '') {
    const email = String(data.email).trim().toLowerCase();
    const existente = await usuarioRepository.findByEmail(email);
    if (existente && Number(existente.id) !== Number(anterior.usuario_id)) {
      throw conflict('Já existe um usuário com este e-mail.');
    }
    userFields.email = email;
  }
  if (data.senha !== undefined && String(data.senha).trim() !== '') {
    if (String(data.senha).length < 6) throw badRequest('A senha deve ter pelo menos 6 caracteres.');
    userFields.senha_hash = await hashPassword(data.senha);
  }
  if (fields.nome) userFields.nome = fields.nome;

  const funcionario = await withTransaction(async (conn) => {
    const atualizado = Object.keys(fields).length
      ? await funcionarioRepository.update(id, oficinaId, fields, conn)
      : anterior;

    if (anterior.usuario_id && Object.keys(userFields).length) {
      await usuarioRepository.update(anterior.usuario_id, userFields, conn);
    }
    return atualizado;
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'FUNCIONARIO_ATUALIZADO',
    referencia: `funcionario#${id}`,
    detalhes: `Campos alterados: ${[...Object.keys(fields), ...Object.keys(userFields)].join(', ') || 'nenhum'}.`,
  });
  return funcionario;
}

export async function remove(id, context) {
  requireGestor(context);
  const oficinaId = requireOficina(context);
  const funcionario = await get(id, context);
  if (funcionario.usuario_id === context.id) throw badRequest('Você não pode remover o seu próprio vínculo administrativo.');
  if (/administrad/i.test(funcionario.funcao)) {
    throw badRequest('Não é possível remover o registro administrativo da oficina.');
  }

  await withTransaction(async (conn) => {
    // O usuário é desativado (não excluído) para preservar logs de auditoria.
    if (funcionario.usuario_id) await usuarioRepository.setActive(funcionario.usuario_id, false, conn);
    await funcionarioRepository.remove(id, oficinaId, conn);
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'FUNCIONARIO_REMOVIDO',
    referencia: `funcionario#${id}`,
    detalhes: `Funcionário ${funcionario.nome} removido e acesso desativado.`,
  });
  return { id: Number(id) };
}
