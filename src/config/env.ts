import 'dotenv/config';

/**
 * Centraliza a leitura de variáveis de ambiente.
 * Falha cedo e com mensagem clara se faltar a conexão do banco.
 */
function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Variável de ambiente "${nome}" não definida. Copie .env.example para .env e preencha.`,
    );
  }
  return valor;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: obrigatoria('DATABASE_URL'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
