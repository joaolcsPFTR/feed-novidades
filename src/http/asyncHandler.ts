import { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Envolve handlers assíncronos para que erros lançados caiam no
 * tratador global de erros, sem try/catch repetido em cada rota.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
