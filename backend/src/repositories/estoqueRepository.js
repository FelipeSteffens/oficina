import { pool, query, queryOne } from '../config/db.js';

export async function listByOficina(oficinaId, { search = '', lowOnly = false } = {}) {
  const params = [oficinaId];
  let where = 'WHERE p.oficina_id = ?';
  if (search) {
    where += ' AND (p.nome LIKE ? OR p.codigo LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (lowOnly) where += ' AND p.quantidade <= p.estoque_minimo';
  return query(
    `SELECT p.*, CASE WHEN p.quantidade <= p.estoque_minimo THEN 1 ELSE 0 END AS estoque_baixo
       FROM estoque_pecas p
       ${where}
      ORDER BY estoque_baixo DESC, p.nome ASC`,
    params,
  );
}

export async function findById(id, oficinaId = null) {
  if (oficinaId !== null) {
    return queryOne('SELECT * FROM estoque_pecas WHERE id = ? AND oficina_id = ?', [id, oficinaId]);
  }
  return queryOne('SELECT * FROM estoque_pecas WHERE id = ?', [id]);
}

export async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO estoque_pecas (oficina_id, nome, codigo, quantidade, preco_unitario, estoque_minimo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.oficinaId, data.nome, data.codigo, data.quantidade ?? 0,
      data.precoUnitario ?? 0, data.estoqueMinimo ?? 0],
  );
  return findById(result.insertId, data.oficinaId);
}

export async function update(id, oficinaId, fields, conn = null) {
  const executor = conn || pool;
  const allowed = ['nome', 'codigo', 'quantidade', 'preco_unitario', 'estoque_minimo'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return { affectedRows: 0 };
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  const [result] = await executor.execute(`UPDATE estoque_pecas SET ${sets} WHERE id = ? AND oficina_id = ?`,
    [...entries.map(([, value]) => value), id, oficinaId]);
  return { affectedRows: result.affectedRows };
}

export async function remove(id, oficinaId) {
  return pool.execute('DELETE FROM estoque_pecas WHERE id = ? AND oficina_id = ?', [id, oficinaId]);
}

export async function adjustQuantity(id, oficinaId, delta, conn = null) {
  const executor = conn || pool;
  await executor.execute(
    'UPDATE estoque_pecas SET quantidade = quantidade + ? WHERE id = ? AND oficina_id = ?',
    [delta, id, oficinaId],
  );
}

/** Bloqueia a linha para leitura dentro da transação (evita estoque negativo em concorrência). */
export async function lockForUpdate(id, oficinaId, conn) {
  const [rows] = await conn.execute(
    'SELECT id, quantidade, nome, preco_unitario FROM estoque_pecas WHERE id = ? AND oficina_id = ? FOR UPDATE',
    [id, oficinaId],
  );
  return rows[0] || null;
}

export async function addMovimentacao({ pecaId, oficinaId, tipo, quantidade, motivo, osId = null }, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO estoque_movimentacoes (peca_id, oficina_id, tipo, quantidade, motivo, os_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [pecaId, oficinaId, tipo, quantidade, motivo, osId],
  );
  return result.insertId;
}

export async function listMovimentacoes(oficinaId, limit = 100) {
  return query(
    `SELECT m.*, p.nome AS peca_nome, p.codigo AS peca_codigo,
            os.id AS os_numero
       FROM estoque_movimentacoes m
       LEFT JOIN estoque_pecas p ON p.id = m.peca_id
       LEFT JOIN ordens_servico os ON os.id = m.os_id
      WHERE m.oficina_id = ?
      ORDER BY m.data_hora DESC
      LIMIT ?`,
    [oficinaId, Number(limit)],
  );
}
