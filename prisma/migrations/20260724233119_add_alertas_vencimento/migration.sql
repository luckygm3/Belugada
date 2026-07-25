-- AlterEnum
ALTER TYPE "TipoAtividade" ADD VALUE 'VENCIMENTO_PROXIMO';

-- AlterTable
ALTER TABLE "DocumentoGerado" ADD COLUMN     "dataVencimento" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Funcionario" ADD COLUMN     "dataTerminoContrato" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "diasAntecedencia" INTEGER;

-- AlterTable
ALTER TABLE "TemplateDocumento" ADD COLUMN     "diasAlertaVencimento" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "variavelVencimento" TEXT;

-- CreateTable
CREATE TABLE "AlertaVencimentoEnviado" (
    "id" TEXT NOT NULL,
    "documentoGeradoId" TEXT NOT NULL,
    "diasAntecedencia" INTEGER NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaVencimentoEnviado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertaVencimentoEnviado_documentoGeradoId_diasAntecedencia_key" ON "AlertaVencimentoEnviado"("documentoGeradoId", "diasAntecedencia");

-- CreateIndex
CREATE INDEX "DocumentoGerado_dataVencimento_idx" ON "DocumentoGerado"("dataVencimento");

-- AddForeignKey
ALTER TABLE "AlertaVencimentoEnviado" ADD CONSTRAINT "AlertaVencimentoEnviado_documentoGeradoId_fkey" FOREIGN KEY ("documentoGeradoId") REFERENCES "DocumentoGerado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
