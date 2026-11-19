import { query, queryOne } from '../config/db.js';

export async function findByUsuarioId(usuarioId) {
  return queryOne('SELECT * FROM clientes WHERE usuario_id = ?', [usuarioId]);
}

export async function findById(id) {
  return queryOne('SELECT * FROM clientes WHERE id = ?', [id]);
}

export async function findByEmail(email) {
  return queryOne('SELECT id, nome_completo, email FROM clientes WHERE email = ?', [email]);
}

export async function listAll() {
  return query(
    `SELECT c.*, u.ativo AS usuario_ativo
       FROM clientes c LEFT JOIN usuarios u ON u.id = c.usuario_id
      ORDER BY c.id ASC`,
  );
}

export async function create({ usuarioId, nomeCompleto, cpf, telefone, email, endereco }) {
  const [result] = await query(
    `INSERT INTO clientes (usuario_id, nome_completo, cpf, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuarioId, nomeCompleto, cpf || null, telefone, email, endereco || null],
  );
  return findById(result.insertId);
}

export async function update(id, fields) {
  const allowed = ['nome_completo', 'cpf', 'telefone', 'email', 'endereco'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await query(`UPDATE clientes SET ${sets} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
  return findById(id);
}
