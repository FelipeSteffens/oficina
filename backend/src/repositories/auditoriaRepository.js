import { pool, query } from '../config/db.js';

export async function insert({ usuarioId = null, oficinaId = null, acao, referencia = null, detalhes = null }, conn = null) {
  const executor = conn || pool;
  await executor.execute(
    `INSERT INTO logs_auditoria (usuario_id, oficina_id, acao, referencia, detalhes)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, oficinaId, acao, referencia, detalhes],
  );
}

export async function listByOficina(oficinaId, limit = 100) {
  return query(
    `SELECT l.*, u.nome AS usuario_nome
       FROM logs_auditoria l LEFT JOIN usuarios u ON u.id = l.usuario_id
      WHERE l.oficina_id = ?
      ORDER BY l.data_hora DESC
      LIMIT ?`,
    [oficinaId, Number(limit)],
  );
}

export async function listGlobal(limit = 200) {
  return query(
    `SELECT l.*, u.nome AS usuario_nome, o.nome AS oficina_nome
       FROM logs_auditoria l
       LEFT JOIN usuarios u ON u.id = l.usuario_id
       LEFT JOIN oficinas o ON o.id = l.oficina_id
      ORDER BY l.data_hora DESC
      LIMIT ?`,
    [Number(limit)],
  );
}
