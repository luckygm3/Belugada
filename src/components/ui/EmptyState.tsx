import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateAcao {
  rotulo: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icone: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: EmptyStateAcao;
}

/**
 * Estado vazio de página — substitui uma tabela/lista sem dados. Decidido no
 * nível da página (não dentro do componente de tabela), pra preencher o
 * espaço de verdade em vez de deixar uma única linha "nenhum item" solta
 * numa tabela estreita.
 */
export function EmptyState({ icone, titulo, descricao, acao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-pa-lg border border-dashed border-border bg-surface-alt px-8 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-pa-full bg-navy-50 text-navy-600 dark:bg-navy-900 dark:text-navy-200">
        {icone}
      </span>
      <p className="text-h4 text-ink">{titulo}</p>
      {descricao && <p className="max-w-sm text-body-sm text-ink-muted">{descricao}</p>}
      {acao &&
        (acao.href ? (
          <Link href={acao.href} className="mt-2">
            <Button variant="primary" className="text-body-sm">
              {acao.rotulo}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" className="mt-2 text-body-sm" onClick={acao.onClick}>
            {acao.rotulo}
          </Button>
        ))}
    </div>
  );
}
