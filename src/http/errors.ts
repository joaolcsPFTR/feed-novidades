/**
 * Erro de aplicação com status HTTP e código estável.
 * O tratador global (errorHandler) converte isto no corpo de erro padrão.
 */
export type DetalheErro = { campo: string; mensagem: string };

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly codigo: string,
    message: string,
    public readonly detalhes?: DetalheErro[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** 404 — recurso inexistente. */
export const naoEncontrado = (mensagem: string) =>
  new AppError(404, 'NAO_ENCONTRADO', mensagem);

/** 409 — conflito (ex.: email já usado, já segue a loja). */
export const conflito = (mensagem: string) =>
  new AppError(409, 'CONFLITO', mensagem);

/** 422 — entrada sintaticamente ok, mas inválida segundo as regras. */
export const validacao = (mensagem: string, detalhes?: DetalheErro[]) =>
  new AppError(422, 'VALIDACAO', mensagem, detalhes);
