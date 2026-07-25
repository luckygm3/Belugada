"use client";

import Link from "next/link";
import { PactaLogo } from "../PactaLogo";
import { EVENTO_ABRIR_PREFERENCIAS_COOKIES } from "../BannerCookies";

export function FooterPacta() {
  return (
    <footer className="bg-[var(--pt-petrol-950)] text-[var(--pt-claro-suave)] py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
        <div>
          <PactaLogo
            variante="horizontal"
            idPrefix="footer"
            className="h-10 w-auto text-[var(--pt-claro)]"
          />
          <p className="mt-4 text-sm italic">
            Pacta sunt servanda — os acordos devem ser cumpridos.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 text-sm">
          <p>© {new Date().getFullYear()} PACTA. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/politica-de-cookies" className="underline hover:text-[var(--pt-claro)]">
              Política de cookies
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR_PREFERENCIAS_COOKIES))}
              className="underline hover:text-[var(--pt-claro)]"
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
