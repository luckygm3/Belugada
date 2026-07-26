import { z } from "zod";

// emailOuLogin nem sempre é um e-mail de verdade (contas antigas podem usar um
// login simples) — por isso só valida tamanho aqui, não formato de e-mail.
export const perfilSchema = z
  .object({
    nome: z.string().trim().min(2, "Nome deve ter ao menos 2 caracteres.").max(120).optional(),
    emailOuLogin: z.string().trim().min(3, "Login/e-mail muito curto.").max(190).optional(),
  })
  .refine((d) => d.nome !== undefined || d.emailOuLogin !== undefined, { message: "Nada para atualizar." });

export const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual."),
  novaSenha: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres."),
});
