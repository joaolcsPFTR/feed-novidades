import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { validar } from '../../http/validate';
import { criarLojaSchema, criarNovidadeSchema } from './lojas.schemas';
import { criarLoja, publicarNovidade } from './lojas.service';
import { lojaView, novidadeView } from '../../presenters';

export const lojasRouter = Router();

// POST /lojas — cria uma loja.
lojasRouter.post(
  '/lojas',
  asyncHandler(async (req, res) => {
    const { nome } = validar(criarLojaSchema, req.body);
    const loja = await criarLoja(nome);
    res.status(201).json(lojaView(loja));
  }),
);

// POST /lojas/:id/novidades — a loja publica uma novidade.
lojasRouter.post(
  '/lojas/:id/novidades',
  asyncHandler(async (req, res) => {
    const { texto, preco } = validar(criarNovidadeSchema, req.body);
    const novidade = await publicarNovidade(req.params.id, texto, preco);
    res.status(201).json(novidadeView(novidade));
  }),
);
