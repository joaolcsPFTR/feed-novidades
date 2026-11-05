import { prisma } from '../src/db/prisma';

/**
 * Popula o banco com dados de exemplo para facilitar o teste manual:
 * 3 lojas, 2 clientes, quem segue quem e novidades com datas escalonadas
 * (para o feed sair numa ordem visível). Rode com: npm run seed
 */
async function main() {
  // Limpa na ordem que respeita as chaves estrangeiras.
  await prisma.novidade.deleteMany();
  await prisma.seguidor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.loja.deleteMany();

  const modaViva = await prisma.loja.create({ data: { nome: 'Moda Viva' } });
  const techPrime = await prisma.loja.create({ data: { nome: 'Tech Prime' } });
  const casaBela = await prisma.loja.create({ data: { nome: 'Casa Bela' } });

  const ana = await prisma.cliente.create({
    data: { nome: 'Ana Souza', email: 'ana@exemplo.com' },
  });
  const bruno = await prisma.cliente.create({
    data: { nome: 'Bruno Lima', email: 'bruno@exemplo.com' },
  });

  // Ana segue Moda Viva e Tech Prime. Bruno segue só Casa Bela.
  await prisma.seguidor.createMany({
    data: [
      { clienteId: ana.id, lojaId: modaViva.id },
      { clienteId: ana.id, lojaId: techPrime.id },
      { clienteId: bruno.id, lojaId: casaBela.id },
    ],
  });

  // Datas escalonadas para a ordem do feed ficar evidente.
  const agora = Date.now();
  const minutosAtras = (min: number) => new Date(agora - min * 60_000);

  await prisma.novidade.createMany({
    data: [
      { lojaId: modaViva.id, texto: 'Nova coleção de inverno chegou!', preco: 199.9, criadaEm: minutosAtras(50) },
      { lojaId: techPrime.id, texto: 'Promoção de fones bluetooth', preco: 149.0, criadaEm: minutosAtras(40) },
      { lojaId: casaBela.id, texto: 'Live de utensílios de cozinha hoje às 20h', criadaEm: minutosAtras(30) },
      { lojaId: modaViva.id, texto: 'Frete grátis acima de R$ 150', criadaEm: minutosAtras(20) },
      { lojaId: techPrime.id, texto: 'Lançamento: teclado mecânico', preco: 329.9, criadaEm: minutosAtras(10) },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Seed concluído.');
  // eslint-disable-next-line no-console
  console.log(`  Cliente Ana  (segue Moda Viva + Tech Prime): ${ana.id}`);
  // eslint-disable-next-line no-console
  console.log(`  Cliente Bruno (segue Casa Bela):             ${bruno.id}`);
  // eslint-disable-next-line no-console
  console.log(`  Dica: GET /clientes/${ana.id}/feed`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
