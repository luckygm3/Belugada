import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { GraficoBarras, type PontoGraficoBarras } from "@/components/ui/GraficoBarras";
import { CardVencimentosProximos, type VencimentoProximoItem } from "@/components/dashboard/CardVencimentosProximos";
import { CardDocumentacaoPendente } from "@/components/dashboard/CardDocumentacaoPendente";
import { CardEmpresasResumo, type EmpresaResumoItem } from "@/components/dashboard/CardEmpresasResumo";
import { CardFuncionariosRecentes, type FuncionarioRecenteItem } from "@/components/dashboard/CardFuncionariosRecentes";
import { CardAtividadeRecente, type AtividadeRecenteItem } from "@/components/dashboard/CardAtividadeRecente";

const JANELA_VENCIMENTO_DIAS = 30;
const MESES_GRAFICO = 6;
const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function IconePredio() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 17V4a1 1 0 011-1h6a1 1 0 011 1v13M4 17h12M4 17H2.5M16 17H17.5M9 6h2M9 9h2M9 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17v-4a1 1 0 011-1h3a1 1 0 011 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconePessoas() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="7" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 17c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 8.5a2.5 2.5 0 100-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.5 12.1c2.24.3 4 2.32 4 4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconeDocumento() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9A.5.5 0 015 17V2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2.5V5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 10.5h5M7.5 13h5M7.5 8h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// Estilo de hover comum aos 3 StatCards — sinaliza "isso é clicável" sem sombra em repouso (plano por padrão).
const CLASSE_STAT_CLICAVEL = "transition-shadow hover:shadow-pa-md hover:border-slate-300 dark:hover:border-slate-600";

function calcularDiasRestantes(dataVencimento: Date, hoje: Date): number {
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  return Math.round((vencimento.getTime() - hoje.getTime()) / 86_400_000);
}

export default async function AdminDashboard() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const limiteVencimento = new Date(hoje);
  limiteVencimento.setDate(limiteVencimento.getDate() + JANELA_VENCIMENTO_DIAS);

  const inicioGrafico = new Date(hoje);
  inicioGrafico.setMonth(inicioGrafico.getMonth() - (MESES_GRAFICO - 1));
  inicioGrafico.setDate(1);
  inicioGrafico.setHours(0, 0, 0, 0);

  const [
    totalEmpresasAtivas,
    totalFuncionarios,
    totalDocsGerados,
    vencimentosProximosBrutos,
    totalVencimentosProximos,
    pendenciaPorEmpresa,
    funcionariosRecentesBrutos,
    atividadesRecentesBrutas,
    documentosParaGrafico,
  ] = await Promise.all([
    prisma.empresa.count({ where: { statusPagamento: "ATIVO" } }),
    prisma.funcionario.count(),
    prisma.documentoGerado.count(),
    prisma.documentoGerado.findMany({
      where: { dataVencimento: { gte: hoje, lte: limiteVencimento } },
      orderBy: { dataVencimento: "asc" },
      take: 5,
      include: {
        template: { select: { nome: true } },
        funcionario: { select: { nomeCompleto: true, empresa: { select: { razaoSocial: true } } } },
      },
    }),
    prisma.documentoGerado.count({ where: { dataVencimento: { gte: hoje, lte: limiteVencimento } } }),
    prisma.funcionario.groupBy({
      by: ["empresaId"],
      where: { statusDocumentacao: { in: ["PENDENTE", "EM_GERACAO"] } },
      _count: true,
    }),
    prisma.funcionario.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { empresa: { select: { id: true, razaoSocial: true } } },
    }),
    prisma.notificacao.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { empresa: { select: { razaoSocial: true } } },
    }),
    prisma.documentoGerado.findMany({
      where: { dataGeracao: { gte: inicioGrafico } },
      select: { dataGeracao: true },
    }),
  ]);

  // --- Bloco 2: vencimentos próximos ---
  const vencimentosProximos: VencimentoProximoItem[] = vencimentosProximosBrutos.map((d) => ({
    id: d.id,
    documentoNome: d.template.nome,
    empresaNome: d.funcionario.empresa.razaoSocial,
    diasRestantes: calcularDiasRestantes(d.dataVencimento!, hoje),
  }));

  // --- Bloco 3: documentação pendente ---
  const totalPendentes = pendenciaPorEmpresa.reduce((soma, g) => soma + g._count, 0);
  const empresasAfetadas = pendenciaPorEmpresa.length;
  const mapaPendencia = new Map(pendenciaPorEmpresa.map((g) => [g.empresaId, g._count]));

  // --- Bloco 4: empresas em destaque — com pendência (mais afetadas primeiro); sem nenhuma pendência, as mais recentes ---
  const idsComPendencia = [...pendenciaPorEmpresa]
    .sort((a, b) => b._count - a._count)
    .slice(0, 5)
    .map((g) => g.empresaId);

  let empresasBrutas;
  if (idsComPendencia.length > 0) {
    const empresas = await prisma.empresa.findMany({
      where: { id: { in: idsComPendencia } },
      include: { _count: { select: { funcionarios: true } } },
    });
    const porId = new Map(empresas.map((e) => [e.id, e]));
    empresasBrutas = idsComPendencia.map((id) => porId.get(id)!).filter(Boolean);
  } else {
    empresasBrutas = await prisma.empresa.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { funcionarios: true } } },
    });
  }

  const empresasDestaque: EmpresaResumoItem[] = empresasBrutas.map((e) => ({
    id: e.id,
    razaoSocial: e.razaoSocial,
    planoContratado: e.planoContratado,
    statusPagamento: e.statusPagamento,
    funcionariosCount: e._count.funcionarios,
    pendentesCount: mapaPendencia.get(e.id) ?? 0,
  }));

  // --- Bloco 5: funcionários recém-cadastrados ---
  const funcionariosRecentes: FuncionarioRecenteItem[] = funcionariosRecentesBrutos.map((f) => ({
    id: f.id,
    nomeCompleto: f.nomeCompleto,
    empresaId: f.empresa.id,
    empresaNome: f.empresa.razaoSocial,
    statusDocumentacao: f.statusDocumentacao,
  }));

  // --- Bloco 6: atividade recente ---
  const atividadesRecentes: AtividadeRecenteItem[] = atividadesRecentesBrutas.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    descricao: a.descricao,
    createdAt: a.createdAt.toISOString(),
    empresaNome: a.empresa?.razaoSocial ?? null,
  }));

  // --- Bloco 7: documentos gerados por mês — agregação em memória (janela pequena, ver nota de handoff) ---
  const buckets = new Map<string, number>();
  for (let i = 0; i < MESES_GRAFICO; i++) {
    const d = new Date(inicioGrafico);
    d.setMonth(d.getMonth() + i);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
  }
  for (const doc of documentosParaGrafico) {
    const chave = `${doc.dataGeracao.getFullYear()}-${doc.dataGeracao.getMonth()}`;
    if (buckets.has(chave)) buckets.set(chave, (buckets.get(chave) ?? 0) + 1);
  }
  const dadosGrafico: PontoGraficoBarras[] = Array.from(buckets.keys()).map((chave) => {
    const mes = Number(chave.split("-")[1]);
    return { rotulo: NOMES_MES[mes], valor: buckets.get(chave) ?? 0 };
  });

  return (
    <div className="space-y-8">
      {/* Bloco 8: título + atalhos rápidos, juntos no topo — é a primeira coisa que se vê ao entrar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1 text-ink">Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/empresas/nova">
            <Button variant="primary" className="text-body-sm">
              + Nova empresa
            </Button>
          </Link>
          <Link href="/admin/templates-padrao">
            <Button variant="secondary" className="text-body-sm">
              + Novo documento padrão
            </Button>
          </Link>
        </div>
      </div>

      {/* Bloco 1: cards clicáveis */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/admin/empresas">
          <StatCard rotulo="Empresas ativas" valor={totalEmpresasAtivas} icone={<IconePredio />} tom="navy" className={CLASSE_STAT_CLICAVEL} />
        </Link>
        <Link href="/admin/funcionarios">
          <StatCard rotulo="Funcionários cadastrados" valor={totalFuncionarios} icone={<IconePessoas />} tom="teal" className={CLASSE_STAT_CLICAVEL} />
        </Link>
        <Link href="/admin/documentos">
          <StatCard rotulo="Documentos gerados" valor={totalDocsGerados} icone={<IconeDocumento />} tom="navy" className={CLASSE_STAT_CLICAVEL} />
        </Link>
      </div>

      {/* Blocos 2 e 3: o que precisa de atenção agora */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardVencimentosProximos janelaDias={JANELA_VENCIMENTO_DIAS} total={totalVencimentosProximos} itens={vencimentosProximos} />
        <CardDocumentacaoPendente totalFuncionarios={totalPendentes} empresasAfetadas={empresasAfetadas} />
      </div>

      {/* Bloco 7: tendência de geração de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos gerados por mês</CardTitle>
          <CardDescription>Últimos {MESES_GRAFICO} meses.</CardDescription>
        </CardHeader>
        <CardContent>
          <GraficoBarras dados={dadosGrafico} />
        </CardContent>
      </Card>

      {/* Blocos 4 e 5: listas resumidas de navegação */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardEmpresasResumo itens={empresasDestaque} destacaPendencias={idsComPendencia.length > 0} />
        <CardFuncionariosRecentes itens={funcionariosRecentes} />
      </div>

      {/* Bloco 6: atividade recente */}
      <CardAtividadeRecente itens={atividadesRecentes} />
    </div>
  );
}
