import * as usuarioService from '../services/usuarioService.js';
import { ok } from '../utils/response.js';

export async function list(_req, res) {
  return ok(res, await usuarioService.list());
}

export async function get(req, res) {
  return ok(res, await usuarioService.get(req.params.id));
}

export async function update(req, res) {
  return ok(res, await usuarioService.update(req.params.id, req.body || {}, req.user), 'Usuário atualizado.');
}

export async function setActive(req, res) {
  const ativo = req.body?.ativo === undefined ? req.params.ativo !== 'false' : Boolean(req.body.ativo);
  return ok(res, await usuarioService.setActive(req.params.id, ativo, req.user), 'Status do usuário atualizado.');
}
