import { naoEncontrado } from './errors';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Garante que um id de rota é um UUID válido. Um id malformado não pode
 * apontar para um recurso real, então respondemos 404 (e evitamos que o
 * Prisma lance um erro de tipo que viraria 500).
 */
export function assertUuid(id: string, mensagemSeInvalido: string): void {
  if (!UUID_RE.test(id)) {
    throw naoEncontrado(mensagemSeInvalido);
  }
}
