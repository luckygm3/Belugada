import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { registrarEventoAuditoria } from "@/lib/auditoriaDocumento";

/** Gera o link de download de um documento gerado — empresa dona ou qualquer admin. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id: documentoId } = await params;

  const documento = await prisma.documentoGerado.findUnique({
    where: { id: documentoId },
    select: { urlPdf: true, funcionario: { select: { empresaId: true } } },
  });

  if (!documento || !documento.urlPdf) {
    return Response.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  const autorizado = session.user.papel === "ADMIN" || documento.funcionario.empresaId === session.user.empresaId;
  if (!autorizado) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("documentos-gerados")
    .createSignedUrl(documento.urlPdf, 60 * 5); // link válido por 5 minutos

  if (error || !data) {
    return Response.json({ error: "Não foi possível gerar o link." }, { status: 500 });
  }

  await registrarEventoAuditoria({
    documentoGeradoId: documentoId,
    tipo: "DOWNLOAD",
    usuarioId: session.user.id,
    usuarioNome: session.user.nome ?? session.user.email,
  });

  return Response.json({ url: data.signedUrl });
}
