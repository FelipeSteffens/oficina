import { pool, query, queryOne } from '../config/db.js';

const FULL_SELECT = `
  SELECT os.*, v.marca, v.modelo, v.placa, v.ano, v.cor, v.quilometragem AS km_cadastrado,
         c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone,
         f.nome AS mecanico_nome, ofi.nome AS oficina_nome,
         orc.id AS orcamento_numero
    FROM ordens_servico os
    JOIN veiculos v ON v.id = os.veiculo_id
    JOIN clientes c ON c.id = os.cliente_id
    LEFT JOIN funcionarios f ON f.id = os.funcionario_id
    LEFT JOIN oficinas ofi ON ofi.id = os.oficina_id
    LEFT JOIN orcamentos orc ON orc.id = os.orcamento_id
`;

export async function listByFilters({ oficinaId = null, clienteId = null, veiculoId = null, status = null, search = '' } = {}) {
  const where = [];
  const params = [];

  if (oficinaId !== null) { where.push('os.oficina_id = ?'); params.push(oficinaId); }
  if (clienteId !== null) { where.push('os.cliente_id = ?'); params.push(clienteId); }
  if (veiculoId !== null) { where.push('os.veiculo_id = ?'); params.push(veiculoId); }
  if (status) { where.push('os.status = ?'); params.push(status); }
  if (search) {
    const like = `%${search}%`;
    where.push('(v.placa LIKE ? OR c.nome_completo LIKE ? OR os.id LIKE ?)');
    params.push(like, like, like);
  }

  return query(
    `${FULL_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY os.data_entrada DESC, os.id DESC`,
    params,
  );
}

export async function findById(id) {
  return queryOne(`${FULL_SELECT} WHERE os.id = ? LIMIT 1`, [id]);
}

export async function create(data, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO ordens_servico (oficina_id, veiculo_id, cliente_id, funcionario_id, orcamento_id,
                                 data_entrada, quilometragem, problema_relatado, diagnostico,
                                 servicos_realizados, valor_total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.oficinaId, data.veiculoId, data.clienteId, data.funcionarioId ?? null,
      data.orcamentoId ?? null, data.dataEntrada || new Date(), data.quilometragem ?? 0,
      data.problemaRelatado || null, data.diagnostico || null, data.servicosRealizados || null,
      data.valorTotal ?? 0, data.status || 'aguardando_aprovacao'],
  );
  return result.insertId;
}

export async function update(id, oficinaId, fields, conn = null) {
  const executor = conn || pool;
  const allowed = ['funcionario_id', 'quilometragem', 'problema_relatado', 'diagnostico',
    'servicos_realizados', 'valor_total', 'status', 'concluida_em'];
  const entries = Object.entries(fields).filter(([key, value]) => allowed.includes(key) && value !== undefined);
  if (!entries.length) return { affectedRows: 0 };
  const sets = entries.map(([key]) => `${key} = ?`).join(', ');
  const params = [...entries.map(([, value]) => value), id, oficinaId];
  const [result] = await executor.execute(`UPDATE ordens_servico SET ${sets} WHERE id = ? AND oficina_id = ?`, params);
  return { affectedRows: result.affectedRows };
}

export async function addPeca(data, conn) {
  await conn.execute(
    'INSERT INTO os_pecas (os_id, peca_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
    [data.osId, data.pecaId, data.quantidade, data.precoUnitario],
  );
}

export async function listPecas(osId, conn = null) {
  const executor = conn || pool;
  const [rows] = await executor.execute(
    `SELECT op.*, p.nome AS peca_nome, p.codigo AS peca_codigo
       FROM os_pecas op JOIN estoque_pecas p ON p.id = op.peca_id
      WHERE op.os_id = ?
      ORDER BY op.id ASC`,
    [osId],
  );
  return rows;
}

export async function existsOsForOrcamento(orcamentoId) {
  const row = await queryOne('SELECT id FROM ordens_servico WHERE orcamento_id = ? LIMIT 1', [orcamentoId]);
  return Boolean(row);
}
