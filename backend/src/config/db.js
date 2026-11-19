import mysql from 'mysql2/promise';
import { config } from './env.js';

/**
 * Pool único de conexões. Todas as queries parametrizadas passam por aqui
 * (ou pela transação abaixo), garantindo preparação de statements no mysql2.
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function queryScalar(sql, params = []) {
  const row = await queryOne(sql, params);
  return row ? Object.values(row)[0] : null;
}

/**
 * Executa um bloco dentro de uma transação SQL. A conexão é sempre liberada.
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<any>} handler
 */
export async function withTransaction(handler) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await handler(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}
