"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PactaLogo } from "./PactaLogo";
import LogoutButton from "./LogoutButton";

export interface SidebarLink {
  href: string;
  rotulo: string;
}

/**
 * Barra lateral do `.painel-admin` — compartilhada por admin e empresa.
 * A única diferença entre os dois painéis é a lista de links; o visual
 * (logo, item ativo, logout) é sempre o mesmo, de propósito.
 */
export function Sidebar({
  links,
  hrefInicio,
  idPrefix,
}: {
  links: SidebarLink[];
  hrefInicio: string;
  idPrefix: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sidebar flex w-56 shrink-0 flex-col p-4">
      <Link href={hrefInicio} className="mb-8 block text-white" aria-label="PACTA — início">
        <PactaLogo variante="horizontal" idPrefix={idPrefix} className="h-7 w-auto" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 text-body-sm">
        {links.map((l) => (
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
