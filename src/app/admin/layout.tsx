import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.papel !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 shrink-0">
        <div className="font-bold text-lg mb-8">SuaMarca Admin</div>
        <nav className="flex flex-col gap-2 text-sm">
            <div className="mt-auto pt-4">
            <ThemeToggle />
            </div>
          <Link href="/admin" className="hover:bg-gray-800 rounded px-3 py-2">Dashboard</Link>
          <Link href="/admin/empresas" className="hover:bg-gray-800 rounded px-3 py-2">Empresas</Link>
          <Link href="/admin/empresas/nova" className="hover:bg-gray-800 rounded px-3 py-2">+ Nova empresa</Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}