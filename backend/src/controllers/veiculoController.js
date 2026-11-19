import * as veiculoService from '../services/veiculoService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await veiculoService.list(req.user));
}

export async function get(req, res) {
  return ok(res, await veiculoService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await veiculoService.create(req.body || {}, req.user), 'Veículo adicionado à garagem.');
}

export async function update(req, res) {
  return ok(res, await veiculoService.update(req.params.id, req.body || {}, req.user), 'Veículo atualizado.');
}

export async function remove(req, res) {
  return ok(res, await veiculoService.remove(req.params.id, req.user), 'Veículo removido.');
}

export async function listVinculos(req, res) {
  return ok(res, await veiculoService.listVinculos(req.params.id, req.user));
}

export async function setVinculo(req, res) {
  const status = req.body?.status === 'revogado' ? 'revogado' : 'autorizado';
  return ok(res, await veiculoService.setVinculo(req.params.id, req.params.oficinaId, status, req.user),
    status === 'autorizado' ? 'Oficina autorizada para este veículo.' : 'Autorização revogada.');
}

export async function listOficinasDisponiveis(req, res) {
  return ok(res, await veiculoService.listOficinasDisponiveis(req.user));
}

export async function listByOficina(req, res) {
  return ok(res, await veiculoService.listByOficina(req.user, req.query.search || ''));
}
