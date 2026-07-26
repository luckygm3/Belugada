-- AlterTable
ALTER TABLE "DocumentoGerado" ADD COLUMN     "dadosEntrada" JSONB;

-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "representanteLegalCargo" TEXT,
ADD COLUMN     "representanteLegalCpf" TEXT,
ADD COLUMN     "representanteLegalNome" TEXT;
