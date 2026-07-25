import type { Funcionario } from "@prisma/client";

// Só variáveis que são campos de data reais no Funcionario podem virar vencimento —
// mapearVariaveis.ts formata pra string de exibição, aqui precisamos do Date bruto.
const CAMPOS_DATA_FUNCIONARIO: Partial<Record<string, keyof Funcionario>> = {
  data_nascimento: "dataNascimento",
  data_admissao: "dataAdmissao",
  data_termino_contrato: "dataTerminoContrato",
};

export function obterDataVencimento(funcionario: Funcionario, variavel: string | null): Date | null {
  if (!variavel) return null;
  const campo = CAMPOS_DATA_FUNCIONARIO[variavel];
  if (!campo) return null;
  const valor = funcionario[campo];
  return valor instanceof Date ? valor : null;
}
