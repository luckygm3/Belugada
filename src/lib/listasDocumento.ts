/**
 * Cálculos das duas variáveis tipo 'lista' com loop de verdade no docxtemplater
 * (trajeto_linhas — D06, ferias_periodos — D10). Compartilhado entre a validação
 * da rota de geração e mapearVariaveis, pra não duplicar a conta em dois lugares.
 */

export interface LinhaTrajetoInput {
  linha: string;
  valor_passagem: number;
  quantidade: number;
}

export interface LinhaTrajetoResolvida extends LinhaTrajetoInput {
  total_dia: number;
}

/** total_dia é sempre calculado (valor_passagem × quantidade) — nunca digitado. */
export function resolverLinhasTrajeto(linhas: LinhaTrajetoInput[]): LinhaTrajetoResolvida[] {
  return linhas.map((l) => ({ ...l, total_dia: l.valor_passagem * l.quantidade }));
}

export function calcularTotalDiarioTrajeto(linhas: LinhaTrajetoResolvida[]): number {
  return linhas.reduce((soma, l) => soma + l.total_dia, 0);
}

export interface PeriodoFeriasInput {
  data_inicio: Date;
  data_fim: Date;
}

export interface PeriodoFeriasResolvido extends PeriodoFeriasInput {
  dias_corridos: number;
}

/** dias_corridos é sempre calculado (diferença inclusiva entre as datas) — nunca digitado. */
export function resolverPeriodosFerias(periodos: PeriodoFeriasInput[]): PeriodoFeriasResolvido[] {
  return periodos.map((p) => ({
    ...p,
    dias_corridos: Math.round((p.data_fim.getTime() - p.data_inicio.getTime()) / 86_400_000) + 1,
  }));
}

/**
 * CLT art. 134, §1º: fracionamento em até 3 períodos, sendo que um deles não
 * pode ser inferior a 14 dias corridos e os demais não podem ser inferiores
 * a 5 dias corridos cada. Retorna a mensagem de erro, ou null se válido.
 */
export function validarFracionamentoFerias(periodos: PeriodoFeriasResolvido[]): string | null {
  if (periodos.length === 0) return "Informe ao menos um período de férias.";
  if (periodos.length > 3) return "No máximo 3 períodos de férias fracionadas (art. 134, §1º da CLT).";
  if (periodos.some((p) => p.dias_corridos <= 0)) {
    return "Cada período precisa ter a data de término posterior (ou igual) à data de início.";
  }
  if (!periodos.some((p) => p.dias_corridos >= 14)) {
    return "Ao menos um dos períodos precisa ter 14 dias corridos ou mais (art. 134, §1º da CLT).";
  }
  if (periodos.some((p) => p.dias_corridos < 5)) {
    return "Todos os períodos precisam ter, no mínimo, 5 dias corridos (art. 134, §1º da CLT).";
  }
  return null;
}
