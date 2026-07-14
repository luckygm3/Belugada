import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.papel !== "EMPRESA") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 dark:bg-black text-white flex flex-col p-4 shrink-0">
        <div className="font-bold text-lg mb-8">Painel da Empresa</div>
        <nav className="flex flex-col gap-2 text-sm flex-1">
          <Link href="/empresa" className="hover:bg-gray-800 rounded px-3 py-2">Funcionários</Link>
          <Link href="/empresa/funcionarios/novo" className="hover:bg-gray-800 rounded px-3 py-2">+ Novo funcionário</Link>
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-8">{children}</main>
    </div>
  );
}