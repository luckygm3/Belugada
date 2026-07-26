import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GerarDocumentosForm from "@/components/GerarDocumentosForm";
import ExcluirFuncionarioButton from "@/components/ExcluirFuncionarioButton";
import { ListaDocumentosGerados } from "@/components/documentos/ListaDocumentosGerados";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default async function FuncionarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const funcionario = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionario || funcionario.empresaId !== session!.user.empresaId) notFound();

  const [templatesPadrao, templatesPersonalizadosBiblioteca, templatesPersonalizadosExclusivos, documentosGerados] =
    await Promise.all([
      prisma.empresaTemplatePadrao.findMany({
        where: { empresaId: funcionario.empresaId },
        include: { template: true },
      }),
      prisma.empresaTemplatePersonalizado.findMany({
        where: { empresaId: funcionario.empresaId },
        include: { template: true },
      }),
      prisma.templateDocumento.findMany({
        where: { empresaId: funcionario.empresaId, tipo: "PERSONALIZADO", ativo: true },
      }),
      prisma.documentoGerado.findMany({
        where: { funcionarioId: id },
        orderBy: { dataGeracao: "desc" },
        include: { template: { select: { nome: true } } },
      }),
    ]);

  const templatesDisponiveis = [
    ...templatesPadrao.map((t) => ({ id: t.template.id, nome: t.template.nome, variaveisDetectadas: t.template.variaveisDetectadas })),
    ...templatesPersonalizadosBiblioteca.map((t) => ({ id: t.template.id, nome: t.template.nome, variaveisDetectadas: t.template.variaveisDetectadas })),
    ...templatesPersonalizadosExclusivos.map((t) => ({ id: t.id, nome: t.nome, variaveisDetectadas: t.variaveisDetectadas })),
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{funcionario.nomeCompleto}</h1>
          <p className="text-body-sm text-ink-muted">{funcionario.cargo} — CPF {funcionario.cpf}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href={`/empresa/funcionarios/${funcionario.id}/editar`}
            className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Editar
          </Link>
          <ExcluirFuncionarioButton
            funcionarioId={funcionario.id}
            nomeFuncionario={funcionario.nomeCompleto}
            redirecionarApos="/empresa"
          />
        </div>
      </div>

      <GerarDocumentosForm funcionarioId={funcionario.id} templatesDisponiveis={templatesDisponiveis} />

      <Card>
        <CardHeader>
          <CardTitle>Documentos gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <ListaDocumentosGerados
            documentos={documentosGerados.map((d) => ({
              id: d.id,
              templateNome: d.template.nome,
              dataGeracao: d.dataGeracao.toISOString(),
              dataVencimento: d.dataVencimento ? d.dataVencimento.toISOString() : null,
            }))}
            hrefBase="/empresa/documentos"
          />
        </CardContent>
      </Card>
    </div>
  );
}