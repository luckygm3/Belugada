import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { BadgeStatus } from "@/components/ui/BadgeStatus";

export interface FuncionarioRecenteItem {
  id: string;
  nomeCompleto: string;
  empresaId: string;
  empresaNome: string;
  statusDocumentacao: string;
}

function IniciaisFuncionario({ nome }: { nome: string }) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pa-full bg-teal-50 text-body-sm font-medium text-teal-700 dark:bg-teal-900 dark:text-teal-200">
      {inicial}
    </span>
  );
}

export function CardFuncionariosRecentes({ itens }: { itens: FuncionarioRecenteItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funcionários recém-cadastrados</CardTitle>
        <CardDescription>Os últimos cadastros, de qualquer empresa.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {itens.map((f) => (
            <Link
              key={f.id}
              href={`/admin/empresas/${f.empresaId}/funcionarios/${f.id}`}
              className="flex items-center gap-3 px-6 py-3 text-body-sm transition-colors hover:bg-surface-alt"
            >
              <IniciaisFuncionario nome={f.nomeCompleto} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{f.nomeCompleto}</p>
                <p className="truncate text-caption text-ink-muted">{f.empresaNome}</p>
              </div>
              <BadgeStatus status={f.statusDocumentacao} />
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href="/admin/funcionarios"
          className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
        >
          Ver todos →
        </Link>
      </CardFooter>
    </Card>
  );
}
