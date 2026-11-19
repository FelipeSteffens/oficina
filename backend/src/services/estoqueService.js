import * as estoqueRepository from '../repositories/estoqueRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { badRequest, notFound } from '../utils/AppError.js';
import { withTransaction } from '../config/db.js';

function requireOficina(context) {
  if (!context.oficinaId) throw badRequest('Perfil sem oficina vinculada.');
  return Number(context.oficinaId);
}

export async function list(context, filters = {}) {
  return estoqueRepository.listByOficina(requireOficina(context), filters);
}

export async function get(id, context) {
  const peca = await estoqueRepository.findById(id, requireOficina(context));
  if (!peca) throw notFound('Peça não encontrada nesta oficina.');
  return peca;
}

export async function create(data, context) {
  const oficinaId = requireOficina(context);
  if (!data.nome || !data.codigo) throw badRequest('Nome e código da peça são obrigatórios.');
  const peca = await estoqueRepository.create({ ...data, oficinaId });

  await withTransaction(async (conn) => {
    await estoqueRepository.addMovimentacao({
      pecaId: peca.id,
      oficinaId,
      tipo: 'entrada',
      quantidade: Number(data.quantidade ?? 0),
      motivo: 'Cadastro inicial de peça no estoque',
    }, conn);
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'PECA_CRIADA',
    referencia: `peca#${peca.id}`,
    detalhes: `Peça ${peca.nome} (${peca.codigo}) cadastrada com ${peca.quantidade} unidades.`,
  });
  return peca;
}

export async function update(id, data, context) {
  const oficinaId = requireOficina(context);
  const anterior = await get(id, context);
  const aliases = {
    nome: 'nome',
    codigo: 'codigo',
    precoUnitario: 'preco_unitario',
    preco_unitario: 'preco_unitario',
    estoqueMinimo: 'estoque_minimo',
    estoque_minimo: 'estoque_minimo',
  };
  const fields = {};
  for (const [key, column] of Object.entries(aliases)) {
    if (data[key] !== undefined) fields[column] = data[key];
  }
  // Ajuste manual de quantidade gera movimentação auditável.
  let delta = 0;
  if (data.quantidade !== undefined) {
    delta = Number(data.quantidade) - Number(anterior.quantidade);
  }

  await withTransaction(async (conn) => {
    await estoqueRepository.update(id, oficinaId, fields, conn);
    if (delta !== 0) {
      await estoqueRepository.adjustQuantity(id, oficinaId, delta, conn);
      await estoqueRepository.addMovimentacao({
        pecaId: id,
        oficinaId,
        tipo: delta > 0 ? 'entrada' : 'saida',
        quantidade: Math.abs(delta),
        motivo: 'Ajuste manual de inventário',
      }, conn);
    }
  });
  const peca = await get(id, context);

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'PECA_ATUALIZADA',
    referencia: `peca#${id}`,
    detalhes: `Campos alterados: ${Object.keys(fields).join(', ') || 'nenhum'}${delta ? `; ajuste de quantidade: ${delta > 0 ? '+' : ''}${delta}` : ''}.`,
  });
  return peca;
}

export async function remove(id, context) {
  const oficinaId = requireOficina(context);
  const peca = await get(id, context);
  await estoqueRepository.remove(id, oficinaId);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'PECA_REMOVIDA',
    referencia: `peca#${id}`,
    detalhes: `Peça ${peca.nome} removida do catálogo.`,
  });
  return { id: Number(id) };
}

export async function registerEntrada(id, data, context) {
  const oficinaId = requireOficina(context);
  const quantidade = Number(data.quantidade);
  if (!Number.isInteger(quantidade) || quantidade <= 0) throw badRequest('Quantidade de entrada deve ser inteira e positiva.');
  const peca = await get(id, context);

  await withTransaction(async (conn) => {
    await estoqueRepository.adjustQuantity(id, oficinaId, quantidade, conn);
    await estoqueRepository.addMovimentacao({
      pecaId: id,
      oficinaId,
      tipo: 'entrada',
      quantidade,
      motivo: data.motivo || 'Entrada manual de estoque',
    }, conn);
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'ESTOQUE_ENTRADA',
    referencia: `peca#${id}`,
    detalhes: `Entrada de ${quantidade} unidades de ${peca.nome}. Motivo: ${data.motivo || 'não informado'}.`,
  });
  return get(id, context);
}

export async function listMovimentacoes(context, limit = 100) {
  return estoqueRepository.listMovimentacoes(requireOficina(context), limit);
}
