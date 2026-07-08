-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'EMPRESA');

-- CreateEnum
CREATE TYPE "TipoTemplate" AS ENUM ('PADRAO', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "StatusDocumentacao" AS ENUM ('PENDENTE', 'EM_GERACAO', 'COMPLETO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('ATIVO', 'ATRASADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "emailOuLogin" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "empresaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "situacaoCadastral" TEXT,
    "naturezaJuridica" TEXT,
    "capitalSocial" DOUBLE PRECISION,
    "porteEmpresa" TEXT,
    "cnaePrincipal" TEXT,
    "cnaesSecundarios" TEXT[],
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "emailCorporativo" TEXT,
    "quadroSocietario" JSONB,
    "planoContratado" TEXT,
    "dataInicioContrato" TIMESTAMP(3),
    "dataRenovacao" TIMESTAMP(3),
    "statusPagamento" "StatusPagamento" NOT NULL DEFAULT 'ATIVO',
    "responsavelNome" TEXT,
    "responsavelCargo" TEXT,
    "responsavelTelefone" TEXT,
    "responsavelEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "orgaoEmissor" TEXT,
    "ufEmissao" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "estadoCivil" TEXT,
    "nacionalidade" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "matriculaInterna" TEXT,
    "cargo" TEXT,
    "cbo" TEXT,
    "departamento" TEXT,
    "dataAdmissao" TIMESTAMP(3),
    "tipoContrato" TEXT,
    "jornadaTrabalho" TEXT,
    "salarioBase" DOUBLE PRECISION,
    "ctpsNumero" TEXT,
    "ctpsSerie" TEXT,
    "pisNis" TEXT,
    "dependentes" JSONB,
    "statusDocumentacao" "StatusDocumentacao" NOT NULL DEFAULT 'PENDENTE',
    "dataUltimaGeracao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateDocumento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoTemplate" NOT NULL,
    "empresaId" TEXT,
    "arquivoOriginalUrl" TEXT NOT NULL,
    "variaveisDetectadas" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoGerado" (
    "id" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "urlPdf" TEXT,
    "statusAssinatura" TEXT,
    "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoGerado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_emailOuLogin_key" ON "Usuario"("emailOuLogin");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_cpf_key" ON "Funcionario"("cpf");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funcionario" ADD CONSTRAINT "Funcionario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateDocumento" ADD CONSTRAINT "TemplateDocumento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoGerado" ADD CONSTRAINT "DocumentoGerado_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoGerado" ADD CONSTRAINT "DocumentoGerado_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
