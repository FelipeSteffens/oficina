import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import * as usuarioRepository from '../repositories/usuarioRepository.js';
import * as clienteRepository from '../repositories/clienteRepository.js';
import * as oficinaRepository from '../repositories/oficinaRepository.js';
import * as funcionarioRepository from '../repositories/funcionarioRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { AppError, badRequest, conflict, unauthorized } from '../utils/AppError.js';
import { normalizePlate } from '../utils/formatters.js';

function signToken(user) {
  return jwt.sign({ id: user.id, perfil: user.perfil }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

async function sessionFor(usuarioId) {
  const context = await usuarioRepository.findAuthContext(usuarioId);
  if (!context) throw new AppError('Não foi possível montar a sessão do usuário.', 500);
  return {
    token: signToken(context),
    user: {
      id: context.id,
      nome: context.nome,
      email: context.email,
      perfil: context.perfil,
      oficinaId: context.oficina_id ?? null,
      clienteId: context.cliente_id ?? null,
      funcionarioId: context.funcionario_id ?? null,
    },
  };
}

export async function login(email, senha) {
  if (!email || !senha) throw badRequest('E-mail e senha são obrigatórios.');
  const usuario = await usuarioRepository.findByEmail(String(email).trim().toLowerCase());
  if (!usuario) throw unauthorized('E-mail ou senha incorretos.');
  if (!usuario.ativo) throw unauthorized('Este usuário está desativado. Procure o administrador.');

  const match = await comparePassword(senha, usuario.senha_hash);
  if (!match) throw unauthorized('E-mail ou senha incorretos.');

  await auditoriaRepository.insert({
    usuarioId: usuario.id,
    oficinaId: null,
    acao: 'LOGIN',
    referencia: usuario.email,
    detalhes: 'Login realizado com sucesso.',
  });

  return sessionFor(usuario.id);
}

export async function registerCliente(data) {
  const { nome, email, senha, cpf, telefone, endereco } = data;
  if (!nome || !email || !senha || !telefone) throw badRequest('Nome, e-mail, senha e telefone são obrigatórios.');
  const emailNorm = String(email).trim().toLowerCase();
  if (await usuarioRepository.findByEmail(emailNorm)) throw conflict('Este e-mail já está cadastrado.');

  const usuario = await usuarioRepository.create({
    nome: String(nome).trim(),
    email: emailNorm,
    senhaHash: await hashPassword(senha),
    perfil: 'cliente',
  });

  await clienteRepository.create({
    usuarioId: usuario.id,
    nomeCompleto: String(nome).trim(),
    cpf: cpf || null,
    telefone,
    email: emailNorm,
    endereco: endereco || null,
  });

  return sessionFor(usuario.id);
}

export async function registerOficina(data) {
  const {
    nomeOficina, cnpj, endereco, telefoneOficina, emailOficina,
    responsavelNome, emailResponsavel, senha,
  } = data;

  if (!nomeOficina || !cnpj || !emailResponsavel || !senha) {
    throw badRequest('Nome da oficina, CNPJ, e-mail do responsável e senha são obrigatórios.');
  }
  const emailNorm = String(emailResponsavel).trim().toLowerCase();
  if (await usuarioRepository.findByEmail(emailNorm)) throw conflict('Este e-mail já está cadastrado.');

  const oficina = await oficinaRepository.create({
    nome: nomeOficina,
    cnpj,
    endereco: endereco || '',
    telefone: telefoneOficina || '',
    email: emailOficina || emailNorm,
    responsavel_nome: responsavelNome || nomeOficina,
  });

  const usuario = await usuarioRepository.create({
    nome: responsavelNome,
    email: emailNorm,
    senhaHash: await hashPassword(senha),
    perfil: 'admin_oficina',
  });

  await funcionarioRepository.create({
    usuarioId: usuario.id,
    oficinaId: oficina.id,
    nome: responsavelNome,
    contato: telefoneOficina || '',
    funcao: 'Administrador da Oficina',
  });

  await auditoriaRepository.insert({
    usuarioId: usuario.id,
    oficinaId: oficina.id,
    acao: 'OFICINA_CADASTRADA',
    referencia: `oficina#${oficina.id}`,
    detalhes: `Oficina ${oficina.nome} cadastrada via cadastro público.`,
  });

  return sessionFor(usuario.id);
}

/** Dados completos do perfil do usuário autenticado (usado no /auth/me). */
export async function me(context) {
  const perfil = { ...context };
  if (context.perfil === 'cliente' && context.clienteId) {
    perfil.cliente = await clienteRepository.findById(context.clienteId);
  }
  if (context.perfil === 'admin_oficina' || context.perfil === 'funcionario') {
    if (context.oficinaId) perfil.oficina = await oficinaRepository.findById(context.oficinaId);
  }
  return perfil;
}

/** Utilitário exportado para normalizar placa em cadastro de veículos. */
export { normalizePlate };
