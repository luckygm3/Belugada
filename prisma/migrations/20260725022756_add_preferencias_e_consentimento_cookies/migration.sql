-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "preferencias" JSONB;

-- CreateTable
CREATE TABLE "ConsentimentoCookies" (
    "id" TEXT NOT NULL,
    "essenciais" BOOLEAN NOT NULL DEFAULT true,
    "preferencias" BOOLEAN NOT NULL,
    "analytics" BOOLEAN NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentimentoCookies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentimentoCookies_criadoEm_idx" ON "ConsentimentoCookies"("criadoEm");

-- AddForeignKey
ALTER TABLE "ConsentimentoCookies" ADD CONSTRAINT "ConsentimentoCookies_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
