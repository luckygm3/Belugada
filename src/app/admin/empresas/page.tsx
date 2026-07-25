import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmpresasTabela } from "@/components/EmpresasTabela";

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

function IconeAlerta() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M10 2.5l8.5 14.7a1 1 0 01-.87 1.5H2.37a1 1 0 01-.87-1.5L10 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconePredioGrande() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M6 27V6a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v21M6 27h11M6 27H4M26 27H17M14 10h3M14 14h3M14 18h3M14 22h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 27v-7a1.5 1.5 0 011.5-1.5h5a1.5 1.5 0 011.5 1.5v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default async function EmpresasListPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { funcionarios: true } } },
  });

  const totalEmpresas = empresas.length;
  const totalFuncionarios = empresas.reduce((soma, e) => soma + e._count.funcionarios, 0);
  const empresasAtrasadas = empresas.filter((e) => e.statusPagamento === "ATRASADO").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-ink">Empresas</h1>
        <Link href="/admin/empresas/nova">
          <Button variant="primary" className="text-body-sm">
            + Nova empresa
          </Button>
        </Link>
      </div>

      {totalEmpresas > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard rotulo="Empresas cadastradas" valor={totalEmpresas} icone={<IconePredio />} tom="navy" />
          <StatCard rotulo="Funcionários no total" valor={totalFuncionarios} icone={<IconePessoas />} tom="teal" />
          <StatCard rotulo="Pagamentos atrasados" valor={empresasAtrasadas} icone={<IconeAlerta />} tom={empresasAtrasadas > 0 ? "warning" : "navy"} />
        </div>
      )}

      {totalEmpresas === 0 ? (
        <EmptyState
          icone={<IconePredioGrande />}
          titulo="Nenhuma empresa cadastrada ainda"
          descricao="Cadastre a primeira empresa-cliente pra começar a vincular templates e liberar o acesso dela ao painel."
          acao={{ rotulo: "+ Nova empresa", href: "/admin/empresas/nova" }}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <EmpresasTabela
            empresas={empresas.map((empresa) => ({
              id: empresa.id,
              razaoSocial: empresa.razaoSocial,
              cnpj: empresa.cnpj,
              planoContratado: empresa.planoContratado,
              statusPagamento: empresa.statusPagamento,
              funcionariosCount: empresa._count.funcionarios,
            }))}
          />
        </Card>
      )}
    </div>
  );
}
