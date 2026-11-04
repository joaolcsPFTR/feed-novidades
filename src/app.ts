import express from 'express';
import { lojasRouter } from './modules/lojas/lojas.routes';
import { clientesRouter } from './modules/clientes/clientes.routes';
import { errorHandler, notFoundHandler } from './http/errorHandler';

/**
 * Cria a aplicação Express já montada. Fica separado do server.ts para que
 * os testes subam o app com Supertest sem abrir uma porta de verdade.
 */
export function criarApp() {
  const app = express();

  app.use(express.json());

  // Checagem de saúde simples.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Rotas de domínio.
  app.use(lojasRouter);
  app.use(clientesRouter);

  // 404 e tratador global de erros — sempre por último.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
