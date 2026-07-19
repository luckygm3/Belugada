export interface VariavelDisponivel {
  key: string
  label: string
}

// Mantém sincronizado manualmente com as chaves retornadas por lib/mapearVariaveis.ts
export const VARIAVEIS_DISPONIVEIS: VariavelDisponivel[] = [
  { key: "nome_funcionario", label: "Nome do Funcionário" },
  { key: "cpf", label: "CPF" },
  { key: "rg", label: "RG" },
  { key: "data_nascimento", label: "Data de Nascimento" },
  { key: "estado_civil", label: "Estado Civil" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "E-mail" },
  { key: "logradouro", label: "Logradouro" },
  { key: "numero", label: "Número" },
  { key: "bairro", label: "Bairro" },
  { key: "cidade", label: "Cidade" },
  { key: "uf", label: "UF" },
  { key: "cep", label: "CEP" },
  { key: "cargo", label: "Cargo" },
  { key: "departamento", label: "Departamento" },
  { key: "data_admissao", label: "Data de Admissão" },
  { key: "tipo_contrato", label: "Tipo de Contrato" },
  { key: "salario_base", label: "Salário Base" },
  { key: "jornada_trabalho", label: "Jornada de Trabalho" },
  { key: "razao_social", label: "Razão Social (Empresa)" },
  { key: "nome_fantasia", label: "Nome Fantasia (Empresa)" },
  { key: "cnpj", label: "CNPJ (Empresa)" },
]