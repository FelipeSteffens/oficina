import { pool, query, queryOne } from '../config/db.js';

const BASE_SELECT = `
  SELECT f.id, f.usuario_id, f.oficina_id, f.nome, f.contato, f.funcao, f.criado_em,
         u.email, u.ativo AS usuario_ativo
    FROM funcionarios f
    LEFT JOIN usuarios u ON u.id = f.usuario_id
`;

export async function listByOficina(oficinaId, includeAdmins = true) {
  const rows = await query(`${BASE_SELECT} WHERE f.oficina_id = ? ORDER BY f.id ASC`, [oficinaId]);
  return includeAdmins ? rows : rows.filter((row) => !/administrad/i.test(row.funcao));
}

export async function findById(id, oficinaId = null, conn = null) {
  const executor = conn || pool;
  const params = [id];
  let where = 'WHERE f.id = ?';
  if (oficinaId !== null) {
    where += ' AND f.oficina_id = ?';
    params.push(oficinaId);
  }
  const [rows] = await executor.execute(`${BASE_SELECT} ${where} LIMIT 1`, params);
  return rows[0] ?? null;
}

export async function findByUsuarioId(usuarioId) {
  return queryOne(`${BASE_SELECT} WHERE f.usuario_id = ? LIMIT 1`, [usuarioId]);
}

export async function create({ usuarioId = null, oficinaId, nome, contato, funcao }, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO funcionarios (usuario_id, oficina_id, nome, contato, funcao)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, oficinaId, nome, contato, funcao],
  );
  return findById(result.insertId, oficinaId, conn);
}

export async function update(id, oficinaId, fields, conn = null) {
  const executor = conn || pool;
  const allowed = ['nome', 'contato', 'funcao'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id, oficinaId, conn);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await executor.execute(
    `UPDATE funcionarios SET ${sets} WHERE id = ? AND oficina_id = ?`,
    [...entries.map(([, value]) => value), id, oficinaId],
  );
  return findById(id, oficinaId, conn);
}

export async function remove(id, oficinaId, conn = null) {
  const executor = conn || pool;
  return executor.execute('DELETE FROM funcionarios WHERE id = ? AND oficina_id = ?', [id, oficinaId]);
}
