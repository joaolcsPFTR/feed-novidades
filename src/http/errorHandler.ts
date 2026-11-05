import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from './errors';

type CorpoErro = {
  erro: {
    codigo: string;
    mensagem: string;
    detalhes?: { campo: string; mensagem: string }[];
  };
};

function corpo(
  codigo: string,
  mensagem: string,
  detalhes?: { campo: string; mensagem: string }[],
): CorpoErro {
  return { erro: { codigo, mensagem, ...(detalhes?.length ? { detalhes } : {}) } };
}

/** Rota não encontrada: mantém o mesmo formato de erro da API. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(corpo('NAO_ENCONTRADO', `Rota ${req.method} ${req.originalUrl} não existe.`));
};

/**
 * Tratador global de erros. Único lugar que decide status e corpo,
 * garantindo o MESMO formato de erro em toda a API.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Erros de negócio previstos.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(corpo(err.codigo, err.message, err.detalhes));
  }

  // Validação do Zod que porventura tenha escapado do helper.
  if (err instanceof ZodError) {
    const detalhes = err.issues.map((i) => ({
      campo: i.path.join('.') || '(corpo)',
      mensagem: i.message,
    }));
    return res.status(422).json(corpo('VALIDACAO', 'Dados de entrada inválidos.', detalhes));
  }

  // Erros conhecidos do Prisma mapeados para HTTP coerente.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(corpo('CONFLITO', 'Registro já existe (valor único duplicado).'));
    }
    if (err.code === 'P2025') {
      return res.status(404).json(corpo('NAO_ENCONTRADO', 'Recurso não encontrado.'));
    }
    if (err.code === 'P2003') {
      return res.status(404).json(corpo('NAO_ENCONTRADO', 'Recurso relacionado não encontrado.'));
    }
  }

  // JSON malformado no corpo da requisição.
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(corpo('REQUISICAO_INVALIDA', 'JSON do corpo está malformado.'));
  }

  // Qualquer outra coisa: erro interno. Loga para depuração.
  // eslint-disable-next-line no-console
  console.error('[erro-nao-tratado]', err);
  return res.status(500).json(corpo('ERRO_INTERNO', 'Erro interno inesperado.'));
};
