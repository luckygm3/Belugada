const MAPA: Record<string, { rotulo: string; classe: string }> = {
  ATIVO: { rotulo: "Ativo", classe: "bg-green-50 text-green-700" },
  ATRASADO: { rotulo: "Atrasado", classe: "bg-amber-50 text-amber-700" },
  CANCELADO: { rotulo: "Cancelado", classe: "bg-slate-100 text-slate-600" },
  PENDENTE: { rotulo: "Pendente", classe: "bg-amber-50 text-amber-700" },
  COMPLETO: { rotulo: "Completo", classe: "bg-green-50 text-green-700" },
};

/** Badge de status (statusPagamento da empresa ou statusDocumentacao do funcionário). */
export function BadgeStatus({ status }: { status: string }) {
  const info = MAPA[status] ?? { rotulo: status, classe: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex rounded-pa-full px-2.5 py-0.5 text-caption font-medium ${info.classe}`}>
      {info.rotulo}
    </span>
  );
}
