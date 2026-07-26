import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mapearVariaveis } from "@/lib/mapearVariaveis";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { renderizarTemplateEditor, TipTapNode } from '@/lib/renderizar-template-editor'
import { sanitizarNomeArquivo } from "@/lib/sanitizarNomeArquivo";
import { registrarAtividade } from "@/lib/registrarAtividade";
import { notificarPorEmail } from "@/lib/notificarPorEmail";
import { resolverDataVencimento } from "@/lib/obterDataVencimento";
import { criarDocumentoGeradoComAuditoria, hashConteudo } from "@/lib/auditoriaDocumento";
import { podeAgirPelaEmpresa } from "@/lib/autorizacaoEmpresa";
import { criarSchemaDocumento } from "@/lib/schemas/documentoDinamico";
import { mensagensPorCampo, primeiraMensagemDeErro } from "@/lib/schemas/comuns";
import { resolverPeriodosFerias, validarFracionamentoFerias, type PeriodoFeriasInput } from "@/lib/listasDocumento";

interface TemplateRequisitado {
  templateId: string;
  dadosEntrada?: Record<string, unknown>;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id: funcionarioId } = await params;
  const corpo = await req.json();
  const templatesRequisitados: TemplateRequisitado[] = corpo.templates ?? [];

  const funcionario = await prisma.funcionario.findUnique({ where: { id: funcionarioId } });
  if (!funcionario || !podeAgirPelaEmpresa(session, funcionario.empresaId)) {
    return Response.json({ error: "Funcionário não encontrado." }, { status: 404 });
  }

  const empresa = await prisma.empresa.findUnique({ where: { id: funcionario.empresaId } });
  if (!empresa) {
    return Response.json({ error: "Empresa não encontrada." }, { status: 404 });
  }

  const usuarioId = session.user.id;
  const usuarioNome = session.user.nome ?? session.user.email ?? null;
  const dataGeracao = new Date();
  const resultados = [];

  for (const { templateId, dadosEntrada } of templatesRequisitados) {
    const template = await prisma.templateDocumento.findUnique({ where: { id: templateId } });
    if (!template) continue;

    // Valida os campos de escopo "documento" (formulário de emissão) contra o
    // catálogo — o schema é montado a partir de variaveisDetectadas, sem nada
    // fixo por documento.
    const schemaDocumento = criarSchemaDocumento(template.variaveisDetectadas);
    const validacao = schemaDocumento.safeParse(dadosEntrada ?? {});
    if (!validacao.success) {
      resultados.push({
        template: template.nome,
        erro: primeiraMensagemDeErro(validacao.error) || "Dados do formulário inválidos.",
        camposInvalidos: mensagensPorCampo(validacao.error),
      });
      continue;
    }

    const dadosDocumento: Record<string, unknown> = { ...validacao.data };

    if (Array.isArray(dadosDocumento.ferias_periodos)) {
      const periodosResolvidos = resolverPeriodosFerias(dadosDocumento.ferias_periodos as PeriodoFeriasInput[]);
      const erroFracionamento = validarFracionamentoFerias(periodosResolvidos);
      if (erroFracionamento) {
        resultados.push({ template: template.nome, erro: erroFracionamento });
        continue;
      }
    }

    const dados = mapearVariaveis(funcionario, empresa, { dataGeracao, dadosDocumento });
    // Snapshot pronto pra Json do Prisma — Date vira ISO string via JSON.stringify.
    const dadosEntradaPersistir = JSON.parse(JSON.stringify(dadosDocumento));

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

        const documento = await criarDocumentoGeradoComAuditoria({
          funcionarioId,
          templateId,
          templateNome: template.nome,
          templateHash: hashConteudo(JSON.stringify(template.conteudo)),
          urlPdf: caminhoSaida, // guarda o caminho do .docx, igual ao caminho UPLOAD
          dataVencimento: resolverDataVencimento(template, funcionario, dataGeracao),
          variaveisUsadas: dados,
          dadosEntrada: dadosEntradaPersistir,
          usuarioId,
          usuarioNome,
        });

        resultados.push({ template: template.nome, documentoId: documento.id, ok: true });
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

      const documento = await criarDocumentoGeradoComAuditoria({
        funcionarioId,
        templateId,
        templateNome: template.nome,
        templateHash: hashConteudo(buffer),
        urlPdf: caminhoSaida,
        dataVencimento: resolverDataVencimento(template, funcionario, dataGeracao),
        variaveisUsadas: dados,
        dadosEntrada: dadosEntradaPersistir,
        usuarioId,
        usuarioNome,
      });

      resultados.push({ template: template.nome, documentoId: documento.id, ok: true });
    } catch (err) {
      resultados.push({ template: template.nome, erro: "Erro ao preencher variáveis. Confira se o template usa [[campo]] corretamente." });
    }
  }

  await prisma.funcionario.update({
    where: { id: funcionarioId },
    data: { statusDocumentacao: "COMPLETO", dataUltimaGeracao: new Date() },
  });

  const gerados = resultados.filter((r) => r.ok).map((r) => r.template);
  if (gerados.length > 0) {
    const descricaoAtividade =
      gerados.length === 1
        ? `Documento "${gerados[0]}" gerado para ${funcionario.nomeCompleto}.`
        : `${gerados.length} documentos gerados para ${funcionario.nomeCompleto}: ${gerados.join(", ")}.`;

    await registrarAtividade({
      tipo: "GERACAO_DOCUMENTO",
      descricao: descricaoAtividade,
      entidade: "Funcionario",
      entidadeId: funcionarioId,
      empresaId: funcionario.empresaId,
      usuarioId: session.user.id,
    });
    await notificarPorEmail({ tipo: "GERACAO_DOCUMENTO", descricao: descricaoAtividade, empresaId: funcionario.empresaId });
  }

  return Response.json({ resultados });
}
