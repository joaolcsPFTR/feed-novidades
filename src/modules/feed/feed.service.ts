import { prisma } from '../../db/prisma';
import { buscarClienteOuFalhar } from '../clientes/clientes.service';

/**
 * Monta o feed na LEITURA: pega as novidades das lojas que o cliente segue,
 * da mais recente para a mais antiga, limitado por `limite`.
 *
 * A ordenação secundária por `id` desempata novidades com o mesmo instante,
 * tornando a ordem determinística (importante para os testes e a paginação).
 *
 * O índice (loja_id, criada_em DESC) em `novidades` sustenta essa consulta.
 */
export async function obterFeed(clienteId: string, limite: number) {
  await buscarClienteOuFalhar(clienteId);

  return prisma.novidade.findMany({
    where: { loja: { seguidores: { some: { clienteId } } } },
    orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
    take: limite,
    include: { loja: true },
  });
}
