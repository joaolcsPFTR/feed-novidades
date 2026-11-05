# Feed de Novidades

API REST em que **clientes seguem lojas** e acompanham, em um **feed**, as novidades
que essas lojas publicam (produto novo, promoção, aviso de live), da mais recente
para a mais antiga.

Desafio técnico. Stack: **Node.js + TypeScript + Express + PostgreSQL (Prisma)**.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Como rodar do zero](#como-rodar-do-zero)
- [Como rodar os testes](#como-rodar-os-testes)
- [Endpoints e exemplos](#endpoints-e-exemplos)
- [Formato de erro](#formato-de-erro)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Decisões técnicas](#decisões-técnicas)
- [O que ficou de fora](#o-que-ficou-de-fora-e-o-que-eu-faria-com-mais-tempo)

---

## Pré-requisitos

- **Node.js 20+**
- **PostgreSQL** — por **Docker** (recomendado, nada a instalar) **ou** um Postgres já instalado.

---

## Como rodar do zero

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

O `.env` já vem apontando para o banco do `docker-compose`. Se usar um Postgres
próprio, ajuste a `DATABASE_URL`.

### 2. Suba o banco

**Opção A — Docker (recomendado):**

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 e cria os bancos `liveshop` (aplicação) e `liveshop_test` (testes).

**Opção B — Postgres nativo:** crie o banco e o usuário equivalentes ao `.env.example`:

```sql
CREATE ROLE liveshop LOGIN PASSWORD 'liveshop';
CREATE DATABASE liveshop OWNER liveshop;
CREATE DATABASE liveshop_test OWNER liveshop;
```

### 3. Instale as dependências, prepare o banco e rode

```bash
npm install
npm run setup     # aplica as migrations e gera o Prisma Client
npm run seed      # (opcional) popula lojas, clientes e novidades de exemplo
npm run dev       # sobe a API em http://localhost:3000
```

Checagem rápida: `GET http://localhost:3000/health` deve responder `{ "status": "ok" }`.

> Para rodar em modo produção: `npm run build` e depois `npm start`.

---

## Como rodar os testes

Os testes de integração sobem a API (Supertest) contra um **banco separado**
(`liveshop_test`), para nunca tocar nos dados de desenvolvimento.

```bash
cp .env.test.example .env.test   # aponta para liveshop_test
npm test
```

As migrations do banco de testes são aplicadas automaticamente antes da suíte.
Cobrem: o **feed** (só lojas seguidas, ordem correta, limite), e as **validações**
de seguir e de publicar.

---

## Endpoints e exemplos

Base URL: `http://localhost:3000`. Há uma coleção pronta em [`requests.http`](requests.http).

| Método | Rota | O que faz |
| --- | --- | --- |
| `POST` | `/lojas` | Cria uma loja |
| `POST` | `/clientes` | Cria um cliente |
| `POST` | `/clientes/{id}/seguindo/{lojaId}` | Cliente passa a seguir a loja |
| `DELETE` | `/clientes/{id}/seguindo/{lojaId}` | Cliente deixa de seguir *(extra)* |
| `POST` | `/lojas/{id}/novidades` | Loja publica uma novidade |
| `GET` | `/clientes/{id}/feed?limite=20` | Feed das lojas seguidas |

```bash
# Criar loja
curl -X POST http://localhost:3000/lojas \
  -H "Content-Type: application/json" \
  -d '{"nome":"Moda Viva"}'

# Criar cliente
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","email":"ana@exemplo.com"}'

# Seguir uma loja
curl -X POST http://localhost:3000/clientes/<CLIENTE_ID>/seguindo/<LOJA_ID>

# Publicar novidade (preco é opcional, mas quando enviado deve ser > 0)
curl -X POST http://localhost:3000/lojas/<LOJA_ID>/novidades \
  -H "Content-Type: application/json" \
  -d '{"texto":"Nova coleção de inverno","preco":199.90}'

# Ver o feed (limite padrão 20, máximo 50)
curl http://localhost:3000/clientes/<CLIENTE_ID>/feed?limite=20
```

Regras principais: `email` é único; não é possível seguir a mesma loja duas vezes;
`texto` da novidade tem de 1 a 500 caracteres; `limite` do feed vai de 1 a 50.

---

## Formato de erro

Toda a API responde erros no **mesmo formato**, com status HTTP coerente:

```json
{
  "erro": {
    "codigo": "VALIDACAO",
    "mensagem": "Dados de entrada inválidos.",
    "detalhes": [{ "campo": "email", "mensagem": "email inválido" }]
  }
}
```

| Status | `codigo` | Quando |
| --- | --- | --- |
| 422 | `VALIDACAO` | Entrada inválida (campos faltando, texto fora do tamanho, preço ≤ 0...) |
| 404 | `NAO_ENCONTRADO` | Cliente, loja ou rota inexistente |
| 409 | `CONFLITO` | Email repetido, ou seguir uma loja já seguida |
| 400 | `REQUISICAO_INVALIDA` | JSON malformado |
| 500 | `ERRO_INTERNO` | Erro inesperado |

---

## Estrutura de pastas

```
.
├── docker-compose.yml        # PostgreSQL + criação dos bancos
├── prisma/
│   ├── schema.prisma         # modelagem (lojas, clientes, seguidores, novidades)
│   ├── migrations/           # migration inicial versionada
│   └── seed.ts               # dados de exemplo
├── src/
│   ├── server.ts             # entrada: sobe o HTTP e trata encerramento
│   ├── app.ts                # monta o Express (fica separado p/ os testes)
│   ├── config/env.ts         # leitura das variáveis de ambiente
│   ├── db/prisma.ts          # instância única do Prisma Client
│   ├── http/                 # infra HTTP transversal
│   │   ├── errors.ts         # AppError + fábricas (404/409/422)
│   │   ├── errorHandler.ts   # tratador global → formato de erro único
│   │   ├── validate.ts       # validação com Zod
│   │   ├── asyncHandler.ts   # captura de erros async nas rotas
│   │   └── uuid.ts           # valida ids de rota
│   ├── presenters.ts         # molda as respostas (ex.: preco sempre number)
│   └── modules/              # domínio, separado por recurso
│       ├── lojas/            # criar loja + publicar novidade
│       ├── clientes/         # criar cliente + seguir/deixar de seguir
│       └── feed/             # montagem do feed
└── tests/                    # testes de integração (Supertest)
```

Cada módulo separa **rotas** (HTTP), **service** (regra de negócio) e **schemas** (Zod).
As rotas ficam finas; as regras ficam nos services, fáceis de testar e reusar.

---

## Decisões técnicas

- **Feed montado na leitura (read-time fan-out).** O feed é uma consulta que junta as
  lojas seguidas com as novidades, ordenando por data (desc). Como o produto diz que
  *a loja publica poucas vezes e o cliente lê muito*, o volume de novidades por loja é
  pequeno e um índice resolve. Evitei o *write-time fan-out* (copiar cada novidade para
  a "caixa" de cada seguidor) porque, com lojas de 100 mil+ seguidores, cada publicação
  viraria 100 mil escritas — complexidade e custo que o MVP não precisa. Se o perfil
  mudasse para leitura altíssima com feeds enormes, aí sim valeria materializar.
- **Índice `(loja_id, criada_em DESC)` em `novidades`.** Sustenta exatamente o
  `WHERE loja_id IN (...) ORDER BY criada_em DESC LIMIT n` do feed, sem varrer a tabela.
- **Ordenação determinística.** O feed desempata por `id`, então a ordem é estável
  mesmo com novidades no mesmo instante (importante para testes e paginação futura).
- **Prisma.** Migrations versionadas, tipos gerados do schema e queries type-safe.
  A tabela de junção `seguidores` tem **chave primária composta** `(cliente_id, loja_id)`,
  que garante no banco que ninguém segue a mesma loja duas vezes.
- **Validação com Zod + tratador de erros único.** Toda entrada passa por um schema;
  as falhas viram um corpo de erro padronizado num só lugar (`errorHandler`), então o
  formato é consistente em toda a API.
- **`app` separado do `server`.** Os testes sobem o `app` com Supertest sem abrir porta,
  e `server.ts` cuida de ouvir a porta e encerrar as conexões com elegância.
- **Banco de testes isolado (`liveshop_test`).** Os testes apagam tabelas entre casos;
  mantê-los longe do banco de dev evita surpresas.

---

## O que ficou de fora (e o que eu faria com mais tempo)

- **Autenticação** — fora do escopo; os ids vêm na rota, como pedido.
- **Paginação por cursor** no feed (hoje há `limite`). O `id` como critério de desempate
  já deixa a base pronta para um cursor `(criada_em, id)`.
- **Documentação OpenAPI/Swagger** gerada a partir dos schemas Zod.
- **CI (GitHub Actions)** rodando `npm test` a cada push, com um Postgres de serviço.
- **Observabilidade** — logs estruturados e um `/metrics`.
- **Rate limiting** e mais *hardening* de produção.
