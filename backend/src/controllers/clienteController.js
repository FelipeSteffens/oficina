import * as clienteService from '../services/clienteService.js';
import { ok } from '../utils/response.js';

export async function perfil(req, res) {
  return ok(res, await clienteService.getPerfil(req.user));
}

export async function updatePerfil(req, res) {
  return ok(res, await clienteService.updatePerfil(req.body || {}, req.user), 'Perfil atualizado com sucesso.');
}

export async function listAll(_req, res) {
  return ok(res, await clienteService.listAll());
}
