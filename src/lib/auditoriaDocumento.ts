import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma, type TipoEventoAuditoria, type DocumentoGerado } from "@prisma/client";

/** SHA-256 hex do conteúdo do template usado numa geração — prova qual versão foi usada mesmo sem versionamento formal. */
export function hashConteudo(conteudo: Buffer | string): string {
  const buffer = typeof conteudo === "string" ? Buffer.from(conteudo, "utf8") : conteudo;
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

interface RegistrarEventoAuditoriaParams {
  documentoGeradoId: string;
  tipo: TipoEventoAuditoria;
  usuarioId?: string | null;
  usuarioNome?: string | null;
  templateId?: string;
  templateNome?: string;
  templateHash?: string;
  variaveisUsadas?: Record<string, unknown>;
  documentoSubstitutoId?: string;
}

/**
 * Registra um evento na trilha de auditoria (DOWNLOAD, SUBSTITUIDO). Nunca
 * lança erro — mesma postura defensiva de registrarAtividade/registrarLogAcesso:
 * uma falha aqui não pode travar o download ou a geração que a originou.
 */
export async function registrarEventoAuditoria(dados: RegistrarEventoAuditoriaParams): Promise<void> {
  try {
    await prisma.auditoriaDocumento.create({
      data: {
        ...dados,
        variaveisUsadas: dados.variaveisUsadas as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("Erro ao registrar evento de auditoria de documento:", err);
  }
}

interface CriarDocumentoGeradoComAuditoriaParams {
  funcionarioId: string;
  templateId: string;
  templateNome: string;
  templateHash: string;
  urlPdf: string;
  dataVencimento: Date | null;
  variaveisUsadas: Record<string, unknown>;
  usuarioId: string;
  usuarioNome: string | null;
  /** Valores de escopo "documento" digitados no formulário de emissão (já validados). */
  dadosEntrada?: Record<string, unknown>;
}

/**
 * Cria o DocumentoGerado e a entrada GERACAO da auditoria juntos, na mesma
 * transação — diferente dos outros eventos, a geração fundadora não pode
 * "quase" acontecer (documento existir sem o registro que prova como nasceu).
 * Depois, fora da transação (best-effort, não desfaz a criação se falhar),
 * marca SUBSTITUIDO em qualquer documento anterior do mesmo
 * funcionário+template — a regeneração já cria uma linha nova por padrão,
 * isso só instrumenta esse comportamento existente como evento auditável,
 * sem apagar nem editar o histórico anterior.
 */
export async function criarDocumentoGeradoComAuditoria(
  params: CriarDocumentoGeradoComAuditoriaParams
): Promise<DocumentoGerado> {
  const anteriores = await prisma.documentoGerado.findMany({
    where: { funcionarioId: params.funcionarioId, templateId: params.templateId },
    select: { id: true },
  });

  const novoDocumento = await prisma.$transaction(async (tx) => {
    const documento = await tx.documentoGerado.create({
      data: {
        funcionarioId: params.funcionarioId,
        templateId: params.templateId,
        urlPdf: params.urlPdf,
        dataVencimento: params.dataVencimento,
        dadosEntrada: params.dadosEntrada as Prisma.InputJsonValue | undefined,
      },
    });

    await tx.auditoriaDocumento.create({
      data: {
        documentoGeradoId: documento.id,
        tipo: "GERACAO",
        usuarioId: params.usuarioId,
        usuarioNome: params.usuarioNome,
        templateId: params.templateId,
        templateNome: params.templateNome,
        templateHash: params.templateHash,
        variaveisUsadas: params.variaveisUsadas as Prisma.InputJsonValue,
      },
    });

    return documento;
  });

  for (const anterior of anteriores) {
    await registrarEventoAuditoria({
      documentoGeradoId: anterior.id,
      tipo: "SUBSTITUIDO",
      usuarioId: params.usuarioId,
      usuarioNome: params.usuarioNome,
      documentoSubstitutoId: novoDocumento.id,
    });
  }

  return novoDocumento;
}
