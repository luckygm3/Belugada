import { prisma } from "@/lib/prisma";
import UploadTemplatePadraoForm from "@/components/UploadTemplatesPadraoForm";

export default async function TemplatesPadraoPage() {
  const templates = await prisma.templateDocumento.findMany({
    where: { tipo: "PADRAO", ativo: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Biblioteca de documentos padrão</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Esses documentos ficam disponíveis para qualquer empresa marcar. Anexe aqui os modelos com campos [[variavel]].
      </p>

      <UploadTemplatePadraoForm
        templatesIniciais={templates.map((t) => ({
          id: t.id,
          nome: t.nome,
          variaveisDetectadas: t.variaveisDetectadas,
        }))}
      />
    </div>
  );
}