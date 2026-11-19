import { pool, query, queryOne } from '../config/db.js';

const OWNER_SELECT = `
  SELECT v.*, c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone,
         c.email AS cliente_email, u.id AS usuario_id
    FROM veiculos v
    JOIN clientes c ON c.id = v.cliente_id
    JOIN usuarios u ON u.id = c.usuario_id
`;

export async function listByCliente(clienteId) {
  return query(
    `SELECT v.*,
            (SELECT COUNT(*) FROM historico_veiculos h WHERE h.veiculo_id = v.id) AS total_registros
       FROM veiculos v
      WHERE v.cliente_id = ?
      ORDER BY v.id ASC`,
    [clienteId],
  );
}

export async function findById(id) {
  return queryOne('SELECT * FROM veiculos WHERE id = ?', [id]);
}

export async function listAllVehicles() {
  return query(
    `SELECT v.*, c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone
       FROM veiculos v JOIN clientes c ON c.id = v.cliente_id
      ORDER BY v.id ASC`,
  );
}

export async function findWithOwner(id) {
  return queryOne(`${OWNER_SELECT} WHERE v.id = ? LIMIT 1`, [id]);
}

export async function findByPlaca(placa) {
  return queryOne('SELECT id, cliente_id, placa FROM veiculos WHERE placa = ?', [placa]);
}

export async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO veiculos (cliente_id, marca, modelo, ano, placa, cor, quilometragem, combustivel, chassi)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.clienteId, data.marca, data.modelo, data.ano, data.placa, data.cor || null,
      data.quilometragem ?? 0, data.combustivel || null, data.chassi || null],
  );
  return findById(result.insertId);
}

export async function update(id, fields) {
  const allowed = ['marca', 'modelo', 'ano', 'placa', 'cor', 'quilometragem', 'combustivel', 'chassi'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return findById(id);
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  await pool.execute(`UPDATE veiculos SET ${sets} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
  return findById(id);
}

export async function remove(id) {
  return pool.execute('DELETE FROM veiculos WHERE id = ?', [id]);
}

export async function updateKm(id, km, conn = null) {
  const executor = conn || pool;
  await executor.execute('UPDATE veiculos SET quilometragem = ? WHERE id = ?', [km, id]);
}

/** Veículos com autorização ativa para a oficina (isolamento multi-tenant). */
export async function listAuthorizedByOficina(oficinaId, search = '') {
  const like = `%${search}%`;
  return query(
    `SELECT v.*, c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone,
            vo.status AS vinculo_status, vo.autorizado_em,
            (SELECT COUNT(*) FROM ordens_servico os WHERE os.veiculo_id = v.id AND os.oficina_id = ?) AS total_os
       FROM veiculo_oficinas vo
       JOIN veiculos v ON v.id = vo.veiculo_id
       JOIN clientes c ON c.id = v.cliente_id
      WHERE vo.oficina_id = ? AND vo.status = 'autorizado'
        AND (v.placa LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ? OR c.nome_completo LIKE ?)
      ORDER BY vo.autorizado_em DESC`,
    [oficinaId, oficinaId, like, like, like, like],
  );
}

export async function findAuthorization(veiculoId, oficinaId) {
  return queryOne(
    "SELECT * FROM veiculo_oficinas WHERE veiculo_id = ? AND oficina_id = ? LIMIT 1",
    [veiculoId, oficinaId],
  );
}

export async function upsertVinculo(veiculoId, oficinaId, status, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO veiculo_oficinas (veiculo_id, oficina_id, status, autorizado_em)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE status = VALUES(status),
                             autorizado_em = IF(VALUES(status) = 'autorizado', CURRENT_TIMESTAMP, autorizado_em)`,
    [veiculoId, oficinaId, status],
  );
  return result.insertId;
}

export async function listVinculos(veiculoId) {
  return query(
    `SELECT vo.id, vo.status, vo.autorizado_em, o.id AS oficina_id, o.nome AS oficina_nome,
            o.telefone AS oficina_telefone, o.email AS oficina_email, o.ativa AS oficina_ativa
       FROM veiculo_oficinas vo
       JOIN oficinas o ON o.id = vo.oficina_id
      WHERE vo.veiculo_id = ?
      ORDER BY o.nome ASC`,
    [veiculoId],
  );
}

export async function listAuthorizedOficinas(veiculoId) {
  return query(
    `SELECT o.id, o.nome, vo.status, vo.autorizado_em
       FROM veiculo_oficinas vo
       JOIN oficinas o ON o.id = vo.oficina_id
      WHERE vo.veiculo_id = ? AND vo.status = 'autorizado' AND o.ativa = 1
      ORDER BY vo.autorizado_em DESC`,
    [veiculoId],
  );
}

export async function listAllOficinas() {
  return query('SELECT id, nome, cnpj, endereco, telefone, email, ativa FROM oficinas WHERE ativa = 1 ORDER BY nome ASC');
}
