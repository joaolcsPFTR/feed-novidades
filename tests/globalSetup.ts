import { execSync } from 'node:child_process';
import { config } from 'dotenv';

/**
 * Roda uma vez antes de toda a suíte: aplica as migrations no banco de testes,
 * para que as tabelas existam independentemente da ordem de execução.
 */
export default async function globalSetup() {
  config({ path: '.env.test' });

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });
}
