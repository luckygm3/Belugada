import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GerarDocumentosForm from "@/components/GerarDocumentosForm";

export default async function FuncionarioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const funcionario = await prisma.funcionario.findUnique({ where: { id } });
  if (!funcionario || funcionario.empresaId !== session!.user.empresaId) notFound();

  const [templatesPadrao, templatesPersonalizados] = await Promise.all([
    prisma.empresaTemplatePadrao.findMany({
      where: { empresaId: funcionario.empresaId },
      include: { template: true },
    }),
    prisma.templateDocumento.findMany({
      where: { empresaId: funcionario.empresaId, tipo: "PERSONALIZADO", ativo: true },
    }),
  ]);

  const templatesDisponiveis = [
    ...templatesPadrao.map((t) => ({ id: t.template.id, nome: t.template.nome })),
    ...templatesPersonalizados.map((t) => ({ id: t.id, nome: t.nome })),
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">{funcionario.nomeCompleto}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{funcionario.cargo} — CPF {funcionario.cpf}</p>
      </div>

      <GerarDocumentosForm funcionarioId={funcionario.id} templatesDisponiveis={templatesDisponiveis} />
    </div>
  );
}