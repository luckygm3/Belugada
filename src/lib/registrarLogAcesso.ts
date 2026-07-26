import { prisma } from "@/lib/prisma";

interface RegistrarLogAcessoParams {
  usuarioId: string;
  sucesso: boolean;
  motivoFalha?: string;
  userAgent?: string | null;
  ip?: string | null;
}

/**
 * Registra uma tentativa de login (sucesso ou falha) pro próprio usuário ver
 * o histórico em Configurações. Nunca lança erro: uma falha aqui não pode
 * travar o login em si — mesma postura defensiva de registrarAtividade.
 */
export async function registrarLogAcesso(dados: RegistrarLogAcessoParams): Promise<void> {
  try {
    await prisma.logAcesso.create({ data: dados });
  } catch (err) {
    console.error("Erro ao registrar log de acesso:", err);
  }
}
