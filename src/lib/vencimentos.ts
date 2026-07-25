// Marcos de antecedência usados quando o template não define os seus próprios
// (TemplateDocumento.diasAlertaVencimento vazio).
export const DIAS_ALERTA_PADRAO = [30, 15, 7];

export type NivelUrgencia = "urgente" | "atencao";

/** ≤7 dias = urgente (vermelho); marcos maiores (15/30) = atenção (âmbar). */
export function nivelUrgencia(diasAntecedencia: number | null | undefined): NivelUrgencia | null {
  if (diasAntecedencia == null) return null;
  return diasAntecedencia <= 7 ? "urgente" : "atencao";
}

export function descricaoPrazo(diasRestantes: number): string {
  if (diasRestantes < 0) return `venceu há ${Math.abs(diasRestantes)} dia(s)`;
  if (diasRestantes === 0) return "vence hoje";
  return `vence em ${diasRestantes} dia(s)`;
}
