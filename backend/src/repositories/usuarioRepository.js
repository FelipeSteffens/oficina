import { pool, query, queryOne } from '../config/db.js';

export async function findAuthContext(id) {
  return queryOne(
    `SELECT u.id, u.nome, u.email, u.perfil, u.ativo,
            f.id AS funcionario_id, f.oficina_id,
            c.id AS cliente_id
       FROM usuarios u
       LEFT JOIN funcionarios f ON f.usuario_id = u.id
       LEFT JOIN clientes c ON c.usuario_id = u.id
      WHERE u.id = ?
      LIMIT 1`,
    [id],
  );
}

export async function findById(id, conn = null) {
  const executor = conn || pool;
  const [rows] = await executor.execute(
    'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios WHERE id = ?',
    [id],
  );
  return rows[0] ?? null;
}

export async function findByEmail(email) {
  return queryOne('SELECT * FROM usuarios WHERE email = ?', [email]);
}

export async function listAll() {
  return query(
    `SELECT u.id, u.nome, u.email, u.perfil, u.ativo, u.criado_em,
            f.oficina_id, o.nome AS oficina_nome, c.id AS cliente_id
       FROM usuarios u
       LEFT JOIN funcionarios f ON f.usuario_id = u.id
       LEFT JOIN oficinas o ON o.id = f.oficina_id
       LEFT JOIN clientes c ON c.usuario_id = u.id
      ORDER BY u.id ASC`,
  );
}

export async function create({ nome, email, senhaHash, perfil }, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, 1)',
    [nome, email, senhaHash, perfil],
  );
  return findById(result.insertId, conn);
}

export async function update(id, fields, conn = null) {
  const executor = conn || pool;
  const allowed = ['nome', 'email', 'senha_hash', 'perfil', 'ativo'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id, conn);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await executor.execute(`UPDATE usuarios SET ${sets} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
  return findById(id, conn);
}

export async function setActive(id, ativo, conn = null) {
  const executor = conn || pool;
  await executor.execute('UPDATE usuarios SET ativo = ? WHERE id = ?', [ativo ? 1 : 0, id]);
  return findById(id, conn);
}

export async function remove(id) {
  return query('DELETE FROM usuarios WHERE id = ?', [id]);
}
