import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificarFeedbackParams {
  texto: string;
  paginaOrigem: string;
  autorNome: string;
}

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Avisa todos os admins por e-mail quando chega uma nota do widget "Notei
 * falta de algo". Diferente de notificarPorEmail (atividades), não passa
 * pelo filtro de preferências por tipo — feedback é baixo volume e manual,
 * sempre vale notificar. Mesma postura defensiva: nunca lança erro.
 */
export async function notificarFeedbackPorEmail({ texto, paginaOrigem, autorNome }: NotificarFeedbackParams): Promise<void> {
  try {
    const admins = await prisma.usuario.findMany({ where: { papel: "ADMIN" }, select: { emailOuLogin: true } });
    if (admins.length === 0) return;

    const html = `<p><strong>${escaparHtml(autorNome)}</strong> deixou uma nota em <code>${escaparHtml(paginaOrigem)}</code>:</p><p>${escaparHtml(texto).replace(/\n/g, "<br/>")}</p>`;

    await Promise.all(
      admins.map((admin) =>
        resend.emails.send({
          from: "onboarding@resend.dev",
          to: admin.emailOuLogin,
          subject: "Nova nota de feedback — PACTA",
          html,
        })
      )
    );
  } catch (err) {
    console.error("Erro ao enviar e-mail de feedback:", err);
  }
}
