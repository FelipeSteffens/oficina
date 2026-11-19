import * as osService from '../services/osService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await osService.list(req.user, {
    veiculoId: req.query.veiculoId || null,
    status: req.query.status || null,
    search: req.query.search || '',
  }));
}

export async function get(req, res) {
  return ok(res, await osService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await osService.create(req.body || {}, req.user), 'Ordem de serviço aberta.');
}

export async function update(req, res) {
  return ok(res, await osService.update(req.params.id, req.body || {}, req.user), 'Ordem de serviço atualizada.');
}

export async function addPeca(req, res) {
  return ok(res, await osService.addPeca(req.params.id, req.body || {}, req.user), 'Peça adicionada à OS.');
}

export async function cancel(req, res) {
  return ok(res, await osService.cancel(req.params.id, req.user), 'Ordem de serviço cancelada.');
}

export async function finalizar(req, res) {
  return ok(res, await osService.finalizar(req.params.id, req.body || {}, req.user));
}
