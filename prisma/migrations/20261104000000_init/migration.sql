-- CreateTable
CREATE TABLE "lojas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lojas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguidores" (
    "cliente_id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seguidores_pkey" PRIMARY KEY ("cliente_id","loja_id")
);

-- CreateTable
CREATE TABLE "novidades" (
    "id" UUID NOT NULL,
    "loja_id" UUID NOT NULL,
    "texto" VARCHAR(500) NOT NULL,
    "preco" DECIMAL(12,2),
    "criada_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "novidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "seguidores_loja_id_idx" ON "seguidores"("loja_id");

-- CreateIndex: sustenta o feed (filtra por loja, já ordenado por data desc)
CREATE INDEX "novidades_loja_id_criada_em_idx" ON "novidades"("loja_id", "criada_em" DESC);

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novidades" ADD CONSTRAINT "novidades_loja_id_fkey" FOREIGN KEY ("loja_id") REFERENCES "lojas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
