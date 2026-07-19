-- CreateTable
CREATE TABLE "EmpresaTemplatePersonalizado" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpresaTemplatePersonalizado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaTemplatePersonalizado_empresaId_templateId_key" ON "EmpresaTemplatePersonalizado"("empresaId", "templateId");

-- AddForeignKey
ALTER TABLE "EmpresaTemplatePersonalizado" ADD CONSTRAINT "EmpresaTemplatePersonalizado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaTemplatePersonalizado" ADD CONSTRAINT "EmpresaTemplatePersonalizado_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
