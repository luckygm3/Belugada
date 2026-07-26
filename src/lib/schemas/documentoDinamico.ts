import { z } from "zod";
import { validarCPF, validarCNPJ } from "@/lib/validacao";
import { cepOpcionalSchema, telefoneOpcionalSchema } from "./comuns";
import { obterVariavel, CHAVES_LISTA_ESTATICA, type VariavelDisponivel } from "@/lib/variaveis-disponiveis";

/**
 * Monta, em tempo de execução, o Zod dos campos de escopo "documento" de um
 * template — sem schema fixo por documento. A fonte de verdade do tipo de
 * cada campo é sempre o catálogo (variaveis-disponiveis.ts); isso é o que
 * permite um template novo ganhar formulário sem tocar em código.
 */

function opcionalSeVazio<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());
}

function schemaTexto(obrigatoria: boolean, label: string): z.ZodTypeAny {
  const base = z.string().trim();
  return obrigatoria ? base.min(1, `${label} é obrigatório.`) : base.optional().default("");
}

function schemaSelecao(obrigatoria: boolean, label: string, opcoes: string[]): z.ZodTypeAny {
  const base = z.string().refine((v) => v === "" || opcoes.includes(v), { message: "Opção inválida." });
  return obrigatoria
    ? base.refine((v) => v !== "", { message: `Selecione ${label.toLowerCase()}.` })
    : base.optional().default("");
}

function schemaNumero(opts: { obrigatoria: boolean; label: string; inteiro?: boolean; naoNegativo?: boolean }): z.ZodTypeAny {
  let base = z.coerce.number();
  if (opts.inteiro) base = base.int(`${opts.label} deve ser um número inteiro.`);
  if (opts.naoNegativo) base = base.nonnegative(`${opts.label} não pode ser negativo.`);
  return opts.obrigatoria ? base : opcionalSeVazio(base);
}

function schemaData(obrigatoria: boolean): z.ZodTypeAny {
  const base = z.coerce.date();
  return obrigatoria ? base : opcionalSeVazio(base);
}

function schemaHora(obrigatoria: boolean, label: string): z.ZodTypeAny {
  const base = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} inválida — use o formato HH:mm.`);
  return obrigatoria ? base : z.union([z.literal(""), base]).optional().default("");
}

function schemaDocumentoNumerico(obrigatoria: boolean, label: string, digitos: 11 | 14, validar: (v: string) => boolean): z.ZodTypeAny {
  return z
    .string()
    .optional()
    .default("")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => (obrigatoria ? v.length === digitos : v === "" || v.length === digitos), {
      message: `${label} deve ter ${digitos} dígitos.`,
    })
    .refine((v) => v === "" || validar(v), { message: `${label} inválido.` });
}

function schemaPlaca(obrigatoria: boolean, label: string): z.ZodTypeAny {
  const regex = /^[A-Z]{3}\d[A-Z\d]\d{2}$/; // cobre padrão antigo (LLL9999) e Mercosul (LLL9L99)
  const base = z
    .string()
    .trim()
    .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .refine((v) => v === "" || regex.test(v), { message: `${label} inválida.` });
  return obrigatoria ? base.refine((v) => v !== "", { message: `${label} é obrigatória.` }) : base;
}

function schemaCepComObrigatoriedade(obrigatoria: boolean, label: string): z.ZodTypeAny {
  return obrigatoria ? cepOpcionalSchema.refine((v) => v !== "", { message: `${label} é obrigatório.` }) : cepOpcionalSchema;
}

function schemaTelefoneComObrigatoriedade(obrigatoria: boolean, label: string): z.ZodTypeAny {
  return obrigatoria ? telefoneOpcionalSchema.refine((v) => v !== "", { message: `${label} é obrigatório.` }) : telefoneOpcionalSchema;
}

function schemaEscalar(variavel: VariavelDisponivel): z.ZodTypeAny {
  const obrigatoria = variavel.obrigatoria ?? false;
  const label = variavel.label;

  switch (variavel.tipo) {
    case "texto":
    case "texto_longo":
      return schemaTexto(obrigatoria, label);
    case "selecao":
      return schemaSelecao(obrigatoria, label, variavel.opcoes ?? []);
    case "booleano":
      return z.boolean().optional().default(false);
    case "numero":
      return schemaNumero({ obrigatoria, label });
    case "percentual":
      return schemaNumero({ obrigatoria, label, naoNegativo: true });
    case "moeda":
      return schemaNumero({ obrigatoria, label, naoNegativo: true });
    case "data":
      return schemaData(obrigatoria);
    case "hora":
      return schemaHora(obrigatoria, label);
    case "cpf":
      return schemaDocumentoNumerico(obrigatoria, label, 11, validarCPF);
    case "cnpj":
      return schemaDocumentoNumerico(obrigatoria, label, 14, validarCNPJ);
    case "cep":
      return schemaCepComObrigatoriedade(obrigatoria, label);
    case "telefone":
      return schemaTelefoneComObrigatoriedade(obrigatoria, label);
    case "placa":
      return schemaPlaca(obrigatoria, label);
    default:
      return z.string().optional().default("");
  }
}

const SCHEMA_TRAJETO_LINHA = z.object({
  linha: z.string().trim().min(1, "Informe a linha."),
  valor_passagem: z.coerce.number().nonnegative("Valor da passagem não pode ser negativo."),
  quantidade: z.coerce.number().int("Quantidade deve ser um número inteiro.").positive("Quantidade deve ser maior que zero."),
});
const SCHEMA_TRAJETO_LINHAS = z.array(SCHEMA_TRAJETO_LINHA).min(1, "Adicione ao menos uma linha.");

const SCHEMA_PERIODO_FERIAS = z
  .object({
    data_inicio: z.coerce.date(),
    data_fim: z.coerce.date(),
  })
  .refine((p) => p.data_fim >= p.data_inicio, {
    message: "A data de término deve ser igual ou posterior à data de início.",
    path: ["data_fim"],
  });
const SCHEMA_FERIAS_PERIODOS = z.array(SCHEMA_PERIODO_FERIAS).min(1, "Adicione ao menos um período.").max(3, "No máximo 3 períodos.");

function schemaLista(variavel: VariavelDisponivel): z.ZodTypeAny {
  if (variavel.key === "trajeto_linhas") return SCHEMA_TRAJETO_LINHAS;
  if (variavel.key === "ferias_periodos") return SCHEMA_FERIAS_PERIODOS;
  return z.array(z.record(z.string(), z.string())).optional().default([]);
}

function schemaParaVariavel(variavel: VariavelDisponivel): z.ZodTypeAny {
  return variavel.tipo === "lista" ? schemaLista(variavel) : schemaEscalar(variavel);
}

/** Campos de escopo "documento" que um template pede no formulário de emissão, na ordem do catálogo. */
export function obterCamposDocumento(variaveisDetectadas: string[]): VariavelDisponivel[] {
  const detectadas = new Set(variaveisDetectadas);
  return variaveisDetectadas
    .map(obterVariavel)
    .filter((v): v is VariavelDisponivel => {
      if (!v || v.escopo !== "documento") return false;
      if (v.calculada || CHAVES_LISTA_ESTATICA.includes(v.key)) return false;
      return detectadas.has(v.key);
    });
}

/** Zod dinâmico com um campo por variável de escopo "documento" detectada no template. */
export function criarSchemaDocumento(variaveisDetectadas: string[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const variavel of obterCamposDocumento(variaveisDetectadas)) {
    shape[variavel.key] = schemaParaVariavel(variavel);
  }
  return z.object(shape);
}

export type DadosDocumentoInput = Record<string, unknown>;
