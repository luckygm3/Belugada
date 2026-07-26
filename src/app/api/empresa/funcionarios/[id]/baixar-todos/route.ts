import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sanitizarNomeArquivo } from "@/lib/sanitizarNomeArquivo";
import { registrarEventoAuditoria } from "@/lib/auditoriaDocumento";
import { podeAgirPelaEmpresa } from "@/lib/autorizacaoEmpresa";
import JSZip from "jszip";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id: funcionarioId } = await params;

  const funcionario = await prisma.funcionario.findUnique({
    where: { id: funcionarioId },
    include: { documentosGerados: { include: { template: true } } },
  });

  if (!funcionario || !podeAgirPelaEmpresa(session, funcionario.empresaId)) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }

  const comArquivo = funcionario.documentosGerados.filter(
    (d): d is typeof d & { urlPdf: string } => !!d.urlPdf
  );

  // Mantém só a geração mais recente por template — as anteriores continuam no banco como histórico
  const maisRecentePorTemplate = new Map<string, (typeof comArquivo)[number]>();
  for (const documento of comArquivo) {
    const atual = maisRecentePorTemplate.get(documento.templateId);
    if (!atual || documento.dataGeracao > atual.dataGeracao) {
      maisRecentePorTemplate.set(documento.templateId, documento);
    }
  }
  const documentos = Array.from(maisRecentePorTemplate.values());

  if (documentos.length === 0) {
    return Response.json({ error: "Nenhum documento gerado para este funcionário." }, { status: 404 });
  }

  const zip = new JSZip();
  const nomesUsados = new Set<string>();
  const documentosIncluidosIds: string[] = [];

  for (const documento of documentos) {
    const { data: arquivo, error } = await supabaseAdmin.storage
      .from("documentos-gerados")
      .download(documento.urlPdf);

    if (error || !arquivo) {
      console.error(`Erro ao baixar documento ${documento.urlPdf}:`, error);
      continue;
    }

    let nomeArquivo = `${sanitizarNomeArquivo(documento.template.nome)}.docx`;
    let sufixo = 2;
    while (nomesUsados.has(nomeArquivo)) {
      nomeArquivo = `${sanitizarNomeArquivo(documento.template.nome)}-${sufixo}.docx`;
      sufixo++;
    }
    nomesUsados.add(nomeArquivo);

    zip.file(nomeArquivo, await arquivo.arrayBuffer());
    documentosIncluidosIds.push(documento.id);
  }

  if (Object.keys(zip.files).length === 0) {
    return Response.json({ error: "Não foi possível baixar os documentos." }, { status: 500 });
  }

  const usuarioNome = session.user.nome ?? session.user.email ?? null;
  await Promise.all(
    documentosIncluidosIds.map((documentoId) =>
      registrarEventoAuditoria({
        documentoGeradoId: documentoId,
        tipo: "DOWNLOAD",
        usuarioId: session.user.id,
        usuarioNome,
      })
    )
  );

  const bufferZip = await zip.generateAsync({ type: "nodebuffer" });
  const nomeZip = `${sanitizarNomeArquivo(funcionario.nomeCompleto)}-documentos.zip`;

  return new Response(new Uint8Array(bufferZip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${nomeZip}"`,
    },
  });
}
