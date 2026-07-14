import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboard() {
  const [totalEmpresas, totalFuncionarios, totalDocsGerados] = await Promise.all([
    prisma.empresa.count(),
    prisma.funcionario.count(),
    prisma.documentoGerado.count(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Empresas ativas</p>
          <p className="text-3xl font-bold dark:text-white">{totalEmpresas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Funcionários cadastrados</p>
          <p className="text-3xl font-bold dark:text-white">{totalFuncionarios}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Documentos gerados</p>
          <p className="text-3xl font-bold dark:text-white">{totalDocsGerados}</p>
        </div>
      </div>
    </div>
  );
}