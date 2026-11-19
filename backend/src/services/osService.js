import { withTransaction } from '../config/db.js';
import * as osRepository from '../repositories/osRepository.js';
import * as estoqueRepository from '../repositories/estoqueRepository.js';
import * as veiculoRepository from '../repositories/veiculoRepository.js';
import * as funcionarioRepository from '../repositories/funcionarioRepository.js';
import * as historicoRepository from '../repositories/historicoRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { AppError, badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';

const STATUS = ['aguardando_aprovacao', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada'];

function requireOficina(context) {
  if (!context.oficinaId) throw forbidden('Perfil sem oficina vinculada.');
  return Number(context.oficinaId);
}

function filtersFor(context, extra = {}) {
  if (context.perfil === 'cliente') return { clienteId: context.clienteId, ...extra };
  if (context.perfil === 'admin_geral') return extra;
  return { oficinaId: context.oficinaId, ...extra };
}

async function assertAccess(os, context) {
  if (context.perfil === 'admin_geral') return;
  if (context.perfil === 'cliente' && Number(os.cliente_id) !== Number(context.clienteId)) {
    throw forbidden('Esta ordem de serviço não pertence ao seu cadastro.');
  }
  if (context.perfil !== 'cliente' && Number(os.oficina_id) !== Number(context.oficinaId)) {
    throw forbidden('Esta ordem de serviço pertence a outra oficina.');
  }
}

export async function list(context, extra = {}) {
  return osRepository.listByFilters(filtersFor(context, extra));
}

export async function get(id, context) {
  const os = await osRepository.findById(id);
  if (!os) throw notFound('Ordem de serviço não encontrada.');
  await assertAccess(os, context);
  return { ...os, pecas: await osRepository.listPecas(id) };
}

export async function create(data, context) {
  const oficinaId = requireOficina(context);
  if (!data.veiculoId) throw badRequest('Veículo é obrigatório.');

  const veiculo = await veiculoRepository.findWithOwner(data.veiculoId);
  if (!veiculo) throw notFound('Veículo não encontrado.');
  const vinculo = await veiculoRepository.findAuthorization(data.veiculoId, oficinaId);
  if (!vinculo || vinculo.status !== 'autorizado') {
    throw badRequest('O veículo não está autorizado para a sua oficina.');
  }

  if (data.funcionarioId) {
    const funcionario = await funcionarioRepository.findById(data.funcionarioId, oficinaId);
    if (!funcionario) throw badRequest('Mecânico informado não pertence a esta oficina.');
  }

  const pecas = Array.isArray(data.pecas) ? data.pecas : [];
  for (const peca of pecas) {
    const item = await estoqueRepository.findById(peca.pecaId, oficinaId);
    if (!item) throw badRequest(`Peça #${peca.pecaId} não pertence ao estoque desta oficina.`);
  }

  const osId = await withTransaction(async (conn) => {
    const id = await osRepository.create({
      oficinaId,
      veiculoId: data.veiculoId,
      clienteId: veiculo.cliente_id,
      funcionarioId: data.funcionarioId ?? null,
      orcamentoId: data.orcamentoId ?? null,
      dataEntrada: data.dataEntrada || new Date(),
      quilometragem: data.quilometragem ?? veiculo.quilometragem,
      problemaRelatado: data.problemaRelatado,
      diagnostico: data.diagnostico,
      servicosRealizados: data.servicosRealizados,
      valorTotal: data.valorTotal ?? 0,
      status: data.status || 'em_andamento',
    }, conn);

    for (const peca of pecas) {
      await osRepository.addPeca({
        osId: id,
        pecaId: peca.pecaId,
        quantidade: Number(peca.quantidade ?? 1),
        precoUnitario: Number(peca.precoUnitario ?? 0),
      }, conn);
    }
    return id;
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'OS_CRIADA',
    referencia: `os#${osId}`,
    detalhes: `OS aberta para ${veiculo.placa} (km ${data.quilometragem ?? veiculo.quilometragem}).`,
  });

  return get(osId, context);
}

export async function update(id, data, context) {
  const oficinaId = requireOficina(context);
  const os = await get(id, context);
  if (os.status === 'concluida' || os.status === 'cancelada') {
    throw conflict('Não é possível editar uma OS concluída ou cancelada.');
  }
  if (data.status && !STATUS.includes(data.status)) throw badRequest('Status de OS inválido.');
  if (data.status === 'concluida') return finalizar(id, data, context);

  if (data.funcionarioId) {
    const funcionario = await funcionarioRepository.findById(data.funcionarioId, oficinaId);
    if (!funcionario) throw badRequest('Mecânico informado não pertence a esta oficina.');
  }

  const fields = {};
  const map = {
    funcionarioId: 'funcionario_id',
    quilometragem: 'quilometragem',
    problemaRelatado: 'problema_relatado',
    diagnostico: 'diagnostico',
    servicosRealizados: 'servicos_realizados',
    valorTotal: 'valor_total',
    status: 'status',
  };
  for (const [key, column] of Object.entries(map)) {
    if (data[key] !== undefined) fields[column] = data[key];
  }

  await osRepository.update(id, oficinaId, fields);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'OS_ATUALIZADA',
    referencia: `os#${id}`,
    detalhes: `Campos alterados: ${Object.keys(fields).join(', ')}.`,
  });
  return get(id, context);
}

export async function addPeca(id, data, context) {
  const oficinaId = requireOficina(context);
  const os = await get(id, context);
  if (os.status === 'concluida' || os.status === 'cancelada') {
    throw conflict('Não é possível adicionar peças a uma OS encerrada.');
  }
  const peca = await estoqueRepository.findById(data.pecaId, oficinaId);
  if (!peca) throw badRequest('Peça não encontrada nesta oficina.');
  const quantidade = Number(data.quantidade ?? 1);
  if (!Number.isInteger(quantidade) || quantidade <= 0) throw badRequest('Quantidade deve ser um inteiro positivo.');

  await withTransaction(async (conn) => {
    await osRepository.addPeca({
      osId: id,
      pecaId: data.pecaId,
      quantidade,
      precoUnitario: data.precoUnitario ?? peca.preco_unitario,
    }, conn);
    await osRepository.update(id, oficinaId, {
      valor_total: Number(os.valor_total) + quantidade * Number(data.precoUnitario ?? peca.preco_unitario),
    }, conn);
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'OS_PECA_ADICIONADA',
    referencia: `os#${id}`,
    detalhes: `${quantidade}x ${peca.nome} adicionadas à OS (baixa ocorrerá na conclusão).`,
  });
  return get(id, context);
}

export async function cancel(id, context) {
  const oficinaId = requireOficina(context);
  const os = await get(id, context);
  if (os.status === 'concluida') throw conflict('Uma OS concluída não pode ser cancelada.');
  await osRepository.update(id, oficinaId, { status: 'cancelada' });
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId,
    acao: 'OS_CANCELADA',
    referencia: `os#${id}`,
    detalhes: 'Ordem de serviço cancelada.',
  });
  return get(id, context);
}

/**
 * REGRA CRÍTICA — conclusão de OS em transação SQL única:
 *  1) baixa de estoque com movimentação de saída (lock FOR UPDATE),
 *  2) atualização da quilometragem do veículo,
 *  3) gravação imutável no Histórico Digital Portátil,
 *  4) atualização da OS (status + conclusão) e log de auditoria.
 * Se qualquer passa falhar, toda a transação é revertida.
 */
export async function finalizar(id, payload = {}, context) {
  const oficinaId = requireOficina(context);
  const os = await osRepository.findById(id);
  if (!os || Number(os.oficina_id) !== oficinaId) throw notFound('Ordem de serviço não encontrada nesta oficina.');
  if (os.status === 'concluida') throw conflict('Esta OS já está concluída.');
  if (os.status === 'cancelada') throw conflict('Esta OS foi cancelada e não pode ser concluída.');

  const pecas = await osRepository.listPecas(id);
  const km = Number(payload.quilometragem ?? os.quilometragem ?? 0);
  const dataServico = new Date();
  const diagnostico = payload.diagnostico ?? os.diagnostico ?? null;
  const servicos = payload.servicosRealizados ?? os.servicos_realizados ?? null;
  const valorTotal = payload.valorTotal !== undefined ? Number(payload.valorTotal) : Number(os.valor_total);

  const historicoId = await withTransaction(async (conn) => {
    // (1) Baixa de estoque — bloqueia linha para evitar condições de corrida.
    for (const peca of pecas) {
      const quantidade = Number(peca.quantidade);
      const locked = await estoqueRepository.lockForUpdate(peca.peca_id, oficinaId, conn);
      if (!locked) throw new AppError(`Peça ${peca.peca_nome} não existe mais no estoque da oficina.`, 409);
      if (Number(locked.quantidade) < quantidade) {
        throw new AppError(
          `Estoque insuficiente para "${locked.nome}": disponível ${locked.quantidade}, necessário ${quantidade}.`,
          409,
        );
      }
      await estoqueRepository.adjustQuantity(peca.peca_id, oficinaId, -quantidade, conn);
      await estoqueRepository.addMovimentacao({
        pecaId: peca.peca_id,
        oficinaId,
        tipo: 'saida',
        quantidade,
        motivo: `Baixa automática — conclusão da OS #${id}`,
        osId: id,
      }, conn);
    }

    // (2) Quilometragem atualizada do veículo.
    await veiculoRepository.updateKm(os.veiculo_id, km, conn);

    // (3) OS concluída.
    await osRepository.update(id, oficinaId, {
      status: 'concluida',
      concluida_em: dataServico,
      quilometragem: km,
      diagnostico,
      servicos_realizados: servicos,
      valor_total: valorTotal,
    }, conn);

    // (4) Histórico imutável pertencente ao VEÍCULO (sobrevive a troca de oficina).
    const pecasSubstituidas = pecas.length
      ? pecas.map((p) => `${p.peca_nome} (${p.quantidade}x)`).join('; ')
      : 'Nenhuma peça substituída.';

    const novoHistoricoId = await historicoRepository.insert({
      veiculoId: os.veiculo_id,
      oficinaId,
      osId: id,
      dataServico,
      quilometragem: km,
      diagnostico,
      servicosRealizados: servicos,
      pecasSubstituidas,
      valorTotal,
    }, conn);

    // (5) Auditoria na mesma transação.
    await auditoriaRepository.insert({
      usuarioId: context.id,
      oficinaId,
      acao: 'OS_CONCLUIDA',
      referencia: `os#${id}`,
      detalhes: `Histórico #${novoHistoricoId} gravado; ${pecas.length} peça(s) baixada(s); km atualizado para ${km}.`,
    }, conn);

    return novoHistoricoId;
  });

  return {
    os: await osRepository.findById(id),
    historicoId,
    message: 'OS concluída: histórico registrado, estoque baixado e quilometragem atualizada.',
  };
}
