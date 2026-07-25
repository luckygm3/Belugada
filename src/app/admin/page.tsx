import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";

function IconePredio() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 17V4a1 1 0 011-1h6a1 1 0 011 1v13M4 17h12M4 17H2.5M16 17H17.5M9 6h2M9 9h2M9 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17v-4a1 1 0 011-1h3a1 1 0 011 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

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

function IconeDocumento() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M5 2.5h7l3 3V17a.5.5 0 01-.5.5h-9A.5.5 0 015 17V2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2.5V5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.5 10.5h5M7.5 13h5M7.5 8h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default async function AdminDashboard() {
  const [totalEmpresas, totalFuncionarios, totalDocsGerados] = await Promise.all([
    prisma.empresa.count(),
    prisma.funcionario.count(),
    prisma.documentoGerado.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-ink">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard rotulo="Empresas ativas" valor={totalEmpresas} icone={<IconePredio />} tom="navy" />
        <StatCard rotulo="Funcionários cadastrados" valor={totalFuncionarios} icone={<IconePessoas />} tom="teal" />
        <StatCard rotulo="Documentos gerados" valor={totalDocsGerados} icone={<IconeDocumento />} tom="navy" />
      </div>
    </div>
  );
}
