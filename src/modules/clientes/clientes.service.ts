import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { conflito, naoEncontrado } from '../../http/errors';
import { assertUuid } from '../../http/uuid';
import { buscarLojaOuFalhar } from '../lojas/lojas.service';

export async function criarCliente(nome: string, email: string) {
  try {
    return await prisma.cliente.create({ data: { nome, email } });
  } catch (e) {
    // Corrida: se dois cadastros com o mesmo email chegarem juntos, a
    // constraint única do banco garante a unicidade e viramos num 409.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw conflito('Já existe um cliente com esse email.');
    }
    throw e;
  }
}

export async function buscarClienteOuFalhar(id: string) {
  assertUuid(id, 'Cliente não encontrado.');
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) {
    throw naoEncontrado('Cliente não encontrado.');
  }
  return cliente;
}

export async function seguirLoja(clienteId: string, lojaId: string) {
  await buscarClienteOuFalhar(clienteId);
  await buscarLojaOuFalhar(lojaId);

  const jaSegue = await prisma.seguidor.findUnique({
    where: { clienteId_lojaId: { clienteId, lojaId } },
  });
  if (jaSegue) {
    throw conflito('Cliente já segue essa loja.');
  }

  return prisma.seguidor.create({ data: { clienteId, lojaId } });
}

export async function deixarDeSeguir(clienteId: string, lojaId: string) {
  await buscarClienteOuFalhar(clienteId);
  await buscarLojaOuFalhar(lojaId);

  try {
    await prisma.seguidor.delete({
      where: { clienteId_lojaId: { clienteId, lojaId } },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw naoEncontrado('Cliente não segue essa loja.');
    }
    throw e;
  }
}
