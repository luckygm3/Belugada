import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GerarDocumentosForm from "@/components/GerarDocumentosForm";
import ExcluirFuncionarioButton from "@/components/ExcluirFuncionarioButton";

export default async function FuncionarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const funcionario = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionario || funcionario.empresaId !== session!.user.empresaId) notFound();

  const [templatesPadrao, templatesPersonalizadosBiblioteca, templatesPersonalizadosExclusivos] = await Promise.all([
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
  ]);

  const templatesDisponiveis = [
    ...templatesPadrao.map((t) => ({ id: t.template.id, nome: t.template.nome })),
    ...templatesPersonalizadosBiblioteca.map((t) => ({ id: t.template.id, nome: t.template.nome })),
    ...templatesPersonalizadosExclusivos.map((t) => ({ id: t.id, nome: t.nome })),
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{funcionario.nomeCompleto}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{funcionario.cargo} — CPF {funcionario.cpf}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link href={`/empresa/funcionarios/${funcionario.id}/editar`} className="text-blue-600 hover:underline text-sm">
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
    </div>
  );
}