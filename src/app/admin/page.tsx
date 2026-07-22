import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const [totalEmpresas, totalFuncionarios, totalDocsGerados] = await Promise.all([
    prisma.empresa.count(),
    prisma.funcionario.count(),
    prisma.documentoGerado.count(),
  ]);

  const stats = [
    { rotulo: "Empresas ativas", valor: totalEmpresas },
    { rotulo: "Funcionários cadastrados", valor: totalFuncionarios },
    { rotulo: "Documentos gerados", valor: totalDocsGerados },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.rotulo} className="p-6">
            <p className="text-body-sm text-ink-muted">{s.rotulo}</p>
            <p className="mt-1 text-h1 text-ink">{s.valor}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
