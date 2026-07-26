import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DocumentoAuditoriaView, type EventoAuditoriaItem } from "@/components/documentos/DocumentoAuditoriaView";

export default async function AdminDocumentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const documento = await prisma.documentoGerado.findUnique({
    where: { id },
    include: {
      template: { select: { nome: true } },
      funcionario: { select: { nomeCompleto: true, empresa: { select: { razaoSocial: true } } } },
    },
  });

  if (!documento) notFound();

  const eventos = await prisma.auditoriaDocumento.findMany({
    where: { documentoGeradoId: id },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <DocumentoAuditoriaView
        documentoId={documento.id}
        templateNome={documento.template.nome}
        funcionarioNome={documento.funcionario.nomeCompleto}
        empresaNome={documento.funcionario.empresa.razaoSocial}
        dataGeracao={documento.dataGeracao.toISOString()}
        dataVencimento={documento.dataVencimento ? documento.dataVencimento.toISOString() : null}
        eventos={eventos.map(
          (e): EventoAuditoriaItem => ({
            id: e.id,
            tipo: e.tipo,
            usuarioNome: e.usuarioNome,
            criadoEm: e.criadoEm.toISOString(),
            templateNome: e.templateNome,
            templateHash: e.templateHash,
            variaveisUsadas: e.variaveisUsadas as Record<string, string> | null,
            documentoSubstitutoId: e.documentoSubstitutoId,
          })
        )}
        hrefBaseDocumento="/admin/documentos"
      />
    </div>
  );
}
