import request from 'supertest';
import { criarApp } from '../src/app';
import { prisma } from '../src/db/prisma';

/** App compartilhado pelos testes (sem abrir porta de rede). */
export const app = criarApp();

/** Pequena pausa, usada para garantir timestamps distintos entre inserts. */
export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Zera as tabelas respeitando as chaves estrangeiras. */
export async function resetarBanco() {
  await prisma.novidade.deleteMany();
  await prisma.seguidor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.loja.deleteMany();
}

export async function fecharBanco() {
  await prisma.$disconnect();
}

/** Cria uma loja via API e devolve seu id. */
export async function novaLoja(nome = 'Loja Teste'): Promise<string> {
  const res = await request(app).post('/lojas').send({ nome });
  return res.body.id as string;
}

/** Cria um cliente via API e devolve seu id. */
export async function novoCliente(
  email = 'cliente@exemplo.com',
  nome = 'Cliente Teste',
): Promise<string> {
  const res = await request(app).post('/clientes').send({ nome, email });
  return res.body.id as string;
}

/** Faz um cliente seguir uma loja. */
export async function seguir(clienteId: string, lojaId: string) {
  return request(app).post(`/clientes/${clienteId}/seguindo/${lojaId}`);
}

/** Publica uma novidade numa loja. */
export async function publicar(lojaId: string, texto: string, preco?: number) {
  return request(app)
    .post(`/lojas/${lojaId}/novidades`)
    .send(preco === undefined ? { texto } : { texto, preco });
}
