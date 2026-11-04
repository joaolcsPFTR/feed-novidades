/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // Carrega .env.test em cada worker antes de importar o app/Prisma.
  setupFiles: ['<rootDir>/tests/loadEnv.ts'],
  // Aplica as migrations no banco de testes uma vez antes de tudo.
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  testTimeout: 30000,
  clearMocks: true,
};
