import { z } from 'zod';

export const criarClienteSchema = z.object({
  nome: z
    .string({ required_error: 'nome é obrigatório' })
    .trim()
    .min(1, 'nome é obrigatório')
    .max(120, 'nome deve ter no máximo 120 caracteres'),
  email: z
    .string({ required_error: 'email é obrigatório' })
    .trim()
    .toLowerCase()
    .email('email inválido'),
});

// `limite` chega como string na query; coerce converte e aplica os limites.
export const feedQuerySchema = z.object({
  limite: z.coerce
    .number({ invalid_type_error: 'limite deve ser um número' })
    .int('limite deve ser inteiro')
    .min(1, 'limite deve ser no mínimo 1')
    .max(50, 'limite deve ser no máximo 50')
    .default(20),
});

export type CriarClienteInput = z.infer<typeof criarClienteSchema>;
