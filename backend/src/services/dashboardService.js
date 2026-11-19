import * as dashboardRepository from '../repositories/dashboardRepository.js';
import * as osRepository from '../repositories/osRepository.js';
import * as orcamentoRepository from '../repositories/orcamentoRepository.js';
import * as agendamentoRepository from '../repositories/agendamentoRepository.js';
import * as veiculoRepository from '../repositories/veiculoRepository.js';
import * as oficinaRepository from '../repositories/oficinaRepository.js';
import * as auditoriaRepository from '../repositories/auditoriaRepository.js';
import { badRequest } from '../utils/AppError.js';

export async function oficinaDashboard(context) {
  if (!context.oficinaId) throw badRequest('Perfil sem oficina vinculada.');
  const oficinaId = context.oficinaId;

  const [kpis, porMes, statusSeries, recentes, veiculos, agendamentos, orcamentos] = await Promise.all([
    dashboardRepository.oficinaKpis(oficinaId),
    dashboardRepository.oficinaOsPorMes(oficinaId),
    dashboardRepository.oficinaStatusSeries(oficinaId),
    osRepository.listByFilters({ oficinaId, search: '' }),
    veiculoRepository.listAuthorizedByOficina(oficinaId),
    agendamentoRepository.listByFilters({ oficinaId, upcomingOnly: true }),
    orcamentoRepository.listByFilters({ oficinaId, status: 'pendente' }),
  ]);

  return {
    kpis,
    osPorMes: porMes,
    statusSeries,
    atendimentosRecentes: recentes.slice(0, 6),
    veiculosAtendidos: veiculos.slice(0, 6),
    proximosAgendamentos: agendamentos.slice(0, 5),
    orcamentosPendentes: orcamentos.slice(0, 5),
  };
}

export async function clienteDashboard(context) {
  if (!context.clienteId) throw badRequest('Perfil sem cadastro de cliente.');
  const clienteId = context.clienteId;

  const [kpis, veiculos, os, orcamentos, agendamentos] = await Promise.all([
    dashboardRepository.clienteKpis(clienteId),
    veiculoRepository.listByCliente(clienteId),
    osRepository.listByFilters({ clienteId }),
    orcamentoRepository.listByFilters({ clienteId }),
    agendamentoRepository.listByFilters({ clienteId, upcomingOnly: true }),
  ]);

  return {
    kpis,
    veiculos,
    servicos: os.slice(0, 6),
    orcamentos: orcamentos.slice(0, 5),
    agendamentos: agendamentos.slice(0, 5),
  };
}

export async function globalDashboard() {
  const [kpis, oficinas, logs] = await Promise.all([
    dashboardRepository.globalKpis(),
    oficinaRepository.listAll(),
    auditoriaRepository.listGlobal(12),
  ]);
  return { kpis, oficinas, atividadeRecente: logs };
}
