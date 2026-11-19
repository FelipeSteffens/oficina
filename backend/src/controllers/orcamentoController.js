import * as orcamentoService from '../services/orcamentoService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await orcamentoService.list(req.user, { status: req.query.status || null }));
}

export async function get(req, res) {
  return ok(res, await orcamentoService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await orcamentoService.create(req.body || {}, req.user), 'Orçamento enviado ao cliente.');
}

export async function aprovar(req, res) {
  return ok(res, await orcamentoService.updateStatus(req.params.id, 'aprovado', req.user), 'Orçamento aprovado!');
}

export async function recusar(req, res) {
  return ok(res, await orcamentoService.updateStatus(req.params.id, 'recusado', req.user), 'Orçamento recusado.');
}

export async function converter(req, res) {
  return created(res, await orcamentoService.convertToOs(req.params.id, req.body || {}, req.user),
    'OS gerada com sucesso a partir do orçamento aprovado.');
}
