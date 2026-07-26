import { z } from "zod";
import { validarCPF, validarCNPJ } from "@/lib/validacao";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export const cnpjSchema = z
  .string()
  .transform(somenteDigitos)
  .refine((v) => v.length === 14, { message: "CNPJ deve ter 14 dígitos." })
  .refine((v) => v.length !== 14 || validarCNPJ(v), {
    message: "CNPJ inválido (dígito verificador não confere).",
  });

export const cpfSchema = z
  .string()
  .transform(somenteDigitos)
  .refine((v) => v.length === 11, { message: "CPF deve ter 11 dígitos." })
  .refine((v) => v.length !== 11 || validarCPF(v), {
    message: "CPF inválido (dígito verificador não confere).",
  });

// Campo opcional: string vazia é um valor válido; se algo for digitado, precisa ser um CPF válido.
export const cpfOpcionalSchema = z
  .string()
  .transform(somenteDigitos)
  .refine((v) => v === "" || (v.length === 11 && validarCPF(v)), { message: "CPF inválido." });

// Campos opcionais: string vazia é um valor válido (campo não preenchido);
// se algo for digitado, precisa respeitar o formato.
export const telefoneOpcionalSchema = z
  .string()
  .transform(somenteDigitos)
  .refine((v) => v === "" || v.length >= 10, {
    message: "Telefone deve conter apenas números e ter ao menos 10 dígitos (DDD + número).",
  });

export const cepOpcionalSchema = z
  .string()
  .transform(somenteDigitos)
  .refine((v) => v === "" || v.length === 8, { message: "CEP deve ter 8 dígitos." });

export const emailOpcionalSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || EMAIL_REGEX.test(v), { message: "E-mail inválido." });

export function primeiraMensagemDeErro(erro: z.ZodError): string {
  return erro.issues[0]?.message ?? "Dados inválidos.";
}

export function mensagensPorCampo(erro: z.ZodError): Record<string, string> {
  const mensagens: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "");
    if (campo && !mensagens[campo]) {
      mensagens[campo] = issue.message;
    }
  }
  return mensagens;
}
