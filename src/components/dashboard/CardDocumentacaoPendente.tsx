import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

function IconeChecklist() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9A.5.5 0 015 17V2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2.5V5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 11l1.3 1.3L11.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CardDocumentacaoPendente({
  totalFuncionarios,
  empresasAfetadas,
}: {
  totalFuncionarios: number;
  empresasAfetadas: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentação pendente</CardTitle>
        <CardDescription>Funcionários sem documentação completa ou ainda em geração.</CardDescription>
      </CardHeader>
      <CardContent>
        {totalFuncionarios === 0 ? (
          <EmptyState
            icone={<IconeChecklist />}
            titulo="Tudo completo"
            descricao="Nenhum funcionário com documentação pendente no momento."
          />
        ) : (
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pa-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <IconeChecklist />
            </span>
            <div>
              <p className="text-h2 text-ink">{totalFuncionarios}</p>
              <p className="text-body-sm text-ink-muted">
                funcionário{totalFuncionarios === 1 ? "" : "s"} pendente{totalFuncionarios === 1 ? "" : "s"}, em{" "}
                {empresasAfetadas} empresa{empresasAfetadas === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {totalFuncionarios > 0 && (
        <CardFooter>
          <Link
            href="/admin/funcionarios?status=pendente"
            className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
          >
            Ver funcionários →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
