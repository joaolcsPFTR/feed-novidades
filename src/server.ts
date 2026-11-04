import { criarApp } from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';

const app = criarApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API do LiveShop no ar em http://localhost:${env.port}`);
});

// Encerramento limpo: fecha conexões do banco e o servidor HTTP.
async function encerrar(sinal: string) {
  // eslint-disable-next-line no-console
  console.log(`\nRecebido ${sinal}, encerrando...`);
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => void encerrar('SIGINT'));
process.on('SIGTERM', () => void encerrar('SIGTERM'));
