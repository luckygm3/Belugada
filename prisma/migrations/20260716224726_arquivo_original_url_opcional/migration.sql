-- CreateEnum
CREATE TYPE "OrigemTemplate" AS ENUM ('UPLOAD', 'EDITOR');

-- AlterTable
ALTER TABLE "TemplateDocumento" ADD COLUMN     "arquivoUrl" TEXT,
ADD COLUMN     "conteudo" JSONB,
ADD COLUMN     "origem" "OrigemTemplate" NOT NULL DEFAULT 'UPLOAD',
ALTER COLUMN "arquivoOriginalUrl" DROP NOT NULL;
