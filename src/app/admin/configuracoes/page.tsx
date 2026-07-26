import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConfiguracoesView } from "@/components/configuracoes/ConfiguracoesView";
import { lerDiasAlertaPadrao } from "@/lib/configuracaoGlobal";

export default async function ConfiguracoesAdminPage() {
  const session = await auth();

  const [usuario, sessoes, admins, diasAlertaPadrao, logsAcesso, ultimoConsentimento] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: session!.user.id },
      select: { nome: true, emailOuLogin: true, avatarUrl: true, preferencias: true, totpAtivado: true },
    }),
    prisma.sessaoAtiva.findMany({
      where: { usuarioId: session!.user.id, revogadaEm: null },
      orderBy: { criadoEm: "desc" },
      select: { id: true, userAgent: true, ip: true, criadoEm: true, ultimoUso: true },
    }),
    prisma.usuario.findMany({
      where: { papel: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, nome: true, emailOuLogin: true, ativo: true, tokenReset: true, tokenResetExpira: true },
    }),
    lerDiasAlertaPadrao(),
    prisma.logAcesso.findMany({
      where: { usuarioId: session!.user.id },
      orderBy: { criadoEm: "desc" },
      take: 20,
      select: { id: true, sucesso: true, motivoFalha: true, userAgent: true, ip: true, criadoEm: true },
    }),
    prisma.consentimentoCookies.findFirst({
      where: { usuarioId: session!.user.id },
      orderBy: { criadoEm: "desc" },
      select: { criadoEm: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Configurações</h1>
      <ConfiguracoesView
        papel="ADMIN"
        usuario={{
          nome: usuario?.nome ?? null,
          emailOuLogin: usuario?.emailOuLogin ?? "",
          avatarUrl: usuario?.avatarUrl ?? null,
        }}
        preferenciasIniciais={usuario?.preferencias ?? null}
        sessoesIniciais={sessoes.map((s) => ({
          id: s.id,
          userAgent: s.userAgent,
          ip: s.ip,
          criadoEm: s.criadoEm.toISOString(),
          ultimoUso: s.ultimoUso.toISOString(),
          atual: s.id === session!.sessionId,
        }))}
        totpAtivadoInicial={usuario?.totpAtivado ?? false}
        logsAcessoIniciais={logsAcesso.map((l) => ({
          id: l.id,
          sucesso: l.sucesso,
          motivoFalha: l.motivoFalha,
          userAgent: l.userAgent,
          ip: l.ip,
          criadoEm: l.criadoEm.toISOString(),
        }))}
        ultimoConsentimentoIniciais={ultimoConsentimento ? ultimoConsentimento.criadoEm.toISOString() : null}
        adminsIniciais={admins.map((a) => ({
          id: a.id,
          nome: a.nome,
          emailOuLogin: a.emailOuLogin,
          ativo: a.ativo,
          tokenReset: a.tokenReset,
          tokenResetExpira: a.tokenResetExpira ? a.tokenResetExpira.toISOString() : null,
        }))}
        usuarioAtualId={session!.user.id}
        diasAlertaIniciais={diasAlertaPadrao}
      />
    </div>
  );
}
