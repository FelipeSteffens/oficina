import * as contatoService from '../services/contatoService.js';
import { ok, created } from '../utils/response.js';

export async function create(req, res) {
  return created(res, await contatoService.create(req.body || {}));
}

export async function listAll(_req, res) {
  return ok(res, await contatoService.listAll());
}
