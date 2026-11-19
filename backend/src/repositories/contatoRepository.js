import { pool, query } from '../config/db.js';

export async function create({ nome, email, telefone, mensagem }) {
  const [result] = await pool.execute(
    'INSERT INTO contatos_site (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)',
    [nome, email, telefone || null, mensagem],
  );
  return result.insertId;
}

export async function listAll() {
  return query('SELECT * FROM contatos_site ORDER BY criado_em DESC LIMIT 200');
}
