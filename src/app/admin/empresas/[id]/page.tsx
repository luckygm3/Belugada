import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UploadTemplateForm from "@/components/UploadTemplateForm";

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      templates: { where: { ativo: true } },
      _count: { select: { funcionarios: true } },
    },
  });

  if (!empresa) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{empresa.razaoSocial}</h1>
        <p className="text-gray-500 text-sm">CNPJ: {empresa.cnpj}</p>
      </div>

      <div className="bg-white border rounded-lg p-6 grid grid-cols-2 gap-4 text-sm">
        <p><strong>Plano:</strong> {empresa.planoContratado || "-"}</p>
        <p><strong>Status:</strong> {empresa.statusPagamento}</p>
        <p><strong>Funcionários:</strong> {empresa._count.funcionarios}</p>
        <p><strong>Cidade:</strong> {empresa.cidade || "-"}/{empresa.uf || "-"}</p>
      </div>

      <UploadTemplateForm
        empresaId={empresa.id}
        templatesIniciais={empresa.templates.map((t) => ({
          id: t.id,
          nome: t.nome,
          variaveisDetectadas: t.variaveisDetectadas,
        }))}
      />
    </div>
  );
}