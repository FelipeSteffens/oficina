import * as historicoRepository from '../repositories/historicoRepository.js';
import * as veiculoRepository from '../repositories/veiculoRepository.js';
import { assertAccess } from './veiculoService.js';
import { notFound } from '../utils/AppError.js';

export async function listByVeiculo(veiculoId, context) {
  await assertAccess(veiculoId, context);
  const veiculo = await veiculoRepository.findWithOwner(veiculoId);
  if (!veiculo) throw notFound('Veículo não encontrado.');
  return {
    veiculo: {
      id: veiculo.id,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      ano: veiculo.ano,
      quilometragem: veiculo.quilometragem,
      cliente_nome: veiculo.cliente_nome,
    },
    registros: await historicoRepository.listByVeiculo(veiculoId),
  };
}

export async function listForCliente(context) {
  if (!context.clienteId) return [];
  const veiculos = await veiculoRepository.listByCliente(context.clienteId);
  const results = await Promise.all(veiculos.map(async (veiculo) => ({
    veiculo_id: veiculo.id,
    placa: veiculo.placa,
    modelo: `${veiculo.marca} ${veiculo.modelo}`,
    registros: await historicoRepository.listByVeiculo(veiculo.id),
  })));
  return results.filter((item) => item.registros.length > 0);
}
