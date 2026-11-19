import * as estoqueService from '../services/estoqueService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await estoqueService.list(req.user, {
    search: req.query.search || '',
    lowOnly: req.query.lowOnly === 'true',
  }));
}

export async function get(req, res) {
  return ok(res, await estoqueService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await estoqueService.create(req.body || {}, req.user), 'Peça cadastrada no estoque.');
}

export async function update(req, res) {
  return ok(res, await estoqueService.update(req.params.id, req.body || {}, req.user), 'Peça atualizada.');
}

export async function remove(req, res) {
  return ok(res, await estoqueService.remove(req.params.id, req.user), 'Peça removida.');
}

export async function entrada(req, res) {
  return ok(res, await estoqueService.registerEntrada(req.params.id, req.body || {}, req.user), 'Entrada registrada.');
}

export async function movimentacoes(req, res) {
  return ok(res, await estoqueService.listMovimentacoes(req.user, req.query.limit || 100));
}
