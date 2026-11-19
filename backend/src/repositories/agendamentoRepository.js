import { pool, query, queryOne } from '../config/db.js';

const FULL_SELECT = `
  SELECT a.*, v.marca, v.modelo, v.placa, v.ano,
         c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone,
         o.nome AS oficina_nome, o.telefone AS oficina_telefone
    FROM agendamentos a
    JOIN veiculos v ON v.id = a.veiculo_id
    JOIN clientes c ON c.id = a.cliente_id
    JOIN oficinas o ON o.id = a.oficina_id
`;

export async function listByFilters(filters = {}) {
  const { clienteId = null, oficinaId = null, status = null, upcomingOnly = false } = filters;
  const where = [];
  const params = [];

  if (clienteId !== null) { where.push('a.cliente_id = ?'); params.push(clienteId); }
  if (oficinaId !== null) { where.push('a.oficina_id = ?'); params.push(oficinaId); }
  if (status) { where.push('a.status = ?'); params.push(status); }
  if (upcomingOnly) { where.push('a.data_agendamento >= CURDATE()'); }

  const sql = `${FULL_SELECT}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.data_agendamento ASC, a.horario ASC`;
  return query(sql, params);
}

export async function findById(id) {
  return queryOne(`${FULL_SELECT} WHERE a.id = ? LIMIT 1`, [id]);
}

export async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO agendamentos (veiculo_id, cliente_id, oficina_id, data_agendamento, horario, observacoes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.veiculoId, data.clienteId, data.oficinaId, data.dataAgendamento, data.horario,
      data.observacoes || null, data.status || 'pendente'],
  );
  return findById(result.insertId);
}

export async function update(id, fields, oficinaId = null) {
  const allowed = ['data_agendamento', 'horario', 'observacoes', 'status'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  const params = [...entries.map(([, value]) => value), id];
  let where = 'id = ?';
  if (oficinaId !== null) { where += ' AND oficina_id = ?'; params.push(oficinaId); }
  await pool.execute(`UPDATE agendamentos SET ${sets} WHERE ${where}`, params);
  return findById(id);
}

export async function remove(id, oficinaId = null) {
  const params = [id];
  let where = 'id = ?';
  if (oficinaId !== null) { where += ' AND oficina_id = ?'; params.push(oficinaId); }
  return pool.execute(`DELETE FROM agendamentos WHERE ${where}`, params);
}
