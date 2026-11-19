import { pool, query } from '../config/db.js';

export async function listByVeiculo(veiculoId) {
  return query(
    `SELECT h.*, o.nome AS oficina_nome, v.marca, v.modelo, v.placa
       FROM historico_veiculos h
       LEFT JOIN oficinas o ON o.id = h.oficina_id
       JOIN veiculos v ON v.id = h.veiculo_id
      WHERE h.veiculo_id = ?
      ORDER BY h.data_servico DESC, h.id DESC`,
    [veiculoId],
  );
}

export async function findByOs(osId) {
  const rows = await query('SELECT id FROM historico_veiculos WHERE os_id = ? LIMIT 1', [osId]);
  return rows[0] || null;
}

export async function insert(data, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO historico_veiculos (veiculo_id, oficina_id, os_id, data_servico, quilometragem,
                                     diagnostico, servicos_realizados, pecas_substituidas, valor_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.veiculoId, data.oficinaId, data.osId, data.dataServico || new Date(),
      data.quilometragem ?? 0, data.diagnostico || null, data.servicosRealizados || null,
      data.pecasSubstituidas || null, data.valorTotal ?? 0],
  );
  return result.insertId;
}
