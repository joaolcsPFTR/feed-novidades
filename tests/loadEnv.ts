import { config } from 'dotenv';

// Carrega as variáveis do ambiente de teste ANTES dos módulos da aplicação,
// garantindo que o Prisma Client conecte no banco de testes (liveshop_test).
config({ path: '.env.test' });
