-- CreateEnum
CREATE TYPE "TipoEventoAuditoria" AS ENUM ('GERACAO', 'DOWNLOAD', 'SUBSTITUIDO');

-- CreateTable
CREATE TABLE "AuditoriaDocumento" (
    "id" TEXT NOT NULL,
    "documentoGeradoId" TEXT NOT NULL,
    "tipo" "TipoEventoAuditoria" NOT NULL,
    "usuarioId" TEXT,
    "usuarioNome" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" TEXT,
    "templateNome" TEXT,
    "templateHash" TEXT,
    "variaveisUsadas" JSONB,
    "documentoSubstitutoId" TEXT,

    CONSTRAINT "AuditoriaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditoriaDocumento_documentoGeradoId_idx" ON "AuditoriaDocumento"("documentoGeradoId");

-- CreateIndex
CREATE INDEX "AuditoriaDocumento_criadoEm_idx" ON "AuditoriaDocumento"("criadoEm");
