import { prisma } from "@/lib/prisma";
import type { TipoAtividade } from "@prisma/client";

interface RegistrarAtividadeParams {
  tipo: TipoAtividade;
  /** Texto já pronto pra exibir na central de notificações, ex: "João Silva foi cadastrado". */
  descricao: string;
  entidade: string;
  entidadeId?: string;
  empresaId: string;
  usuarioId?: string;
  /** Só usado em tipo VENCIMENTO_PROXIMO — o marco (30/15/7...) que disparou o alerta. */
  diasAntecedencia?: number;
}

/**
 * Registra uma atividade da empresa-cliente pra central de notificações do admin.
 * Nunca lança erro: uma falha aqui não pode derrubar a operação principal que a originou.
 */
export async function registrarAtividade(dados: RegistrarAtividadeParams): Promise<void> {
  try {
    await prisma.notificacao.create({ data: dados });
  } catch (err) {
    console.error("Erro ao registrar atividade:", err);
  }
}
