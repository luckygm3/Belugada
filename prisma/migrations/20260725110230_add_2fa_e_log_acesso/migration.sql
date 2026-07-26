-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "totpAtivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpCodigosBackup" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "totpSecretCriptografado" TEXT;

-- CreateTable
CREATE TABLE "LogAcesso" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "sucesso" BOOLEAN NOT NULL,
    "motivoFalha" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAcesso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogAcesso_usuarioId_idx" ON "LogAcesso"("usuarioId");

-- CreateIndex
CREATE INDEX "LogAcesso_criadoEm_idx" ON "LogAcesso"("criadoEm");

-- AddForeignKey
ALTER TABLE "LogAcesso" ADD CONSTRAINT "LogAcesso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
