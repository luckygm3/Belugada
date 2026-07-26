-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "nome" TEXT;

-- CreateTable
CREATE TABLE "SessaoAtiva" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoUso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revogadaEm" TIMESTAMP(3),

    CONSTRAINT "SessaoAtiva_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessaoAtiva_usuarioId_idx" ON "SessaoAtiva"("usuarioId");

-- AddForeignKey
ALTER TABLE "SessaoAtiva" ADD CONSTRAINT "SessaoAtiva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
