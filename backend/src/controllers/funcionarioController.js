import * as funcionarioService from '../services/funcionarioService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await funcionarioService.list(req.user));
}

export async function get(req, res) {
  return ok(res, await funcionarioService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await funcionarioService.create(req.body || {}, req.user), 'Funcionário cadastrado.');
}

export async function update(req, res) {
  return ok(res, await funcionarioService.update(req.params.id, req.body || {}, req.user), 'Funcionário atualizado.');
}

export async function remove(req, res) {
  return ok(res, await funcionarioService.remove(req.params.id, req.user), 'Funcionário removido.');
}
