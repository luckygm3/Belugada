import { z } from "zod";
import { cnpjSchema, telefoneOpcionalSchema, cepOpcionalSchema, emailOpcionalSchema, cpfOpcionalSchema } from "./comuns";

const textoOpcional = z.string().optional().default("");

const socioSchema = z.object({
  nome: z.string().optional().default(""),
  qualificacao: z.string().optional().default(""),
});

// Usado na Etapa 1 do cadastro (admin/empresas/nova) — dados vindos da consulta de CNPJ + revisão manual
export const empresaCadastroSchema = z.object({
  cnpj: cnpjSchema,
  razaoSocial: z.string().trim().min(1, "Razão social é obrigatória."),
  nomeFantasia: textoOpcional,
  logradouro: textoOpcional,
  numero: textoOpcional,
  bairro: textoOpcional,
  cidade: textoOpcional,
  uf: textoOpcional,
  cep: cepOpcionalSchema,
  telefone: telefoneOpcionalSchema,
  dataAbertura: z.string().nullable().optional().default(null),
  situacaoCadastral: textoOpcional,
  naturezaJuridica: textoOpcional,
  capitalSocial: z.string().nullable().optional().default(null),
  porteEmpresa: textoOpcional,
  cnaePrincipal: textoOpcional,
  cnaesSecundarios: z.array(z.string()).optional().default([]),
  quadroSocietario: z.array(socioSchema).optional().default([]),
  responsavelNome: textoOpcional,
  responsavelCargo: textoOpcional,
  responsavelTelefone: telefoneOpcionalSchema,
  responsavelEmail: emailOpcionalSchema,
  loginAcesso: z.string().trim().min(1, "Login/e-mail de acesso é obrigatório."),
  senhaAcesso: z.string().min(1, "Senha é obrigatória."),
  plano: z.string().optional().default("MENSAL"),
  templatePersonalizadoIds: z.array(z.string()).optional().default([]),
});

// Campos da Etapa 1 (CNPJ + revisão de dados) — subconjunto validado antes de avançar para a Etapa 2
export const empresaCadastroEtapa1Schema = empresaCadastroSchema.pick({
  cnpj: true,
  razaoSocial: true,
  telefone: true,
  cep: true,
  responsavelTelefone: true,
  responsavelEmail: true,
});

// Usado na edição de dados cadastrais (admin/empresas/[id]) — CNPJ não é editável depois de criado
export const empresaEdicaoSchema = z.object({
  razaoSocial: z.string().trim().min(1, "Razão social é obrigatória."),
  nomeFantasia: textoOpcional,
  logradouro: textoOpcional,
  numero: textoOpcional,
  complemento: textoOpcional,
  bairro: textoOpcional,
  cidade: textoOpcional,
  uf: textoOpcional,
  cep: cepOpcionalSchema,
  telefone: telefoneOpcionalSchema,
  emailCorporativo: emailOpcionalSchema,
  planoContratado: textoOpcional,
  statusPagamento: z.enum(["ATIVO", "ATRASADO", "CANCELADO"]),
  responsavelNome: textoOpcional,
  responsavelCargo: textoOpcional,
  responsavelTelefone: telefoneOpcionalSchema,
  responsavelEmail: emailOpcionalSchema,
  representanteLegalNome: textoOpcional,
  representanteLegalCargo: textoOpcional,
  representanteLegalCpf: cpfOpcionalSchema,
});

// Usado pela própria empresa-cliente em Configurações (PATCH /api/empresa/dados) —
// subconjunto de empresaEdicaoSchema: só campos não-sensíveis (endereço, telefone,
// responsável). razaoSocial/nomeFantasia/emailCorporativo/planoContratado/
// statusPagamento continuam só-leitura pra empresa, editáveis só pelo admin.
export const empresaAutoEdicaoSchema = empresaEdicaoSchema.pick({
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  cep: true,
  telefone: true,
  responsavelNome: true,
  responsavelCargo: true,
  responsavelTelefone: true,
  responsavelEmail: true,
});

export type EmpresaCadastroInput = z.infer<typeof empresaCadastroSchema>;
export type EmpresaEdicaoInput = z.infer<typeof empresaEdicaoSchema>;
export type EmpresaAutoEdicaoInput = z.infer<typeof empresaAutoEdicaoSchema>;
