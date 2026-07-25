import type { TipoAtividade } from "@prisma/client";

export const ROTULOS_TIPO_ATIVIDADE: Record<TipoAtividade, string> = {
  CRIACAO: "Criação",
  EDICAO: "Edição",
  EXCLUSAO: "Exclusão",
  GERACAO_DOCUMENTO: "Geração de documento",
  VENCIMENTO_PROXIMO: "Vencimento próximo",
};

export function formatarTempoRelativo(data: string | Date): string {
  const diffMs = Date.now() - new Date(data).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;

  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `há ${diffHoras} h`;

  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias < 7) return `há ${diffDias} d`;

  return new Date(data).toLocaleDateString("pt-BR");
}
