import { pool, query, queryOne } from '../config/db.js';

const FULL_SELECT = `
  SELECT orc.*, v.marca, v.modelo, v.placa, v.ano, v.cor,
         c.nome_completo AS cliente_nome, c.telefone AS cliente_telefone,
         o.nome AS oficina_nome
    FROM orcamentos orc
    JOIN veiculos v ON v.id = orc.veiculo_id
    JOIN clientes c ON c.id = orc.cliente_id
    JOIN oficinas o ON o.id = orc.oficina_id
`;

export async function listByFilters({ oficinaId = null, clienteId = null, status = null } = {}) {
  const where = [];
  const params = [];
  if (oficinaId !== null) { where.push('orc.oficina_id = ?'); params.push(oficinaId); }
  if (clienteId !== null) { where.push('orc.cliente_id = ?'); params.push(clienteId); }
  if (status) { where.push('orc.status = ?'); params.push(status); }
  return query(
    `${FULL_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY orc.criado_em DESC, orc.id DESC`,
    params,
  );
}

export async function findById(id) {
  return queryOne(`${FULL_SELECT} WHERE orc.id = ? LIMIT 1`, [id]);
}

export async function listItens(orcamentoId) {
  return query(
    `SELECT i.*, p.codigo AS peca_codigo
       FROM orcamento_itens i
       LEFT JOIN estoque_pecas p ON p.id = i.peca_id
      WHERE i.orcamento_id = ?
      ORDER BY i.id ASC`,
    [orcamentoId],
  );
}

export async function findWithItens(id) {
  const orcamento = await findById(id);
  if (!orcamento) return null;
  return { ...orcamento, itens: await listItens(id) };
}

export async function create(data, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `INSERT INTO orcamentos (oficina_id, veiculo_id, cliente_id, descricao_servicos,
                             valor_mao_obra, valor_pecas, valor_total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.oficinaId, data.veiculoId, data.clienteId, data.descricaoServicos,
      data.valorMaoObra ?? 0, data.valorPecas ?? 0, data.valorTotal ?? 0, data.status || 'pendente'],
  );
  return result.insertId;
}

export async function addItem(data, conn) {
  await conn.execute(
    `INSERT INTO orcamento_itens (orcamento_id, tipo, peca_id, descricao, quantidade, valor_unitario)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.orcamentoId, data.tipo, data.pecaId ?? null, data.descricao,
      data.quantidade ?? 1, data.valorUnitario ?? 0],
  );
}

export async function updateStatus(id, status, oficinaId = null) {
  const params = [status, id];
  let where = 'id = ?';
  if (oficinaId !== null) { where += ' AND oficina_id = ?'; params.push(oficinaId); }
  await pool.execute(`UPDATE orcamentos SET status = ? WHERE ${where}`, params);
  return findById(id);
}
