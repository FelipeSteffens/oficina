import app from './app.js';
import { config } from './config/env.js';
import { pool, testConnection } from './config/db.js';

async function start() {
  try {
    await testConnection();
    console.log('[DB] Conexão MySQL estabelecida.');
    const server = app.listen(config.port, () => {
      console.log(`[API] AutoTrack Pro rodando em http://localhost:${config.port}/api`);
    });

    const shutdown = async (signal) => {
      console.log(`[${signal}] Encerrando servidor...`);
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[DB] Falha ao conectar no MySQL:', error.message);
    console.error('Verifique o arquivo backend/.env e se o schema.sql foi executado.');
    process.exit(1);
  }
}

start();
