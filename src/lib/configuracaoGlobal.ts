import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DIAS_ALERTA_PADRAO } from "@/lib/vencimentos";

// Shape validado de ConfiguracaoGlobal.valores (id fixo "global"). Adicionar
// um ajuste global novo = adicionar um campo opcional aqui, sem precisar de
// migration no banco (é um JSON) — mesmo padrão de src/lib/preferencias.ts.
export const configuracaoGlobalSchema = z.object({
  diasAlertaPadrao: z.array(z.number().int().positive()).min(1).optional(),
});

export type ConfiguracaoGlobalValores = z.infer<typeof configuracaoGlobalSchema>;

/** Lê os marcos de alerta de vencimento configurados; cai pro DIAS_ALERTA_PADRAO fixo se nunca foi customizado. */
export async function lerDiasAlertaPadrao(): Promise<number[]> {
  const registro = await prisma.configuracaoGlobal.findUnique({ where: { id: "global" } });
  const resultado = configuracaoGlobalSchema.safeParse(registro?.valores);
  return resultado.success && resultado.data.diasAlertaPadrao ? resultado.data.diasAlertaPadrao : DIAS_ALERTA_PADRAO;
}
