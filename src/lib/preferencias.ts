import { z } from "zod";
import { TipoAtividade } from "@prisma/client";

// Preferências de notificação por e-mail — mapa tipo de evento -> ligado/desligado.
// Campos ausentes usam o default por papel (ver DEFAULTS_EMAIL_POR_PAPEL/preferenciaEmailAtiva).
// digestDiario é reservado pra fase futura (resumo diário agrupado) — sem lógica
// de batching ainda, só guarda a preferência pra não precisar migration depois.
const preferenciasNotificacaoSchema = z.object({
  // partialRecord, não record: nem todo tipo de evento precisa estar presente
  // no JSON salvo — só os que o usuário já mexeu (ver preferenciaEmailAtiva).
  email: z.partialRecord(z.enum(TipoAtividade), z.boolean()).optional(),
  digestDiario: z.boolean().optional(),
});

// Shape validado das preferências salvas na conta (Usuario.preferencias).
// Adicionar uma preferência nova = adicionar um campo opcional aqui, sem
// precisar de migration no banco (é um JSON).
export const preferenciasSchema = z.object({
  tema: z.enum(["light", "dark"]).optional(),
  notificacoes: preferenciasNotificacaoSchema.optional(),
});

export type Preferencias = z.infer<typeof preferenciasSchema>;

/** Lê o campo `preferencias` (Json? — tipo `unknown` na prática) com segurança. */
export function lerPreferencias(valor: unknown): Preferencias {
  const resultado = preferenciasSchema.safeParse(valor);
  return resultado.success ? resultado.data : {};
}

// Defaults por papel — aplicados só na leitura (nunca persistidos), pra quem
// nunca abriu a página de Configurações. ADMIN só recebe e-mail de prazo por
// padrão (evita ruído de CRIACAO/EDICAO/EXCLUSAO/GERACAO_DOCUMENTO, que já
// aparecem na central in-app); EMPRESA só enxerga o toggle de vencimento.
const DEFAULTS_EMAIL_POR_PAPEL: Record<"ADMIN" | "EMPRESA", Partial<Record<TipoAtividade, boolean>>> = {
  ADMIN: {
    CRIACAO: false,
    EDICAO: false,
    EXCLUSAO: false,
    GERACAO_DOCUMENTO: false,
    VENCIMENTO_PROXIMO: true,
  },
  EMPRESA: {
    VENCIMENTO_PROXIMO: true,
  },
};

/** Resolve se um usuário deve receber e-mail para `tipo`, aplicando o default do papel quando a preferência ainda não foi salva. */
export function preferenciaEmailAtiva(
  preferencias: unknown,
  papel: "ADMIN" | "EMPRESA",
  tipo: TipoAtividade
): boolean {
  const salvas = lerPreferencias(preferencias).notificacoes?.email;
  if (salvas && tipo in salvas) return salvas[tipo] as boolean;
  return DEFAULTS_EMAIL_POR_PAPEL[papel][tipo] ?? false;
}
