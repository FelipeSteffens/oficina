import * as dashboardService from '../services/dashboardService.js';
import { ok } from '../utils/response.js';

export async function oficina(req, res) {
  return ok(res, await dashboardService.oficinaDashboard(req.user));
}

export async function cliente(req, res) {
  return ok(res, await dashboardService.clienteDashboard(req.user));
}

export async function global(_req, res) {
  return ok(res, await dashboardService.globalDashboard());
}
