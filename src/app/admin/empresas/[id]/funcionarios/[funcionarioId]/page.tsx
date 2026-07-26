import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import GerarDocumentosForm from "@/components/GerarDocumentosForm";
import ExcluirFuncionarioButton from "@/components/ExcluirFuncionarioButton";
import { OperandoComoEmpresa } from "@/components/OperandoComoEmpresa";
import { ListaDocumentosGerados } from "@/components/documentos/ListaDocumentosGerados";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default async function AdminFuncionarioDocumentosPage({
  params,
}: {
  params: Promise<{ id: string; funcionarioId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.papel !== "ADMIN") redirect("/login");

  const { id: empresaId, funcionarioId } = await params;

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId }, select: { razaoSocial: true } });
  if (!empresa) notFound();

  const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } });
  if (!funcionario || funcionario.empresaId !== empresaId) notFound();

  const [templatesPadrao, templatesPersonalizadosBiblioteca, templatesPersonalizadosExclusivos, documentosGerados] =
    await Promise.all([
      prisma.empresaTemplatePadrao.findMany({
        where: { empresaId },
        include: { template: true },
      }),
      prisma.empresaTemplatePersonalizado.findMany({
        where: { empresaId },
        include: { template: true },
      }),
      prisma.templateDocumento.findMany({
        where: { empresaId, tipo: "PERSONALIZADO", ativo: true },
      }),
      prisma.documentoGerado.findMany({
        where: { funcionarioId },
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
      <OperandoComoEmpresa empresaId={empresaId} empresaNome={empresa.razaoSocial} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">{funcionario.nomeCompleto}</h1>
          <p className="text-body-sm text-ink-muted">{funcionario.cargo} — CPF {funcionario.cpf}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href={`/admin/empresas/${empresaId}/funcionarios/${funcionario.id}/editar`}
            className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Editar
          </Link>
          <ExcluirFuncionarioButton
            funcionarioId={funcionario.id}
            nomeFuncionario={funcionario.nomeCompleto}
            redirecionarApos={`/admin/empresas/${empresaId}`}
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
            hrefBase="/admin/documentos"
          />
        </CardContent>
      </Card>
    </div>
  );
}
