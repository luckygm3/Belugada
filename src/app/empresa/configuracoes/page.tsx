import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConfiguracoesView } from "@/components/configuracoes/ConfiguracoesView";

export default async function ConfiguracoesEmpresaPage() {
  const session = await auth();

  const [usuario, sessoes, empresa, logsAcesso, ultimoConsentimento] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: session!.user.id },
      select: { nome: true, emailOuLogin: true, avatarUrl: true, preferencias: true, totpAtivado: true },
    }),
    prisma.sessaoAtiva.findMany({
      where: { usuarioId: session!.user.id, revogadaEm: null },
      orderBy: { criadoEm: "desc" },
      select: { id: true, userAgent: true, ip: true, criadoEm: true, ultimoUso: true },
    }),
    prisma.empresa.findUnique({
      where: { id: session!.user.empresaId! },
      select: {
        razaoSocial: true,
        cnpj: true,
        planoContratado: true,
        statusPagamento: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        uf: true,
        cep: true,
        telefone: true,
        responsavelNome: true,
        responsavelCargo: true,
        responsavelTelefone: true,
        responsavelEmail: true,
      },
    }),
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
        papel="EMPRESA"
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
        empresaInicial={{
          razaoSocial: empresa?.razaoSocial ?? "",
          cnpj: empresa?.cnpj ?? "",
          planoContratado: empresa?.planoContratado ?? "",
          statusPagamento: empresa?.statusPagamento ?? "ATIVO",
          logradouro: empresa?.logradouro ?? "",
          numero: empresa?.numero ?? "",
          complemento: empresa?.complemento ?? "",
          bairro: empresa?.bairro ?? "",
          cidade: empresa?.cidade ?? "",
          uf: empresa?.uf ?? "",
          cep: empresa?.cep ?? "",
          telefone: empresa?.telefone ?? "",
          responsavelNome: empresa?.responsavelNome ?? "",
          responsavelCargo: empresa?.responsavelCargo ?? "",
          responsavelTelefone: empresa?.responsavelTelefone ?? "",
          responsavelEmail: empresa?.responsavelEmail ?? "",
        }}
      />
    </div>
  );
}
