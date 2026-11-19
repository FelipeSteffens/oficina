import * as historicoService from '../services/historicoService.js';
import { ok } from '../utils/response.js';

export async function listByVeiculo(req, res) {
  return ok(res, await historicoService.listByVeiculo(req.params.veiculoId, req.user));
}

export async function listForCliente(req, res) {
  return ok(res, await historicoService.listForCliente(req.user));
}
