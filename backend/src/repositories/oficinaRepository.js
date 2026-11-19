import { pool, query, queryOne } from '../config/db.js';

export async function listAll() {
  return query(
    `SELECT o.*,
            (SELECT COUNT(*) FROM funcionarios f WHERE f.oficina_id = o.id) AS total_funcionarios,
            (SELECT COUNT(*) FROM veiculo_oficinas vo WHERE vo.oficina_id = o.id AND vo.status = 'autorizado') AS total_veiculos,
            (SELECT COUNT(*) FROM ordens_servico os WHERE os.oficina_id = o.id) AS total_os,
            (SELECT u.email FROM funcionarios f
               JOIN usuarios u ON u.id = f.usuario_id
              WHERE f.oficina_id = o.id AND f.funcao LIKE '%Administrador%'
              ORDER BY f.id ASC LIMIT 1) AS email_responsavel
       FROM oficinas o
      ORDER BY o.id ASC`,
  );
}

export async function findById(id, conn = null) {
  const executor = conn || pool;
  const [rows] = await executor.execute('SELECT * FROM oficinas WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function findAdminLogin(oficinaId, conn = null) {
  const executor = conn || pool;
  const [rows] = await executor.execute(
    `SELECT f.id AS funcionario_id, f.usuario_id, u.email, u.nome
       FROM funcionarios f
       JOIN usuarios u ON u.id = f.usuario_id
      WHERE f.oficina_id = ? AND f.funcao LIKE '%Administrador%'
      ORDER BY f.id ASC LIMIT 1`,
    [oficinaId],
  );
  return rows[0] ?? null;
}

export async function findByCnpj(cnpj) {
  return queryOne('SELECT id FROM oficinas WHERE cnpj = ?', [cnpj]);
}

export async function create(data, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO oficinas (nome, cnpj, endereco, telefone, email, responsavel_nome, ativa)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.nome, data.cnpj, data.endereco, data.telefone, data.email, data.responsavel_nome, data.ativa === false ? 0 : 1],
  );
  return findById(result.insertId, conn);
}

export async function update(id, fields, conn = null) {
  const executor = conn || pool;
  const allowed = ['nome', 'cnpj', 'endereco', 'telefone', 'email', 'responsavel_nome', 'ativa'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id, conn);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await executor.execute(`UPDATE oficinas SET ${sets} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
  return findById(id, conn);
}

export async function setActive(id, ativa, conn = null) {
  const executor = conn || pool;
  await executor.execute('UPDATE oficinas SET ativa = ? WHERE id = ?', [ativa ? 1 : 0, id]);
  return findById(id, conn);
}
