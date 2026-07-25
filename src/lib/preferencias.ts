import { z } from "zod";

// Shape validado das preferências salvas na conta (Usuario.preferencias).
// Adicionar uma preferência nova = adicionar um campo opcional aqui, sem
// precisar de migration no banco (é um JSON).
export const preferenciasSchema = z.object({
  tema: z.enum(["light", "dark"]).optional(),
});

export type Preferencias = z.infer<typeof preferenciasSchema>;

/** Lê o campo `preferencias` (Json? — tipo `unknown` na prática) com segurança. */
export function lerPreferencias(valor: unknown): Preferencias {
  const resultado = preferenciasSchema.safeParse(valor);
  return resultado.success ? resultado.data : {};
}
