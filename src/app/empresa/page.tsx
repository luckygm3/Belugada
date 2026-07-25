import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FuncionariosTabela } from "@/components/FuncionariosTabela";
import { BotaoWhatsapp } from "@/components/BotaoWhatsapp";

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

function IconeRelogio() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4.2l3 1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.8 10.2l2.2 2.2 4.2-4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

export default async function EmpresaDashboard() {
  const session = await auth();

  const funcionarios = await prisma.funcionario.findMany({
    where: { empresaId: session!.user.empresaId! },
    orderBy: { createdAt: "desc" },
  });

  const total = funcionarios.length;
  const pendentes = funcionarios.filter((f) => f.statusDocumentacao === "PENDENTE" || f.statusDocumentacao === "EM_GERACAO").length;
  const completos = funcionarios.filter((f) => f.statusDocumentacao === "COMPLETO").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-ink">Funcionários</h1>
        <Link href="/empresa/funcionarios/novo">
          <Button variant="primary" className="text-body-sm">
            + Cadastrar funcionário
          </Button>
        </Link>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard rotulo="Funcionários cadastrados" valor={total} icone={<IconePessoas />} tom="navy" />
          <StatCard rotulo="Documentação pendente" valor={pendentes} icone={<IconeRelogio />} tom={pendentes > 0 ? "warning" : "navy"} />
          <StatCard rotulo="Documentação completa" valor={completos} icone={<IconeCheck />} tom="teal" />
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          icone={<IconePessoasGrande />}
          titulo="Nenhum funcionário cadastrado ainda"
          descricao="Cadastre o primeiro funcionário pra gerar os documentos trabalhistas dele automaticamente."
          acao={{ rotulo: "+ Cadastrar funcionário", href: "/empresa/funcionarios/novo" }}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <FuncionariosTabela
            funcionarios={funcionarios.map((f) => ({
              id: f.id,
              nomeCompleto: f.nomeCompleto,
              cargo: f.cargo,
              statusDocumentacao: f.statusDocumentacao,
            }))}
          />
        </Card>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-body-sm text-ink-muted">
          Precisa de um novo documento? Entre em contato com a nossa consultoria.
        </p>
        <BotaoWhatsapp
          variante="inline"
          mensagem="Olá! Preciso de um novo documento para um funcionário. Podem me ajudar?"
        />
      </Card>
    </div>
  );
}
