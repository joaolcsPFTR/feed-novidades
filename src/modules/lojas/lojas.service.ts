import { prisma } from '../../db/prisma';
import { naoEncontrado } from '../../http/errors';
import { assertUuid } from '../../http/uuid';

export function criarLoja(nome: string) {
  return prisma.loja.create({ data: { nome } });
}

/** Busca a loja ou lança 404. Reutilizado por novidades e por seguir. */
export async function buscarLojaOuFalhar(id: string) {
  assertUuid(id, 'Loja não encontrada.');
  const loja = await prisma.loja.findUnique({ where: { id } });
  if (!loja) {
    throw naoEncontrado('Loja não encontrada.');
  }
  return loja;
}

export async function publicarNovidade(lojaId: string, texto: string, preco?: number) {
  await buscarLojaOuFalhar(lojaId);
  return prisma.novidade.create({ data: { lojaId, texto, preco } });
}
