import request from 'supertest';
import {
  app,
  resetarBanco,
  fecharBanco,
  novaLoja,
  novoCliente,
  seguir,
  publicar,
  esperar,
} from './helpers';

beforeEach(resetarBanco);
afterAll(fecharBanco);

describe('GET /clientes/:id/feed', () => {
  it('mostra apenas novidades das lojas que o cliente segue', async () => {
    const seguida = await novaLoja('Loja Seguida');
    const naoSeguida = await novaLoja('Loja Nao Seguida');
    const cliente = await novoCliente('feed1@exemplo.com');

    await seguir(cliente, seguida);
    await publicar(seguida, 'novidade da seguida');
    await publicar(naoSeguida, 'novidade da NAO seguida');

    const res = await request(app).get(`/clientes/${cliente}/feed`);

    expect(res.status).toBe(200);
    expect(res.body.itens).toHaveLength(1);
    expect(res.body.itens[0].texto).toBe('novidade da seguida');
    expect(res.body.itens[0].loja.nome).toBe('Loja Seguida');
  });

  it('ordena da mais recente para a mais antiga', async () => {
    const loja = await novaLoja();
    const cliente = await novoCliente('feed2@exemplo.com');
    await seguir(cliente, loja);

    await publicar(loja, 'primeira');
    await esperar(5);
    await publicar(loja, 'segunda');
    await esperar(5);
    await publicar(loja, 'terceira');

    const res = await request(app).get(`/clientes/${cliente}/feed`);

    expect(res.status).toBe(200);
    const textos = res.body.itens.map((i: { texto: string }) => i.texto);
    expect(textos).toEqual(['terceira', 'segunda', 'primeira']);
  });

  it('respeita o parâmetro limite', async () => {
    const loja = await novaLoja();
    const cliente = await novoCliente('feed3@exemplo.com');
    await seguir(cliente, loja);

    for (let i = 0; i < 5; i++) {
      await publicar(loja, `novidade ${i}`);
    }

    const res = await request(app).get(`/clientes/${cliente}/feed?limite=2`);

    expect(res.status).toBe(200);
    expect(res.body.itens).toHaveLength(2);
    expect(res.body.limite).toBe(2);
  });

  it('usa limite padrão 20 quando não informado', async () => {
    const loja = await novaLoja();
    const cliente = await novoCliente('feed4@exemplo.com');
    await seguir(cliente, loja);
    await publicar(loja, 'uma novidade');

    const res = await request(app).get(`/clientes/${cliente}/feed`);

    expect(res.status).toBe(200);
    expect(res.body.limite).toBe(20);
  });

  it('rejeita limite acima do máximo (50) com 422', async () => {
    const cliente = await novoCliente('feed5@exemplo.com');
    const res = await request(app).get(`/clientes/${cliente}/feed?limite=51`);

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('retorna feed vazio para cliente que não segue ninguém', async () => {
    const cliente = await novoCliente('feed6@exemplo.com');
    const res = await request(app).get(`/clientes/${cliente}/feed`);

    expect(res.status).toBe(200);
    expect(res.body.itens).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('retorna 404 para cliente inexistente', async () => {
    const res = await request(app).get(
      '/clientes/00000000-0000-0000-0000-000000000000/feed',
    );

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });
});
