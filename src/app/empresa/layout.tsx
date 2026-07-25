import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { PainelAdminShell } from "@/components/PainelAdminShell";
import { TEMA_COOKIE, temaValido } from "@/lib/tema";
import { lerPreferencias } from "@/lib/preferencias";

const LINKS = [
  { href: "/empresa", rotulo: "Funcionários" },
  { href: "/empresa/funcionarios/novo", rotulo: "+ Novo funcionário" },
];

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session || session.user.papel !== "EMPRESA") {
    redirect("/login");
  }

  const [cookieStore, usuario] = await Promise.all([
    cookies(),
    prisma.usuario.findUnique({ where: { id: session.user.id }, select: { preferencias: true } }),
  ]);

  // Preferência salva na conta vence o cookie local do navegador — é assim
  // que a escolha de tema acompanha o usuário pra outro dispositivo.
  const preferencias = lerPreferencias(usuario?.preferencias);
  const tema = preferencias.tema ?? temaValido(cookieStore.get(TEMA_COOKIE)?.value);

  return (
    <PainelAdminShell temaInicial={tema}>
      <Sidebar links={LINKS} hrefInicio="/empresa" idPrefix="empresa-sidebar" />
      <main className="flex-1 p-8">
        <Topbar escopo="empresa" nomeUsuario={session.user.email ?? "Empresa"} />
        {children}
      </main>
    </PainelAdminShell>
  );
}
