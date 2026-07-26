import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { preferenciaEmailAtiva } from "@/lib/preferencias";
import { ROTULOS_TIPO_ATIVIDADE } from "@/lib/notificacoes";
import type { TipoAtividade } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificarPorEmailParams {
  tipo: TipoAtividade;
  descricao: string;
  empresaId: string;
}

/**
 * Envia e-mail de notificação pros admins e usuários da empresa que tiverem a
 * preferência ligada pra esse tipo de evento — chamado logo após
 * registrarAtividade() nos mesmos call sites e no cron de vencimento.
 * Nunca lança erro: mesma postura defensiva de registrarAtividade.
 */
export async function notificarPorEmail({ tipo, descricao, empresaId }: NotificarPorEmailParams): Promise<void> {
  try {
    const [admins, usuariosEmpresa] = await Promise.all([
      prisma.usuario.findMany({ where: { papel: "ADMIN" }, select: { emailOuLogin: true, preferencias: true } }),
      prisma.usuario.findMany({
        where: { papel: "EMPRESA", empresaId },
        select: { emailOuLogin: true, preferencias: true },
      }),
    ]);

    const destinatarios = [
      ...admins.filter((a) => preferenciaEmailAtiva(a.preferencias, "ADMIN", tipo)).map((a) => a.emailOuLogin),
      ...usuariosEmpresa
        .filter((u) => preferenciaEmailAtiva(u.preferencias, "EMPRESA", tipo))
        .map((u) => u.emailOuLogin),
    ];
    if (destinatarios.length === 0) return;

    await Promise.all(
      destinatarios.map((to) =>
        resend.emails.send({
          from: "onboarding@resend.dev",
          to,
          subject: ROTULOS_TIPO_ATIVIDADE[tipo],
          html: `<p>${descricao}</p>`,
        })
      )
    );
  } catch (err) {
    console.error("Erro ao enviar e-mail de notificação:", err);
  }
}
