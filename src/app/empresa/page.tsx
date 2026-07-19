import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExcluirFuncionarioButton from "@/components/ExcluirFuncionarioButton";
import { BotaoWhatsapp } from "@/components/BotaoWhatsapp";

export default async function EmpresaDashboard() {
  const session = await auth();

  const funcionarios = await prisma.funcionario.findMany({
    where: { empresaId: session!.user.empresaId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Funcionários</h1>
        <Link href="/empresa/funcionarios/novo" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          + Cadastrar funcionário
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-300">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Cargo</th>
              <th className="p-3">Status documentação</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f) => (
              <tr key={f.id} className="border-t dark:border-gray-700 dark:text-gray-200">
                <td className="p-3">{f.nomeCompleto}</td>
                <td className="p-3">{f.cargo || "-"}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                    {f.statusDocumentacao}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/empresa/funcionarios/${f.id}`} className="text-blue-600 hover:underline">
                      Ver
                    </Link>
                    <Link href={`/empresa/funcionarios/${f.id}/editar`} className="text-blue-600 hover:underline">
                      Editar
                    </Link>
                    <ExcluirFuncionarioButton funcionarioId={f.id} nomeFuncionario={f.nomeCompleto} />
                  </div>
                </td>
              </tr>
            ))}
            {funcionarios.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  Nenhum funcionário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Precisa de um novo documento? Entre em contato com a nossa consultoria.
        </p>
        <BotaoWhatsapp
          variante="inline"
          mensagem="Olá! Preciso de um novo documento para um funcionário. Podem me ajudar?"
        />
      </div>
    </div>
  );
}