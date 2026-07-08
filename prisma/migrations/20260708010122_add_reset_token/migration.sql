-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "tokenReset" TEXT,
ADD COLUMN     "tokenResetExpira" TIMESTAMP(3);
