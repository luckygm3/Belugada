import { Funcionario, Empresa } from "@prisma/client";

function formatarData(data: Date | null): string {
  if (!data) return "";
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

function formatarMoeda(valor: number | null): string {
  if (valor === null) return "";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(valor);
}

export function mapearVariaveis(funcionario: Funcionario, empresa: Empresa) {
  return {
    nome_funcionario: funcionario.nomeCompleto,
    cpf: funcionario.cpf,
    rg: funcionario.rg || "",
    data_nascimento: formatarData(funcionario.dataNascimento),
    estado_civil: funcionario.estadoCivil || "",
    telefone: funcionario.telefone || "",
    email: funcionario.email || "",
    logradouro: funcionario.logradouro || "",
    numero: funcionario.numero || "",
    bairro: funcionario.bairro || "",
    cidade: funcionario.cidade || "",
    uf: funcionario.uf || "",
    cep: funcionario.cep || "",
    cargo: funcionario.cargo || "",
    departamento: funcionario.departamento || "",
    data_admissao: formatarData(funcionario.dataAdmissao),
    data_termino_contrato: formatarData(funcionario.dataTerminoContrato),
    tipo_contrato: funcionario.tipoContrato || "",
    salario_base: formatarMoeda(funcionario.salarioBase),
    jornada_trabalho: funcionario.jornadaTrabalho || "",
    razao_social: empresa.razaoSocial,
    nome_fantasia: empresa.nomeFantasia || "",
    cnpj: empresa.cnpj,
  };
}