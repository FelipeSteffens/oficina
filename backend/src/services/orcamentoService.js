import { withTransaction } from '../config/db.js';
import * as orcamentoRepository from '../repositories/orcamentoRepository.js';
import * as osRepository from '../repositories/osRepository.js';
import * as veiculoRepository from '../repositories/veiculoRepository.js';
import * as estoqueRepository from '../repositories/estoqueRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

function filtersFor(context) {
  if (context.perfil === 'cliente') return { clienteId: context.clienteId };
  if (context.perfil === 'admin_geral') return {};
  return { oficinaId: context.oficinaId };
}

async function assertAccess(orcamento, context) {
  if (context.perfil === 'admin_geral') return;
  if (context.perfil === 'cliente' && Number(orcamento.cliente_id) !== Number(context.clienteId)) {
    throw forbidden('Este orçamento não pertence ao seu cadastro.');
  }
  if (context.perfil !== 'cliente' && Number(orcamento.oficina_id) !== Number(context.oficinaId)) {
    throw forbidden('Este orçamento pertence a outra oficina.');
  }
}

export async function list(context, extra = {}) {
  return orcamentoRepository.listByFilters({ ...filtersFor(context), ...extra });
}

export async function get(id, context) {
  const orcamento = await orcamentoRepository.findWithItens(id);
  if (!orcamento) throw notFound('Orçamento não encontrado.');
  await assertAccess(orcamento, context);
  return orcamento;
}

export async function create(data, context) {
  if (!context.oficinaId) throw forbidden('Perfil sem oficina vinculada.');
  if (!data.veiculoId || !data.descricaoServicos) {
    throw badRequest('Veículo e descrição dos serviços são obrigatórios.');
  }
  const veiculo = await veiculoRepository.findWithOwner(data.veiculoId);
  if (!veiculo) throw notFound('Veículo não encontrado.');
  const vinculo = await veiculoRepository.findAuthorization(data.veiculoId, context.oficinaId);
  if (!vinculo || vinculo.status !== 'autorizado') {
    throw badRequest('O veículo não está autorizado para a sua oficina.');
  }

  const itens = Array.isArray(data.itens) ? data.itens : [];
  let valorMaoObra = 0;
  let valorPecas = 0;

  const itensNormalizados = await Promise.all(itens.map(async (item) => {
    const tipo = item.tipo === 'peca' ? 'peca' : 'servico';
    const quantidade = Number(item.quantidade ?? 1);
    let valorUnitario = Number(item.valorUnitario ?? 0);
    let descricao = String(item.descricao || '').trim();
    let pecaId = item.pecaId ?? null;

    if (tipo === 'peca' && pecaId) {
      const peca = await estoqueRepository.findById(pecaId, context.oficinaId);
      if (!peca) throw badRequest(`Peça #${pecaId} não pertence ao estoque desta oficina.`);
      descricao = descricao || peca.nome;
      if (!item.valorUnitario) valorUnitario = Number(peca.preco_unitario);
      valorPecas += quantidade * valorUnitario;
    } else {
      valorMaoObra += quantidade * valorUnitario;
    }

    if (!descricao) throw badRequest('Todos os itens precisam de descrição.');
    return { tipo, pecaId, descricao, quantidade, valorUnitario };
  }));

  const valorTotal = data.valorTotal !== undefined
    ? Number(data.valorTotal)
    : Number((valorMaoObra + valorPecas).toFixed(2));

  const orcamentoId = await withTransaction(async (conn) => {
    const id = await orcamentoRepository.create({
      oficinaId: context.oficinaId,
      veiculoId: data.veiculoId,
      clienteId: veiculo.cliente_id,
      descricaoServicos: data.descricaoServicos,
      valorMaoObra,
      valorPecas,
      valorTotal,
      status: 'pendente',
    }, conn);

    for (const item of itensNormalizados) {
      await orcamentoRepository.addItem({ ...item, orcamentoId }, conn);
    }
    return id;
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: context.oficinaId,
    acao: 'ORCAMENTO_CRIADO',
    referencia: `orcamento#${orcamentoId}`,
    detalhes: `Orçamento para ${veiculo.placa} no valor de R$ ${valorTotal.toFixed(2)}.`,
  });

  return get(orcamentoId, context);
}

export async function updateStatus(id, status, context) {
  if (!['aprovado', 'recusado'].includes(status)) throw badRequest('Status inválido para aprovação.');
  const orcamento = await get(id, context);
  if (context.perfil !== 'cliente') throw forbidden('Somente o cliente pode aprovar ou recusar o orçamento.');
  if (orcamento.status !== 'pendente') throw conflict('Este orçamento já foi respondido.');

  const atualizado = await orcamentoRepository.updateStatus(id, status);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: orcamento.oficina_id,
    acao: status === 'aprovado' ? 'ORCAMENTO_APROVADO' : 'ORCAMENTO_RECUSADO',
    referencia: `orcamento#${id}`,
    detalhes: `Cliente ${context.nome} ${status} o orçamento de R$ ${orcamento.valor_total}.`,
  });
  return atualizado;
}

/** Converte um orçamento aprovado em OS com um clique (transação SQL). */
export async function convertToOs(id, data, context) {
  if (!context.oficinaId) throw forbidden('Perfil sem oficina vinculada.');
  const orcamento = await get(id, context);
  if (orcamento.status !== 'aprovado') throw conflict('Somente orçamentos aprovados podem gerar uma OS.');
  if (await osRepository.existsOsForOrcamento(id)) throw conflict('Este orçamento já foi convertido em ordem de serviço.');

  const itens = await orcamentoRepository.listItens(id);
  const servicos = itens.filter((item) => item.tipo === 'servico').map((item) => item.descricao).join('; ');
  const descricaoServicos = [orcamento.descricao_servicos, servicos].filter(Boolean).join(' | ');

  const osId = await withTransaction(async (conn) => {
    const novoId = await osRepository.create({
      oficinaId: context.oficinaId,
      veiculoId: orcamento.veiculo_id,
      clienteId: orcamento.cliente_id,
      funcionarioId: data?.funcionarioId ?? context.funcionarioId ?? null,
      orcamentoId: id,
      dataEntrada: new Date(),
      quilometragem: data?.quilometragem ?? 0,
      problemaRelatado: descricaoServicos,
      diagnostico: orcamento.descricao_servicos,
      servicosRealizados: null,
      valorTotal: orcamento.valor_total,
      status: 'em_andamento',
    }, conn);

    for (const item of itens.filter((i) => i.tipo === 'peca' && i.peca_id)) {
      await osRepository.addPeca({
        osId: novoId,
        pecaId: item.peca_id,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.valor_unitario),
      }, conn);
    }
    return novoId;
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: context.oficinaId,
    acao: 'ORCAMENTO_CONVERTIDO_OS',
    referencia: `os#${osId}`,
    detalhes: `Orçamento #${id} convertido em OS #${osId}.`,
  });

  return osRepository.findById(osId);
}
