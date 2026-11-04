# Backlog

Tarefas planejadas para o desafio. Marcadas conforme foram concluídas.

## Obrigatório

- [x] Scaffold do projeto (TypeScript, Express, Jest, configs)
- [x] `docker-compose` do PostgreSQL + criação dos bancos (app e testes)
- [x] Modelagem no Prisma (lojas, clientes, seguidores, novidades) + migration
- [x] Infra HTTP: erros padronizados, tratador global, validação (Zod)
- [x] `POST /lojas` — criar loja
- [x] `POST /clientes` — criar cliente (email único)
- [x] `POST /clientes/:id/seguindo/:lojaId` — seguir (sem duplicar)
- [x] `POST /lojas/:id/novidades` — publicar novidade (texto 1–500, preço > 0)
- [x] `GET /clientes/:id/feed?limite=20` — feed ordenado, limite padrão 20 / máx 50
- [x] Status HTTP coerentes (400/422, 404, 409) e corpo de erro único
- [x] Testes: feed (lojas seguidas, ordem, limite) e validações de seguir/publicar
- [x] Seed de dados para teste manual
- [x] README (rodar, testar, exemplos, estrutura, decisões, o que faltou)

## Diferenciais

- [x] `DELETE /clientes/:id/seguindo/:lojaId` — deixar de seguir
- [ ] Paginação por cursor no feed
- [ ] Documentação OpenAPI/Swagger
- [ ] CI com GitHub Actions rodando os testes
