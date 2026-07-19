import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UploadTemplatePadraoForm from "@/components/UploadTemplatesPadraoForm";

export default async function TemplatesPadraoPage() {
  const templatesPadrao = await prisma.templateDocumento.findMany({
    where: { tipo: "PADRAO", ativo: true },
    orderBy: { nome: "asc" },
  });

  const templatesPersonalizados = await prisma.templateDocumento.findMany({
    where: { tipo: "PERSONALIZADO", ativo: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 dark:text-white">Biblioteca de documentos padrão</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Esses documentos ficam disponíveis para qualquer empresa marcar. Anexe aqui os modelos com campos [[variavel]].
      </p>

      <UploadTemplatePadraoForm
        templatesIniciais={templatesPadrao.map((t) => ({
          id: t.id,
          nome: t.nome,
          variaveisDetectadas: t.variaveisDetectadas,
        }))}
      />

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Biblioteca de documentos personalizados</h2>
        <Link
          href="/admin/templates-personalizados/novo"
          className="bg-black text-white text-sm px-4 py-2 rounded-md dark:bg-white dark:text-black"
        >
          + Criar template
        </Link>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 mt-1">
        Templates criados no editor do site, vinculados posteriormente a empresas específicas.
      </p>

      <div className="border rounded-xl p-4 dark:border-gray-700">
        {templatesPersonalizados.length === 0 && (
          <p className="text-sm text-gray-400">Nenhum template personalizado criado ainda.</p>
        )}
        {templatesPersonalizados.map((t) => (
          <div key={t.id} className="border-b last:border-b-0 py-3 dark:border-gray-700">
            <p className="font-medium dark:text-white">{t.nome}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Variáveis: {t.variaveisDetectadas.join(", ") || "nenhuma"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}