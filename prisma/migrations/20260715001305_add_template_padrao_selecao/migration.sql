-- CreateTable
CREATE TABLE "EmpresaTemplatePadrao" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaTemplatePadrao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaTemplatePadrao_empresaId_templateId_key" ON "EmpresaTemplatePadrao"("empresaId", "templateId");

-- AddForeignKey
ALTER TABLE "EmpresaTemplatePadrao" ADD CONSTRAINT "EmpresaTemplatePadrao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaTemplatePadrao" ADD CONSTRAINT "EmpresaTemplatePadrao_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
