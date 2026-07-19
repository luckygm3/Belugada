import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mapearVariaveis } from "@/lib/mapearVariaveis";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { renderizarTemplateEditor, TipTapNode } from '@/lib/renderizar-template-editor'

function sanitizarNomeArquivo(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.papel !== "EMPRESA") {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id: funcionarioId } = await params;
  const { templateIds } = await req.json();

  const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } });
  if (!funcionario || funcionario.empresaId !== session.user.empresaId) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }

  const empresa = await prisma.empresa.findUnique({ where: { id: funcionario.empresaId } });
  if (!empresa) {
    return Response.json({ error: "Empresa não encontrada." }, { status: 404 });
  }

  const dados = mapearVariaveis(funcionario, empresa);
  const resultados = [];

  for (const templateId of templateIds) {
    const template = await prisma.templateDocumento.findUnique({ where: { id: templateId } });
    if (!template) continue;

    // Caminho EDITOR: templates criados no site (TipTap), sem arquivo .docx
    if (template.origem === "EDITOR") {
  if (!template.conteudo) {
    resultados.push({ template: template.nome, erro: "Template sem conteúdo salvo." });
    continue;
  }

  try {
    const html = renderizarTemplateEditor(
      template.conteudo as unknown as TipTapNode,
      dados
    );

    // @ts-expect-error - html-to-docx não tem tipos oficiais
    const HTMLtoDOCX = (await import("html-to-docx")).default;
    const bufferDocx: Buffer = await HTMLtoDOCX(`<div>${html}</div>`, undefined, {
      table: { row: { cantSplit: true } },
    });

    const caminhoSaida = `${funcionarioId}/${Date.now()}-${sanitizarNomeArquivo(template.nome)}.docx`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from("documentos-gerados")
      .upload(caminhoSaida, bufferDocx, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    if (erroUpload) {
      resultados.push({ template: template.nome, erro: "Falha ao salvar o documento gerado." });
      continue;
    }

    await prisma.documentoGerado.create({
      data: {
        funcionarioId,
        templateId,
        urlPdf: caminhoSaida, // guarda o caminho do .docx, igual ao caminho UPLOAD
      },
    });

    resultados.push({ template: template.nome, caminho: caminhoSaida, ok: true });
  } catch (err) {
    console.error("Erro ao converter template do editor em .docx:", err);
    resultados.push({ template: template.nome, erro: "Erro ao gerar o documento a partir do editor." });
  }

  continue;
}

    // Caminho UPLOAD: templates .docx (fluxo já existente)
    if (!template.arquivoOriginalUrl) {
      resultados.push({ template: template.nome, erro: "Template sem arquivo original vinculado." });
      continue;
    }

    const { data: arquivoOriginal, error: erroDownload } = await supabaseAdmin.storage
      .from("templates")
      .download(template.arquivoOriginalUrl);

    if (erroDownload || !arquivoOriginal) {
      resultados.push({ template: template.nome, erro: "Falha ao baixar o template original." });
      continue;
    }

    const buffer = Buffer.from(await arquivoOriginal.arrayBuffer());

    try {
      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        delimiters: { start: "[[", end: "]]" },
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(dados);

      const bufferPreenchido = doc.getZip().generate({ type: "nodebuffer" });

      const caminhoSaida = `${funcionarioId}/${Date.now()}-${sanitizarNomeArquivo(template.nome)}.docx`;

      const { error: erroUpload } = await supabaseAdmin.storage
        .from("documentos-gerados")
        .upload(caminhoSaida, bufferPreenchido, {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

      if (erroUpload) {
        resultados.push({ template: template.nome, erro: "Falha ao salvar o documento gerado." });
        continue;
      }

      await prisma.documentoGerado.create({
        data: {
          funcionarioId,
          templateId,
          urlPdf: caminhoSaida,
        },
      });

      resultados.push({ template: template.nome, caminho: caminhoSaida, ok: true });
    } catch (err) {
      resultados.push({ template: template.nome, erro: "Erro ao preencher variáveis. Confira se o template usa [[campo]] corretamente." });
    }
  }

  await prisma.funcionario.update({
    where: { id: funcionarioId },
    data: { statusDocumentacao: "COMPLETO", dataUltimaGeracao: new Date() },
  });

  return Response.json({ resultados });
}