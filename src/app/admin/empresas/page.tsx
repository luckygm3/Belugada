import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EmpresasListPage() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { funcionarios: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Link href="/admin/empresas/nova" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          + Nova empresa
        </Link>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Razão social</th>
              <th className="p-3">CNPJ</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Status</th>
              <th className="p-3">Funcionários</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="border-t">
                <td className="p-3">{empresa.razaoSocial}</td>
                <td className="p-3">{empresa.cnpj}</td>
                <td className="p-3">{empresa.planoContratado || "-"}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    {empresa.statusPagamento}
                  </span>
                </td>
                <td className="p-3">{empresa._count.funcionarios}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/empresas/${empresa.id}`} className="text-blue-600 hover:underline">
                    Ver detalhes
                  </Link>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Nenhuma empresa cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}