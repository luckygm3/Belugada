import type { Funcionario, TemplateDocumento } from "@prisma/client";

// Só variáveis que são campos de data reais no Funcionario podem virar vencimento —
// mapearVariaveis.ts formata pra string de exibição, aqui precisamos do Date bruto.
// Nenhum dos 17 documentos atuais usa isso hoje (ver catálogo em variaveis-disponiveis.ts) —
// fica pronto pra quando algum template vier a expor uma variável de data do funcionário.
const CAMPOS_DATA_FUNCIONARIO: Partial<Record<string, keyof Funcionario>> = {
  funcionario_data_admissao: "dataAdmissao",
};

export function obterDataVencimento(funcionario: Funcionario, variavel: string | null): Date | null {
  if (!variavel) return null;
  const campo = CAMPOS_DATA_FUNCIONARIO[variavel];
  if (!campo) return null;
  const valor = funcionario[campo];
  return valor instanceof Date ? valor : null;
}

type TemplateVencimentoIndividual = Pick<
  TemplateDocumento,
  "variavelVencimento" | "vencimentoIndividualData" | "vencimentoIndividualDias"
>;

/**
 * Resolve o vencimento de um documento a ser gerado. O vencimento individual
 * definido no upload do template (data fixa ou prazo em dias) tem prioridade
 * sobre o cálculo por variável do funcionário — é o que o admin escolheu
 * explicitamente pra aquele documento.
 */
export function resolverDataVencimento(
  template: TemplateVencimentoIndividual,
  funcionario: Funcionario,
  dataGeracao: Date
): Date | null {
  if (template.vencimentoIndividualData) return template.vencimentoIndividualData;

  if (template.vencimentoIndividualDias != null) {
    const data = new Date(dataGeracao);
    data.setDate(data.getDate() + template.vencimentoIndividualDias);
    return data;
  }

  return obterDataVencimento(funcionario, template.variavelVencimento);
}
