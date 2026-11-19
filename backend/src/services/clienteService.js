import * as clienteRepository from '../repositories/clienteRepository.js';
import * as usuarioRepository from '../repositories/usuarioRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { hashPassword } from '../utils/password.js';
import { badRequest, conflict, notFound } from '../utils/AppError.js';

function requireCliente(context) {
  if (!context.clienteId) throw badRequest('Perfil sem cadastro de cliente.');
  return Number(context.clienteId);
}

export async function getPerfil(context) {
  const cliente = await clienteRepository.findById(requireCliente(context));
  if (!cliente) throw notFound('Perfil de cliente não encontrado.');
  const usuario = await usuarioRepository.findById(context.id);
  return {
    ...cliente,
    nome: usuario?.nome ?? cliente.nome_completo,
    ativo: usuario?.ativo ?? 1,
  };
}

export async function updatePerfil(data, context) {
  const clienteId = requireCliente(context);
  const cliente = await clienteRepository.findById(clienteId);
  if (!cliente) throw notFound('Perfil de cliente não encontrado.');

  const clienteFields = {};
  if (data.nomeCompleto !== undefined) clienteFields.nome_completo = String(data.nomeCompleto).trim();
  if (data.cpf !== undefined) clienteFields.cpf = data.cpf || null;
  if (data.telefone !== undefined) clienteFields.telefone = data.telefone;
  if (data.endereco !== undefined) clienteFields.endereco = data.endereco || null;

  const usuarioFields = {};
  if (data.nome !== undefined || data.nomeCompleto !== undefined) {
    usuarioFields.nome = String(data.nome || data.nomeCompleto).trim();
  }
  if (data.email !== undefined) {
    const emailNorm = String(data.email).trim().toLowerCase();
    const existing = await usuarioRepository.findByEmail(emailNorm);
    if (existing && existing.id !== context.id) throw conflict('Este e-mail já está em uso.');
    usuarioFields.email = emailNorm;
    clienteFields.email = emailNorm;
  }
  if (data.senha) {
    if (String(data.senha).length < 6) throw badRequest('A senha deve ter ao menos 6 caracteres.');
    usuarioFields.senha_hash = await hashPassword(data.senha);
  }

  const updatedCliente = await clienteRepository.update(clienteId, clienteFields);
  const updatedUsuario = await usuarioRepository.update(context.id, usuarioFields);

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: null,
    acao: 'PERFIL_CLIENTE_ATUALIZADO',
    referencia: `cliente#${clienteId}`,
    detalhes: `Campos alterados: ${Object.keys({ ...clienteFields, ...usuarioFields }).join(', ')}.`,
  });

  return { ...updatedCliente, nome: updatedUsuario.nome, email: updatedUsuario.email };
}

export async function listAll() {
  return clienteRepository.listAll();
}
