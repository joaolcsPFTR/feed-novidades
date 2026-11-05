import { ZodTypeAny, z } from 'zod';
import { validacao } from './errors';

/**
 * Valida dados com um schema Zod. Em caso de falha, lança um AppError de
 * validação (422) com a lista de campos inválidos — mesmo formato em toda a API.
 *
 * Usa `z.infer<S>` para devolver o tipo de SAÍDA do schema (já com defaults
 * aplicados, ex.: `limite` vira `number`, não `number | undefined`).
 */
export function validar<S extends ZodTypeAny>(schema: S, dados: unknown): z.infer<S> {
  const resultado = schema.safeParse(dados);
  if (!resultado.success) {
    const detalhes = resultado.error.issues.map((i) => ({
      campo: i.path.join('.') || '(corpo)',
      mensagem: i.message,
    }));
    throw validacao('Dados de entrada inválidos.', detalhes);
  }
  return resultado.data;
}
