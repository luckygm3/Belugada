"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PactaLogo } from "./PactaLogo";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin/empresas", rotulo: "Empresas" },
  { href: "/admin/templates-padrao", rotulo: "Biblioteca de documentos" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar flex w-56 shrink-0 flex-col p-4">
      <Link href="/admin" className="mb-8 block text-white" aria-label="PACTA — início do admin">
        <PactaLogo variante="horizontal" idPrefix="admin-sidebar" className="h-7 w-auto" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 text-body-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={pathname === l.href ? "page" : undefined}
            className="rounded-pa-md px-3 py-2"
          >
            {l.rotulo}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <LogoutButton className="text-body-sm text-white/70 transition-colors hover:text-white" />
      </div>
    </aside>
  );
}
