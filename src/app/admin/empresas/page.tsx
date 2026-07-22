import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmpresasTabela } from "@/components/EmpresasTabela";

export default async function EmpresasListPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { funcionarios: true } } },
  });

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
    </div>
  );
}
