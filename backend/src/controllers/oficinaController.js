import * as oficinaService from '../services/oficinaService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await oficinaService.list(req.user));
}

export async function get(req, res) {
  return ok(res, await oficinaService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await oficinaService.create(req.body || {}, req.user), 'Oficina criada.');
}

export async function update(req, res) {
  return ok(res, await oficinaService.update(req.params.id, req.body || {}, req.user), 'Oficina atualizada.');
}

export async function setActive(req, res) {
  const ativa = req.body?.ativa === undefined ? req.params.ativa !== 'false' : Boolean(req.body.ativa);
  return ok(res, await oficinaService.setActive(req.params.id, ativa, req.user), 'Status da oficina atualizado.');
}
