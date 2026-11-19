import * as authService from '../services/authService.js';
import { ok, created } from '../utils/response.js';

export async function login(req, res) {
  const session = await authService.login(req.body?.email, req.body?.senha);
  return ok(res, session, 'Login realizado com sucesso.');
}

export async function registerCliente(req, res) {
  const session = await authService.registerCliente(req.body || {});
  return created(res, session, 'Cadastro realizado! Bem-vindo à AutoTrack Pro.');
}

export async function registerOficina(req, res) {
  const session = await authService.registerOficina(req.body || {});
  return created(res, session, 'Oficina cadastrada com sucesso!');
}

export async function me(req, res) {
  return ok(res, await authService.me(req.user));
}
