import { withTransaction } from '../config/db.js';
import * as oficinaRepository from '../repositories/oficinaRepository.js';
import * as usuarioRepository from '../repositories/usuarioRepository.js';
import * as funcionarioRepository from '../repositories/funcionarioRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { hashPassword } from '../utils/password.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validateAdminEmail(email) {
  if (!EMAIL_REGEX.test(email)) throw badRequest('Informe um e-mail de acesso válido.');
}

function validateAdminSenha(senha) {
  if (String(senha).length < 6) throw badRequest('A senha do administrador deve ter pelo menos 6 caracteres.');
}

async function ensureEmailAvailable(email, currentUsuarioId = null) {
  const existente = await usuarioRepository.findByEmail(email);
  if (existente && Number(existente.id) !== Number(currentUsuarioId)) {
    throw conflict('Já existe um usuário com este e-mail de acesso.');
  }
}

function toBoolean(value, fallback = true) {
  if (value === undefined) return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** Admin Geral vê todas; Admin da Oficina vê somente a sua. */
export async function list(context) {
  if (context.perfil === 'admin_geral') return oficinaRepository.listAll();
  const oficina = await oficinaRepository.findById(context.oficinaId);
  return oficina ? [oficina] : [];
}

export async function get(id, context) {
  if (context.perfil !== 'admin_geral' && Number(id) !== Number(context.oficinaId)) {
    throw forbidden('Acesso permitido apenas à sua própria oficina.');
  }
  const oficina = await oficinaRepository.findById(id);
  if (!oficina) throw notFound('Oficina não encontrada.');
  return oficina;
}

/**
 * Cria a oficina e, na mesma transação, o login do administrador da oficina
 * (perfil `admin_oficina`) com o e-mail e a senha informados no formulário.
 */
export async function create(data, context) {
  if (context.perfil !== 'admin_geral') throw forbidden('Somente o Admin Geral pode cadastrar oficinas.');

  const nome = String(data.nome || '').trim();
  const cnpj = String(data.cnpj || '').trim();
  const emailOficina = normalizeEmail(data.email);
  const responsavelNome = String(data.responsavel_nome || '').trim() || nome;
  const emailAdmin = normalizeEmail(data.emailResponsavel || data.email_admin);
  const senha = String(data.senha || '');

  if (!nome || !cnpj || !emailOficina) {
    throw badRequest('Nome, CNPJ e e-mail da oficina são obrigatórios.');
  }
  if (!emailAdmin || !senha) {
    throw badRequest('E-mail de acesso e senha do administrador são obrigatórios.');
  }
  validateAdminEmail(emailAdmin);
  validateAdminSenha(senha);

  if (await oficinaRepository.findByCnpj(cnpj)) {
    throw conflict('Já existe uma oficina cadastrada com este CNPJ.');
  }
  await ensureEmailAvailable(emailAdmin);

  const senhaHash = await hashPassword(senha);

  const oficina = await withTransaction(async (conn) => {
    const created = await oficinaRepository.create({
      nome,
      cnpj,
      endereco: String(data.endereco || '').trim(),
      telefone: String(data.telefone || '').trim(),
      email: emailOficina,
      responsavel_nome: responsavelNome,
      ativa: toBoolean(data.ativa),
    }, conn);

    const usuario = await usuarioRepository.create({
      nome: responsavelNome,
      email: emailAdmin,
      senhaHash,
      perfil: 'admin_oficina',
    }, conn);

    await funcionarioRepository.create({
      usuarioId: usuario.id,
      oficinaId: created.id,
      nome: responsavelNome,
      contato: String(data.telefone || '').trim(),
      funcao: 'Administrador da Oficina',
    }, conn);

    await auditoriaRepository.insert({
      usuarioId: context.id,
      oficinaId: created.id,
      acao: 'OFICINA_CRIADA',
      referencia: `oficina#${created.id}`,
      detalhes: `Oficina ${created.nome} criada pelo painel global, com acesso ${emailAdmin} (perfil admin_oficina).`,
    }, conn);

    return created;
  });

  return { ...oficina, email_responsavel: emailAdmin };
}

export async function update(id, data, context) {
  const anterior = await get(id, context);
  const adminAtual = await oficinaRepository.findAdminLogin(id);

  const oficinaFields = {};
  for (const key of ['nome', 'cnpj', 'endereco', 'telefone', 'email', 'responsavel_nome']) {
    if (data[key] !== undefined) oficinaFields[key] = String(data[key]).trim();
  }
  if (oficinaFields.email) oficinaFields.email = normalizeEmail(oficinaFields.email);
  if (data.ativa !== undefined) oficinaFields.ativa = toBoolean(data.ativa);

  if (oficinaFields.cnpj) {
    const existente = await oficinaRepository.findByCnpj(oficinaFields.cnpj);
    if (existente && Number(existente.id) !== Number(id)) {
      throw conflict('Já existe uma oficina cadastrada com este CNPJ.');
    }
  }

  const emailAdmin = data.emailResponsavel === undefined
    ? null
    : normalizeEmail(data.emailResponsavel);
  const senha = data.senha === undefined ? null : String(data.senha);

  if (emailAdmin) validateAdminEmail(emailAdmin);
  if (senha) validateAdminSenha(senha);
  if (emailAdmin) await ensureEmailAvailable(emailAdmin, adminAtual?.usuario_id);

  const senhaHash = senha ? await hashPassword(senha) : null;
  const nomeResponsavel = oficinaFields.responsavel_nome || anterior.responsavel_nome || anterior.nome;

  const oficina = await withTransaction(async (conn) => {
    const atualizada = Object.keys(oficinaFields).length
      ? await oficinaRepository.update(id, oficinaFields, conn)
      : anterior;

    if (emailAdmin || senhaHash) {
      if (adminAtual?.usuario_id) {
        const userFields = { nome: nomeResponsavel };
        if (emailAdmin) userFields.email = emailAdmin;
        if (senhaHash) userFields.senha_hash = senhaHash;
        await usuarioRepository.update(adminAtual.usuario_id, userFields, conn);
      } else {
        if (!emailAdmin || !senhaHash) {
          throw badRequest('Para criar o acesso desta oficina, informe o e-mail de acesso e a senha do administrador.');
        }
        const usuario = await usuarioRepository.create({
          nome: nomeResponsavel,
          email: emailAdmin,
          senhaHash,
          perfil: 'admin_oficina',
        }, conn);
        await funcionarioRepository.create({
          usuarioId: usuario.id,
          oficinaId: Number(id),
          nome: nomeResponsavel,
          contato: atualizada.telefone || '',
          funcao: 'Administrador da Oficina',
        }, conn);
      }
    }

    const alterados = [...Object.keys(oficinaFields)];
    if (emailAdmin || senhaHash) alterados.push('acesso_administrador');
    await auditoriaRepository.insert({
      usuarioId: context.id,
      oficinaId: Number(id),
      acao: 'OFICINA_ATUALIZADA',
      referencia: `oficina#${id}`,
      detalhes: `Campos alterados: ${alterados.join(', ') || 'nenhum'}.`,
    }, conn);

    return atualizada;
  });

  return { ...oficina, email_responsavel: emailAdmin || adminAtual?.email || null };
}

export async function setActive(id, ativa, context) {
  if (context.perfil !== 'admin_geral') throw forbidden('Somente o Admin Geral pode ativar/desativar oficinas.');
  await get(id, context);
  const oficina = await withTransaction(async (conn) => {
    const updated = await oficinaRepository.setActive(id, ativa, conn);
    await auditoriaRepository.insert({
      usuarioId: context.id,
      oficinaId: Number(id),
      acao: ativa ? 'OFICINA_ATIVADA' : 'OFICINA_DESATIVADA',
      referencia: `oficina#${id}`,
      detalhes: `Oficina ${updated.nome} agora está ${ativa ? 'ativa' : 'inativa'}.`,
    }, conn);
    return updated;
  });
  return oficina;
}
