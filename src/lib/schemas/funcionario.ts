import { z } from "zod";
import { cpfSchema, telefoneOpcionalSchema, cepOpcionalSchema, emailOpcionalSchema } from "./comuns";

const textoOpcional = z.string().optional().default("");

const NOME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const RG_REGEX = /^[A-Za-z0-9.\-\s]+$/;

const rgSchema = z
  .string()
  .refine((v) => v === "" || RG_REGEX.test(v), { message: "RG deve conter apenas letras e números." });

const dataNascimentoSchema = z
  .string()
  .refine((v) => v === "" || !isNaN(Date.parse(v)), { message: "Data de nascimento inválida." })
  .refine((v) => v === "" || new Date(v) <= new Date(), {
    message: "Data de nascimento não pode ser uma data futura.",
  });

const dependenteSchema = z.object({
  nome: z.string().optional().default(""),
  parentesco: z.string().optional().default(""),
  dataNascimento: z.string().optional().default(""),
});

// Usado no cadastro/edição de funcionário (FuncionarioForm) — cobre as 5 etapas do formulário
export const funcionarioSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(3, "Nome completo deve ter ao menos 3 caracteres.")
    .refine((v) => NOME_REGEX.test(v), {
      message: "Nome completo deve conter apenas letras e espaços.",
    }),
  cpf: cpfSchema,
  rg: rgSchema,
  dataNascimento: dataNascimentoSchema,
  estadoCivil: textoOpcional,
  logradouro: textoOpcional,
  numero: textoOpcional,
  bairro: textoOpcional,
  cidade: textoOpcional,
  uf: textoOpcional,
  cep: cepOpcionalSchema,
  telefone: telefoneOpcionalSchema,
  email: emailOpcionalSchema,
  cargo: textoOpcional,
  departamento: textoOpcional,
  dataAdmissao: z.string().optional().default(""),
  dataTerminoContrato: z.string().optional().default(""),
  tipoContrato: z.string().optional().default("CLT"),
  salarioBase: z.string().optional().default(""),
  dependentes: z.array(dependenteSchema).optional().default([]),
});

// Etapa 1 (dados pessoais) — validada antes de avançar para a Etapa 2
export const funcionarioEtapa1Schema = funcionarioSchema.pick({
  nomeCompleto: true,
  cpf: true,
  rg: true,
  dataNascimento: true,
});

// Etapa 2 (endereço/contato) — validada antes de avançar para a Etapa 3
export const funcionarioEtapa2Schema = funcionarioSchema.pick({
  cep: true,
  telefone: true,
  email: true,
});

export type FuncionarioInput = z.infer<typeof funcionarioSchema>;
