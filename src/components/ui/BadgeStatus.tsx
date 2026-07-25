const MAPA: Record<string, { rotulo: string; classe: string }> = {
  ATIVO: { rotulo: "Ativo", classe: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
  ATRASADO: { rotulo: "Atrasado", classe: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  CANCELADO: { rotulo: "Cancelado", classe: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  PENDENTE: { rotulo: "Pendente", classe: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  EM_GERACAO: { rotulo: "Em geração", classe: "bg-navy-50 text-navy-700 dark:bg-navy-900 dark:text-navy-200" },
  COMPLETO: { rotulo: "Completo", classe: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
  EXPIRADO: { rotulo: "Expirado", classe: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

/** Badge de status (statusPagamento da empresa ou statusDocumentacao do funcionário). */
export function BadgeStatus({ status }: { status: string }) {
  const info = MAPA[status] ?? {
    rotulo: status,
    classe: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex rounded-pa-full px-2.5 py-0.5 text-caption font-medium ${info.classe}`}>
      {info.rotulo}
    </span>
  );
}
