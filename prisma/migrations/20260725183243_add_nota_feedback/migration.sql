-- CreateTable
CREATE TABLE "NotaFeedback" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "paginaOrigem" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotaFeedback_createdAt_idx" ON "NotaFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "NotaFeedback" ADD CONSTRAINT "NotaFeedback_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
