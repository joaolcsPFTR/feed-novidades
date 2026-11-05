import { PrismaClient } from '@prisma/client';

/**
 * Instância única do Prisma Client reutilizada em toda a aplicação.
 * Em testes, o mesmo cliente é usado e desconectado no final.
 */
export const prisma = new PrismaClient();
