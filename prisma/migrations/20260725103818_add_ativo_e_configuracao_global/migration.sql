-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ConfiguracaoGlobal" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "valores" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoGlobal_pkey" PRIMARY KEY ("id")
);
