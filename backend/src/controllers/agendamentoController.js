import * as agendamentoService from '../services/agendamentoService.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res) {
  return ok(res, await agendamentoService.list(req.user, {
    status: req.query.status || null,
    upcomingOnly: req.query.upcomingOnly === 'true',
  }));
}

export async function get(req, res) {
  return ok(res, await agendamentoService.get(req.params.id, req.user));
}

export async function create(req, res) {
  return created(res, await agendamentoService.create(req.body || {}, req.user), 'Agendamento solicitado.');
}

export async function update(req, res) {
  return ok(res, await agendamentoService.update(req.params.id, req.body || {}, req.user), 'Agendamento atualizado.');
}

export async function remove(req, res) {
  return ok(res, await agendamentoService.remove(req.params.id, req.user), 'Agendamento removido.');
}
