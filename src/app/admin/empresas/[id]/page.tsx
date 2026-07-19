import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SelecaoTemplatesPadraoForm from "@/components/SelecaoTemplatesPadraoForm";
import SelecaoTemplatesPersonalizadosForm from "@/components/SelecaoTemplatesPersonalizadosForm";

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [empresa, todosTemplatesPadrao, todosTemplatesPersonalizados] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id },
      include: {
        templates: { where: { ativo: true } }, // personalizados exclusivos (upload direto) dessa empresa
        templatesPadraoSelecionados: { select: { templateId: true } },
        templatesPersonalizadosSelecionados: { select: { templateId: true } },
        _count: { select: { funcionarios: true } },
      },
    }),
    prisma.templateDocumento.findMany({
      where: { tipo: "PADRAO", ativo: true },
      orderBy: { nome: "asc" },
    }),
    prisma.templateDocumento.findMany({
      where: { tipo: "PERSONALIZADO", ativo: true, empresaId: null },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!empresa) notFound();

  const totalDocumentos =
    empresa.templatesPadraoSelecionados.length +
    empresa.templatesPersonalizadosSelecionados.length +
    empresa.templates.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">{empresa.razaoSocial}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">CNPJ: {empresa.cnpj}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 grid grid-cols-2 gap-4 text-sm dark:text-gray-200">
        <p><strong>Plano:</strong> {empresa.planoContratado || "-"}</p>
        <p><strong>Status:</strong> {empresa.statusPagamento}</p>
        <p><strong>Funcionários:</strong> {empresa._count.funcionarios}</p>
        <p><strong>Cidade:</strong> {empresa.cidade || "-"}/{empresa.uf || "-"}</p>
        <p className="col-span-2">
          <strong>Total de documentos por funcionário:</strong> {totalDocumentos}
          <span className="text-gray-500 dark:text-gray-400">
            {" "}({empresa.templatesPadraoSelecionados.length} padrão + {empresa.templatesPersonalizadosSelecionados.length} personalizado da biblioteca + {empresa.templates.length} personalizado exclusivo)
          </span>
        </p>
      </div>

      <SelecaoTemplatesPadraoForm
        empresaId={empresa.id}
        todosTemplates={todosTemplatesPadrao.map((t) => ({ id: t.id, nome: t.nome }))}
        selecionadosIniciais={empresa.templatesPadraoSelecionados.map((s) => s.templateId)}
      />

      <SelecaoTemplatesPersonalizadosForm
        empresaId={empresa.id}
        todosTemplates={todosTemplatesPersonalizados.map((t) => ({ id: t.id, nome: t.nome }))}
        selecionadosIniciais={empresa.templatesPersonalizadosSelecionados.map((s) => s.templateId)}
      />
    </div>
  );
}