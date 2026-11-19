import * as contatoRepository from '../repositories/contatoRepository.js';
import { badRequest } from '../utils/AppError.js';

export async function create(data) {
  if (!data.nome || !data.email || !data.mensagem) {
    throw badRequest('Nome, e-mail e mensagem são obrigatórios.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
    throw badRequest('Informe um e-mail válido.');
  }
  const id = await contatoRepository.create({
    nome: String(data.nome).trim(),
    email: String(data.email).trim().toLowerCase(),
    telefone: data.telefone || null,
    mensagem: String(data.mensagem).trim(),
  });
  return { id, message: 'Mensagem enviada com sucesso. Retornaremos em breve!' };
}

export async function listAll() {
  return contatoRepository.listAll();
}
