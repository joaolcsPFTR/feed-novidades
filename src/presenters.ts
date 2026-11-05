import { Cliente, Loja, Novidade } from '@prisma/client';

/**
 * Converte entidades do banco no formato de resposta da API.
 * Centralizado para manter o contrato consistente (ex.: `preco` sempre number).
 */

export const lojaView = (l: Loja) => ({
  id: l.id,
  nome: l.nome,
  criadaEm: l.criadaEm,
});

export const clienteView = (c: Cliente) => ({
  id: c.id,
  nome: c.nome,
  email: c.email,
  criadoEm: c.criadoEm,
});

export const novidadeView = (n: Novidade) => ({
  id: n.id,
  lojaId: n.lojaId,
  texto: n.texto,
  // Prisma devolve Decimal; expomos como number (ou null) para a API.
  preco: n.preco === null ? null : Number(n.preco),
  criadaEm: n.criadaEm,
});

export const feedItemView = (n: Novidade & { loja: Loja }) => ({
  ...novidadeView(n),
  loja: { id: n.loja.id, nome: n.loja.nome },
});
