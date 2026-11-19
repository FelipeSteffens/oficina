import * as agendamentoRepository from '../repositories/agendamentoRepository.js';
import * as veiculoRepository from '../repositories/veiculoRepository.js';
import * as oficinaRepository from '../repositories/oficinaRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { appointmentMessage, buildWhatsappLink } from '../utils/whatsapp.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';

const STATUS = ['pendente', 'confirmado', 'concluido', 'cancelado'];

function filtersFor(context) {
  if (context.perfil === 'cliente') return { clienteId: context.clienteId };
  if (context.perfil === 'admin_geral') return {};
  return { oficinaId: context.oficinaId };
}

async function assertAccess(agendamento, context) {
  if (context.perfil === 'admin_geral') return;
  if (context.perfil === 'cliente' && Number(agendamento.cliente_id) !== Number(context.clienteId)) {
    throw forbidden('Este agendamento não pertence ao seu cadastro.');
  }
  if (context.perfil !== 'cliente' && Number(agendamento.oficina_id) !== Number(context.oficinaId)) {
    throw forbidden('Este agendamento pertence a outra oficina.');
  }
}

export async function list(context, extra = {}) {
  return agendamentoRepository.listByFilters({ ...filtersFor(context), ...extra });
}

export async function get(id, context) {
  const agendamento = await agendamentoRepository.findById(id);
  if (!agendamento) throw notFound('Agendamento não encontrado.');
  await assertAccess(agendamento, context);
  return agendamento;
}

export async function create(data, context) {
  if (!data.veiculoId || !data.dataAgendamento || !data.horario) {
    throw badRequest('Veículo, data e horário são obrigatórios.');
  }

  // A oficina é inferida do contexto (equipe) ou da primeira oficina autorizada (cliente).
  let oficinaId = data.oficinaId ?? (context.perfil === 'cliente' ? null : context.oficinaId);
  if (!oficinaId) {
    const autorizadas = await veiculoRepository.listAuthorizedOficinas(data.veiculoId);
    oficinaId = autorizadas[0]?.id ?? null;
  }
  if (!oficinaId) throw badRequest('Nenhuma oficina autorizada para este veículo. Autorize uma oficina na Garagem Digital.');

  const oficina = await oficinaRepository.findById(oficinaId);
  if (!oficina || !oficina.ativa) throw badRequest('Oficina indisponível no momento.');

  const veiculo = await veiculoRepository.findWithOwner(data.veiculoId);
  if (!veiculo) throw notFound('Veículo não encontrado.');
  if (context.perfil === 'cliente' && Number(veiculo.cliente_id) !== Number(context.clienteId)) {
    throw forbidden('O veículo informado não pertence ao seu cadastro.');
  }
  const vinculo = await veiculoRepository.findAuthorization(data.veiculoId, oficinaId);
  if (!vinculo || vinculo.status !== 'autorizado') {
    throw badRequest('O veículo ainda não está autorizado para esta oficina. Autorize-o na Garagem Digital.');
  }

  const agendamento = await agendamentoRepository.create({
    ...data,
    oficinaId: Number(oficinaId),
    clienteId: veiculo.cliente_id,
    status: data.status || 'pendente',
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: Number(oficinaId),
    acao: 'AGENDAMENTO_CRIADO',
    referencia: `agendamento#${agendamento.id}`,
    detalhes: `Agendamento para ${agendamento.data_agendamento} às ${agendamento.horario}.`,
  });

  return {
    ...agendamento,
    whatsappLink: buildWhatsappLink(oficina.telefone, appointmentMessage({
      oficina: oficina.nome,
      veiculo: `${agendamento.marca} ${agendamento.modelo} — ${agendamento.placa}`,
      data: agendamento.data_agendamento,
      horario: agendamento.horario,
    })),
  };
}

export async function update(id, data, context) {
  const agendamento = await get(id, context);
  if (data.status && !STATUS.includes(data.status)) throw badRequest('Status de agendamento inválido.');

  if (context.perfil === 'cliente') {
    if (data.status && !['cancelado', 'pendente'].includes(data.status)) {
      throw forbidden('Clientes podem apenas cancelar ou reagendar solicitações.');
    }
    if (agendamento.status === 'confirmado' && data.status !== 'cancelado') {
      throw badRequest('Agendamento já confirmado. Entre em contato com a oficina para alterações.');
    }
  }

  const fields = {};
  const aliases = {
    dataAgendamento: 'data_agendamento',
    data_agendamento: 'data_agendamento',
    horario: 'horario',
    observacoes: 'observacoes',
    status: 'status',
  };
  for (const [key, column] of Object.entries(aliases)) {
    if (data[key] !== undefined) fields[column] = data[key];
  }
  const atualizado = await agendamentoRepository.update(id, fields);

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: agendamento.oficina_id,
    acao: 'AGENDAMENTO_ATUALIZADO',
    referencia: `agendamento#${id}`,
    detalhes: `Campos alterados: ${Object.keys(fields).join(', ')}.`,
  });

  const oficina = await oficinaRepository.findById(agendamento.oficina_id);
  return {
    ...atualizado,
    whatsappLink: buildWhatsappLink(oficina?.telefone, appointmentMessage({
      oficina: oficina?.nome || 'oficina',
      veiculo: `${atualizado.marca} ${atualizado.modelo} — ${atualizado.placa}`,
      data: atualizado.data_agendamento,
      horario: atualizado.horario,
    })),
  };
}

export async function remove(id, context) {
  const agendamento = await get(id, context);
  await agendamentoRepository.remove(id);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: agendamento.oficina_id,
    acao: 'AGENDAMENTO_REMOVIDO',
    referencia: `agendamento#${id}`,
    detalhes: 'Agendamento removido.',
  });
  return { id: Number(id) };
}
