import { query, queryOne } from '../config/db.js';

export async function oficinaKpis(oficinaId) {
  return queryOne(
    `SELECT
       (SELECT COUNT(*) FROM ordens_servico WHERE oficina_id = ? AND status IN ('aguardando_aprovacao','em_andamento','aguardando_pecas')) AS servicos_andamento,
       (SELECT COUNT(*) FROM orcamentos WHERE oficina_id = ? AND status = 'pendente') AS orcamentos_pendentes,
       (SELECT COUNT(*) FROM ordens_servico WHERE oficina_id = ? AND status = 'concluida'
         AND concluida_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS concluidas_mes,
       (SELECT COALESCE(SUM(valor_total),0) FROM ordens_servico WHERE oficina_id = ? AND status = 'concluida'
         AND concluida_em >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) AS faturamento_mes,
       (SELECT COUNT(*) FROM estoque_pecas WHERE oficina_id = ? AND quantidade <= estoque_minimo) AS estoque_baixo,
       (SELECT COUNT(*) FROM agendamentos WHERE oficina_id = ? AND status IN ('pendente','confirmado')
         AND data_agendamento >= CURDATE()) AS agendamentos_futuros`,
    [oficinaId, oficinaId, oficinaId, oficinaId, oficinaId, oficinaId],
  );
}

export async function oficinaOsPorMes(oficinaId) {
  return query(
    `SELECT DATE_FORMAT(data_entrada, '%Y-%m') AS mes,
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
            COALESCE(SUM(CASE WHEN status = 'concluida' THEN valor_total ELSE 0 END),0) AS faturamento
       FROM ordens_servico
      WHERE oficina_id = ? AND data_entrada >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(data_entrada, '%Y-%m')
      ORDER BY mes ASC`,
    [oficinaId],
  );
}

export async function oficinaStatusSeries(oficinaId) {
  return query(
    `SELECT status, COUNT(*) AS total FROM ordens_servico WHERE oficina_id = ? GROUP BY status`,
    [oficinaId],
  );
}

export async function clienteKpis(clienteId) {
  return queryOne(
    `SELECT
       (SELECT COUNT(*) FROM veiculos WHERE cliente_id = ?) AS veiculos,
       (SELECT COUNT(*) FROM ordens_servico WHERE cliente_id = ? AND status IN ('em_andamento','aguardando_pecas','aguardando_aprovacao')) AS servicos_andamento,
       (SELECT COUNT(*) FROM orcamentos WHERE cliente_id = ? AND status = 'pendente') AS orcamentos_pendentes,
       (SELECT COUNT(*) FROM agendamentos WHERE cliente_id = ? AND status IN ('pendente','confirmado') AND data_agendamento >= CURDATE()) AS agendamentos_futuros,
       (SELECT COUNT(*) FROM historico_veiculos h JOIN veiculos v ON v.id = h.veiculo_id WHERE v.cliente_id = ?) AS total_manutencoes`,
    [clienteId, clienteId, clienteId, clienteId, clienteId],
  );
}

export async function globalKpis() {
  return queryOne(
    `SELECT
       (SELECT COUNT(*) FROM oficinas) AS total_oficinas,
       (SELECT COUNT(*) FROM oficinas WHERE ativa = 1) AS oficinas_ativas,
       (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
       (SELECT COUNT(*) FROM clientes) AS total_clientes,
       (SELECT COUNT(*) FROM veiculos) AS total_veiculos,
       (SELECT COUNT(*) FROM ordens_servico) AS total_os,
       (SELECT COUNT(*) FROM ordens_servico WHERE status = 'concluida') AS os_concluidas,
       (SELECT COALESCE(SUM(valor_total),0) FROM ordens_servico WHERE status = 'concluida') AS faturamento_total,
       (SELECT COUNT(*) FROM orcamentos WHERE status = 'pendente') AS orcamentos_pendentes`,
  );
}
