import { z } from 'zod';

export const criarLojaSchema = z.object({
  nome: z
    .string({ required_error: 'nome é obrigatório' })
    .trim()
    .min(1, 'nome é obrigatório')
    .max(120, 'nome deve ter no máximo 120 caracteres'),
});

export const criarNovidadeSchema = z.object({
  texto: z
    .string({ required_error: 'texto é obrigatório' })
    .trim()
    .min(1, 'texto deve ter de 1 a 500 caracteres')
    .max(500, 'texto deve ter de 1 a 500 caracteres'),
  preco: z
    .number({ invalid_type_error: 'preco deve ser um número' })
    .positive('preco deve ser maior que zero')
    .optional(),
});

export type CriarLojaInput = z.infer<typeof criarLojaSchema>;
export type CriarNovidadeInput = z.infer<typeof criarNovidadeSchema>;
