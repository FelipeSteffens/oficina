import * as veiculoRepository from '../repositories/veiculoRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { badRequest, conflict, forbidden, notFound } from '../utils/AppError.js';
import { normalizePlate, formatPlate } from '../utils/formatters.js';

function isCliente(context) {
  return context.perfil === 'cliente';
}

function requireCliente(context) {
  if (!context.clienteId) throw badRequest('Perfil sem cadastro de cliente.');
  return Number(context.clienteId);
}

function requireOficina(context) {
  if (!context.oficinaId) throw badRequest('Perfil sem oficina vinculada.');
  return Number(context.oficinaId);
}

/** Garante que o veículo pertence ao cliente ou está autorizado para a oficina do usuário. */
export async function assertAccess(veiculoId, context) {
  const veiculo = await veiculoRepository.findWithOwner(veiculoId);
  if (!veiculo) throw notFound('Veículo não encontrado.');

  if (isCliente(context)) {
    if (Number(veiculo.cliente_id) !== Number(context.clienteId)) {
      throw forbidden('Este veículo não pertence ao seu cadastro.');
    }
  } else if (context.perfil === 'admin_geral') {
    return veiculo;
  } else {
    const vinculo = await veiculoRepository.findAuthorization(veiculoId, context.oficinaId);
    if (!vinculo || vinculo.status !== 'autorizado') {
      throw forbidden('Este veículo não está autorizado para a sua oficina.');
    }
  }
  return veiculo;
}

export async function list(context) {
  if (isCliente(context)) return veiculoRepository.listByCliente(requireCliente(context));
  if (context.perfil === 'admin_geral') return listAll();
  return veiculoRepository.listAuthorizedByOficina(requireOficina(context));
}

export async function listAll() {
  return veiculoRepository.listAllVehicles();
}

export async function get(id, context) {
  const veiculo = await assertAccess(id, context);
  return {
    ...veiculo,
    placa_formatada: formatPlate(veiculo.placa),
    vinculos: isCliente(context) ? await veiculoRepository.listVinculos(id) : undefined,
  };
}

export async function create(data, context) {
  if (!isCliente(context)) throw forbidden('Somente clientes podem cadastrar veículos na garagem.');
  if (!data.marca || !data.modelo || !data.ano || !data.placa) {
    throw badRequest('Marca, modelo, ano e placa são obrigatórios.');
  }
  const placa = normalizePlate(data.placa);
  if (placa.length !== 7) throw badRequest('A placa deve ter 7 caracteres (ex.: ABC1D23).');
  if (await veiculoRepository.findByPlaca(placa)) throw conflict('Já existe um veículo com esta placa.');

  const veiculo = await veiculoRepository.create({
    clienteId: requireCliente(context),
    marca: data.marca,
    modelo: data.modelo,
    ano: Number(data.ano),
    placa,
    cor: data.cor,
    quilometragem: data.quilometragem ?? 0,
    combustivel: data.combustivel,
    chassi: data.chassi,
  });

  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: null,
    acao: 'VEICULO_CRIADO',
    referencia: `veiculo#${veiculo.id}`,
    detalhes: `Veículo ${veiculo.marca} ${veiculo.modelo} (${placa}) cadastrado.`,
  });
  return veiculo;
}

export async function update(id, data, context) {
  if (!isCliente(context)) throw forbidden('Somente o proprietário pode editar o veículo.');
  const veiculo = await assertAccess(id, context);
  const fields = {};
  for (const key of ['marca', 'modelo', 'ano', 'cor', 'quilometragem', 'combustivel', 'chassi']) {
    if (data[key] !== undefined) fields[key] = data[key];
  }
  if (data.placa !== undefined) {
    const placa = normalizePlate(data.placa);
    if (placa.length !== 7) throw badRequest('A placa deve ter 7 caracteres.');
    const existing = await veiculoRepository.findByPlaca(placa);
    if (existing && Number(existing.id) !== Number(id)) throw conflict('Já existe um veículo com esta placa.');
    fields.placa = placa;
  }

  const updated = await veiculoRepository.update(id, fields);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: null,
    acao: 'VEICULO_ATUALIZADO',
    referencia: `veiculo#${id}`,
    detalhes: `Campos alterados: ${Object.keys(fields).join(', ')} (km anterior: ${veiculo.quilometragem}).`,
  });
  return updated;
}

export async function remove(id, context) {
  if (!isCliente(context)) throw forbidden('Somente o proprietário pode remover o veículo.');
  const veiculo = await assertAccess(id, context);
  await veiculoRepository.remove(id);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: null,
    acao: 'VEICULO_REMOVIDO',
    referencia: `veiculo#${id}`,
    detalhes: `Veículo ${veiculo.placa} removido da garagem.`,
  });
  return { id: Number(id) };
}

/** Cliente autoriza ou revoga o vínculo do seu veículo com uma oficina. */
export async function setVinculo(veiculoId, oficinaId, status, context) {
  if (!isCliente(context)) throw forbidden('Somente o proprietário pode autorizar oficinas.');
  if (!['autorizado', 'revogado'].includes(status)) throw badRequest('Status de vínculo inválido.');
  const veiculo = await assertAccess(veiculoId, context);

  await veiculoRepository.upsertVinculo(veiculoId, oficinaId, status);
  await auditoriaRepository.insert({
    usuarioId: context.id,
    oficinaId: Number(oficinaId),
    acao: status === 'autorizado' ? 'VEICULO_VINCULADO' : 'VEICULO_DESVINCULADO',
    referencia: `veiculo#${veiculoId}`,
    detalhes: `Vínculo do veículo ${veiculo.placa} com a oficina #${oficinaId} alterado para ${status}.`,
  });

  return veiculoRepository.listVinculos(veiculoId);
}

export async function listVinculos(veiculoId, context) {
  await assertAccess(veiculoId, context);
  return veiculoRepository.listVinculos(veiculoId);
}

export async function listOficinasDisponiveis(context) {
  if (!isCliente(context)) throw forbidden('Apenas clientes gerenciam autorizações.');
  return veiculoRepository.listAllOficinas();
}

export async function listByOficina(context, search = '') {
  return veiculoRepository.listAuthorizedByOficina(requireOficina(context), search);
}
