import request from 'supertest';
import {
  app,
  resetarBanco,
  fecharBanco,
  novaLoja,
  novoCliente,
  seguir,
  publicar,
} from './helpers';

const UUID_INEXISTENTE = '00000000-0000-0000-0000-000000000000';

beforeEach(resetarBanco);
afterAll(fecharBanco);

describe('POST /clientes/:id/seguindo/:lojaId (seguir)', () => {
  it('permite seguir uma loja (201)', async () => {
    const loja = await novaLoja();
    const cliente = await novoCliente('seg1@exemplo.com');

    const res = await seguir(cliente, loja);

    expect(res.status).toBe(201);
  });

  it('não deixa seguir a mesma loja duas vezes (409)', async () => {
    const loja = await novaLoja();
    const cliente = await novoCliente('seg2@exemplo.com');

    await seguir(cliente, loja);
    const res = await seguir(cliente, loja);

    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('CONFLITO');
  });

  it('retorna 404 ao seguir com cliente inexistente', async () => {
    const loja = await novaLoja();
    const res = await seguir(UUID_INEXISTENTE, loja);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });

  it('retorna 404 ao seguir loja inexistente', async () => {
    const cliente = await novoCliente('seg3@exemplo.com');
    const res = await seguir(cliente, UUID_INEXISTENTE);

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });
});

describe('POST /lojas/:id/novidades (publicar)', () => {
  it('publica uma novidade com texto e preço (201)', async () => {
    const loja = await novaLoja();
    const res = await publicar(loja, 'Promoção relâmpago', 99.9);

    expect(res.status).toBe(201);
    expect(res.body.texto).toBe('Promoção relâmpago');
    expect(res.body.preco).toBe(99.9);
  });

  it('publica uma novidade sem preço (201, preco null)', async () => {
    const loja = await novaLoja();
    const res = await publicar(loja, 'Aviso: live hoje às 20h');

    expect(res.status).toBe(201);
    expect(res.body.preco).toBeNull();
  });

  it('rejeita texto vazio (422)', async () => {
    const loja = await novaLoja();
    const res = await publicar(loja, '');

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('rejeita texto com mais de 500 caracteres (422)', async () => {
    const loja = await novaLoja();
    const res = await publicar(loja, 'a'.repeat(501));

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('rejeita preço menor ou igual a zero (422)', async () => {
    const loja = await novaLoja();
    const res = await publicar(loja, 'Produto grátis?', 0);

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('retorna 404 ao publicar em loja inexistente', async () => {
    const res = await publicar(UUID_INEXISTENTE, 'novidade qualquer');

    expect(res.status).toBe(404);
    expect(res.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });
});

describe('POST /clientes e POST /lojas (criação)', () => {
  it('rejeita cliente com email duplicado (409)', async () => {
    await novoCliente('igual@exemplo.com');
    const res = await request(app)
      .post('/clientes')
      .send({ nome: 'Outro', email: 'igual@exemplo.com' });

    expect(res.status).toBe(409);
    expect(res.body.erro.codigo).toBe('CONFLITO');
  });

  it('rejeita cliente com email inválido (422)', async () => {
    const res = await request(app)
      .post('/clientes')
      .send({ nome: 'Fulano', email: 'nao-e-email' });

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });

  it('rejeita loja sem nome (422)', async () => {
    const res = await request(app).post('/lojas').send({});

    expect(res.status).toBe(422);
    expect(res.body.erro.codigo).toBe('VALIDACAO');
  });
});
