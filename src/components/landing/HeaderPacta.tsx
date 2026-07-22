"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PactaLogo } from "../PactaLogo";

gsap.registerPlugin(useGSAP);

const LINKS = [
  { href: "#risco", rotulo: "O risco" },
  { href: "#solucao", rotulo: "Como funciona" },
  { href: "#planos", rotulo: "Planos" },
  { href: "#faq", rotulo: "FAQ" },
];

export function HeaderPacta() {
  const escopo = useRef<HTMLElement>(null);
  const [aberto, setAberto] = useState(false);
  const [rolado, setRolado] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolado(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      // Ver HeroPacta: reveals só depois do primeiro frame de rAF
      requestAnimationFrame(
        contextSafe!(() => {
          const mm = gsap.matchMedia();
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from("[data-header-item]", {
              y: -18,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: "power3.out",
              delay: 0.2,
            });
          });
        })
      );
    },
    { scope: escopo }
  );

  return (
    <header
      ref={escopo}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        rolado
          ? "bg-[var(--pt-petrol-950)]/95 backdrop-blur-sm border-b border-[var(--pt-linha-escura)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16 sm:h-18">
        <Link
          href="/"
          data-header-item
          className="flex items-center text-[var(--pt-claro)]"
          aria-label="PACTA — início"
        >
          <PactaLogo variante="horizontal" idPrefix="header" className="h-8 sm:h-9 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-header-item
              className="text-sm text-[var(--pt-claro-suave)] hover:text-[var(--pt-claro)] transition-colors"
            >
              {l.rotulo}
            </a>
          ))}
          <Link
            href="/login"
            data-header-item
            className="text-sm text-[var(--pt-claro)] border border-[var(--pt-linha-escura)] hover:border-[var(--pt-claro-suave)] rounded-md px-4 py-2 transition-colors"
          >
            Entrar
          </Link>
        </nav>

        <button
          className="md:hidden text-[var(--pt-claro)] p-2 -mr-2"
          onClick={() => setAberto(!aberto)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {aberto ? (
              <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {aberto && (
        <nav
          className="md:hidden flex flex-col gap-1 px-4 pb-4 bg-[var(--pt-petrol-950)] border-b border-[var(--pt-linha-escura)]"
          aria-label="Navegação principal"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className="text-[var(--pt-claro)] py-3 border-b border-[var(--pt-linha-escura)] last:border-0"
            >
              {l.rotulo}
            </a>
          ))}
          <Link
            href="/login"
            className="text-center text-[var(--pt-petrol-950)] bg-[var(--pt-dourado)] rounded-md px-4 py-3 mt-2 font-medium"
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}
