import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DocumentoAuditoriaView, type EventoAuditoriaItem } from "@/components/documentos/DocumentoAuditoriaView";

export default async function EmpresaDocumentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const documento = await prisma.documentoGerado.findUnique({
    where: { id },
    include: {
      template: { select: { nome: true } },
      funcionario: { select: { nomeCompleto: true, empresaId: true } },
    },
  });

  if (!documento || documento.funcionario.empresaId !== session!.user.empresaId) notFound();

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
        hrefBaseDocumento="/empresa/documentos"
      />
    </div>
  );
}
