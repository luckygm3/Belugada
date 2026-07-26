import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FuncionariosTabelaAdmin } from "@/components/FuncionariosTabelaAdmin";

function IconePessoasGrande() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="11" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 27c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 13.5a4 4 0 100-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 19.4c3.4.6 6 3.8 6 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminFuncionariosPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const somentePendentes = status === "pendente";

  const funcionarios = await prisma.funcionario.findMany({
    where: somentePendentes ? { statusDocumentacao: { in: ["PENDENTE", "EM_GERACAO"] } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { empresa: { select: { id: true, razaoSocial: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 text-ink">Funcionários</h1>
          <p className="mt-1 text-body-sm text-ink-muted">
            {somentePendentes ? "Com documentação pendente, de todas as empresas." : "Todos, de todas as empresas."}
          </p>
        </div>
        {somentePendentes && (
          <Link
            href="/admin/funcionarios"
            className="shrink-0 text-body-sm text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Limpar filtro
          </Link>
        )}
      </div>

      {funcionarios.length === 0 ? (
        <EmptyState
          icone={<IconePessoasGrande />}
          titulo={somentePendentes ? "Nenhum funcionário pendente" : "Nenhum funcionário cadastrado ainda"}
          descricao={somentePendentes ? "Toda a documentação está em dia." : undefined}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <FuncionariosTabelaAdmin
            funcionarios={funcionarios.map((f) => ({
              id: f.id,
              nomeCompleto: f.nomeCompleto,
              cargo: f.cargo,
              statusDocumentacao: f.statusDocumentacao,
              empresaId: f.empresa.id,
              empresaNome: f.empresa.razaoSocial,
            }))}
          />
        </Card>
      )}
    </div>
  );
}
