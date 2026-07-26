import Link from "next/link";

function IconePredio() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M4 17V4a1 1 0 011-1h6a1 1 0 011 1v13M4 17h12M4 17H2.5M16 17H17.5M9 6h2M9 9h2M9 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17v-4a1 1 0 011-1h3a1 1 0 011 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Indicador de contexto — aparece nas telas onde o admin cadastra/edita
 * funcionário ou gera documentos EM NOME de uma empresa (ver "Admin operando
 * como empresa"). Não é uma sessão trocada: é só a página deixando claro em
 * qual empresa a próxima ação vai gravar dados, pra evitar o admin confundir
 * qual cliente está editando.
 */
export function OperandoComoEmpresa({ empresaId, empresaNome }: { empresaId: string; empresaNome: string }) {
  return (
    <div className="flex items-center gap-2 rounded-pa-md border border-navy-200 bg-navy-50 px-4 py-2.5 text-body-sm text-navy-800 dark:border-navy-800 dark:bg-navy-950 dark:text-navy-200">
      <IconePredio />
      <span className="min-w-0 truncate">
        Operando como: <strong className="font-medium">{empresaNome}</strong>
      </span>
      <Link
        href={`/admin/empresas/${empresaId}`}
        className="ml-auto shrink-0 font-medium underline-offset-2 hover:underline"
      >
        Voltar pra empresa
      </Link>
    </div>
  );
}
