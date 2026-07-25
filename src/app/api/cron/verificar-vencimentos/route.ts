import { prisma } from "@/lib/prisma";
import { registrarAtividade } from "@/lib/registrarAtividade";
import { DIAS_ALERTA_PADRAO, descricaoPrazo } from "@/lib/vencimentos";
import { Prisma } from "@prisma/client";

// Disparado diariamente pelo Vercel Cron (vercel.json). Vercel injeta o header
// abaixo automaticamente quando a env var CRON_SECRET existe no projeto.
function autorizado(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!autorizado(req)) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const documentos = await prisma.documentoGerado.findMany({
    where: { dataVencimento: { not: null } },
    include: {
      funcionario: { select: { nomeCompleto: true, empresaId: true } },
      template: { select: { nome: true, diasAlertaVencimento: true } },
      alertasEnviados: { select: { diasAntecedencia: true } },
    },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let notificacoesCriadas = 0;

  for (const doc of documentos) {
    if (!doc.dataVencimento) continue;

    const vencimento = new Date(doc.dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    const diasRestantes = Math.round((vencimento.getTime() - hoje.getTime()) / 86_400_000);

    const marcos = doc.template.diasAlertaVencimento.length > 0
      ? doc.template.diasAlertaVencimento
      : DIAS_ALERTA_PADRAO;
    const jaEnviados = new Set(doc.alertasEnviados.map((a) => a.diasAntecedencia));
    const marcosOrdenados = [...marcos].sort((a, b) => b - a);

    for (const marco of marcosOrdenados) {
      if (diasRestantes > marco || jaEnviados.has(marco)) continue;

      try {
        await prisma.alertaVencimentoEnviado.create({
          data: { documentoGeradoId: doc.id, diasAntecedencia: marco },
        });
      } catch (err) {
        // corrida rara (cron rodando 2x ao mesmo tempo) — a unique constraint já
        // garante que o alerta não sai duplicado, só pulamos pro próximo marco.
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
        throw err;
      }

      await registrarAtividade({
        tipo: "VENCIMENTO_PROXIMO",
        descricao: `${doc.template.nome} de ${doc.funcionario.nomeCompleto} ${descricaoPrazo(diasRestantes)} (${vencimento.toLocaleDateString("pt-BR")}).`,
        entidade: "DocumentoGerado",
        entidadeId: doc.id,
        empresaId: doc.funcionario.empresaId,
        diasAntecedencia: marco,
      });
      notificacoesCriadas++;
    }
  }

  return Response.json({ ok: true, documentosVerificados: documentos.length, notificacoesCriadas });
}
