import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { validar } from '../../http/validate';
import { criarClienteSchema, feedQuerySchema } from './clientes.schemas';
import { criarCliente, deixarDeSeguir, seguirLoja } from './clientes.service';
import { obterFeed } from '../feed/feed.service';
import { clienteView, feedItemView } from '../../presenters';

export const clientesRouter = Router();

// POST /clientes — cria um cliente.
clientesRouter.post(
  '/clientes',
  asyncHandler(async (req, res) => {
    const { nome, email } = validar(criarClienteSchema, req.body);
    const cliente = await criarCliente(nome, email);
    res.status(201).json(clienteView(cliente));
  }),
);

// POST /clientes/:id/seguindo/:lojaId — cliente passa a seguir a loja.
clientesRouter.post(
  '/clientes/:id/seguindo/:lojaId',
  asyncHandler(async (req, res) => {
    await seguirLoja(req.params.id, req.params.lojaId);
    res.status(201).json({ mensagem: 'Cliente passou a seguir a loja.' });
  }),
);

// DELETE /clientes/:id/seguindo/:lojaId — cliente deixa de seguir (diferencial).
clientesRouter.delete(
  '/clientes/:id/seguindo/:lojaId',
  asyncHandler(async (req, res) => {
    await deixarDeSeguir(req.params.id, req.params.lojaId);
    res.status(204).send();
  }),
);

// GET /clientes/:id/feed?limite=20 — feed das lojas seguidas.
clientesRouter.get(
  '/clientes/:id/feed',
  asyncHandler(async (req, res) => {
    const { limite } = validar(feedQuerySchema, req.query);
    const novidades = await obterFeed(req.params.id, limite);
    res.status(200).json({
      limite,
      total: novidades.length,
      itens: novidades.map(feedItemView),
    });
  }),
);
