"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NUMERO_WHATSAPP } from "../BotaoWhatsapp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function linkWhatsapp(plano: string) {
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
    `Olá! Tenho interesse no plano ${plano} da PACTA.`
  )}`;
}

export function SecaoPlanos() {
  const escopo = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      // Ver HeroPacta: reveals só depois do primeiro frame de rAF
      requestAnimationFrame(
        contextSafe!(() => {
          const mm = gsap.matchMedia();
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.utils.toArray<HTMLElement>("[data-plano]").forEach((el, i) => {
              gsap.from(el, {
                y: 40,
                autoAlpha: 0,
                duration: 0.8,
                delay: i * 0.15,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              });
            });
          });
        })
      );
    },
    { scope: escopo }
  );

  return (
    <section id="planos" ref={escopo} className="bg-[var(--pt-paper)] py-20 sm:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="fonte-display text-3xl sm:text-4xl text-[var(--pt-ink)] text-balance">
            Investimento previsível. Risco não.
          </h2>
          <p className="mt-4 text-[var(--pt-ink-suave)] max-w-[65ch]">
            Consultoria e plataforma no mesmo plano. Sem taxa de implantação, sem limite de
            documentos gerados.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 gap-8 max-w-3xl">
          {/* TODO: substituir os valores R$ XX pelos preços reais antes de publicar */}
          <div data-plano className="border border-[var(--pt-linha-clara)] bg-white rounded-lg p-8">
            <h3 className="font-semibold text-lg text-[var(--pt-ink)]">Mensal</h3>
            <p className="mt-4">
              <span className="fonte-display text-4xl text-[var(--pt-ink)]">R$ XX</span>
              <span className="text-[var(--pt-ink-suave)]"> /mês por empresa</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-[var(--pt-ink-suave)]">
              <li>Consultoria inicial incluída</li>
              <li>Funcionários ilimitados</li>
              <li>Todos os documentos da sua operação</li>
              <li>Suporte direto com a especialista</li>
            </ul>
            <a
              href={linkWhatsapp("Mensal")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block text-center border border-[var(--pt-petrol-800)] text-[var(--pt-petrol-800)] hover:bg-[var(--pt-petrol-800)] hover:text-white font-medium rounded-md px-6 py-3 transition-colors"
            >
              Começar no mensal
            </a>
          </div>

          <div
            data-plano
            className="border-2 border-[var(--pt-dourado)] bg-[var(--pt-petrol-950)] text-[var(--pt-claro)] rounded-lg p-8 relative"
          >
            <p className="absolute -top-3.5 left-8 bg-[var(--pt-dourado)] text-[var(--pt-petrol-950)] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full">
              Recomendado
            </p>
            <h3 className="font-semibold text-lg">Anual</h3>
            <p className="mt-4">
              <span className="fonte-display text-4xl">R$ XX</span>
              <span className="text-[var(--pt-claro-suave)]"> /mês, cobrado anualmente</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-[var(--pt-claro-suave)]">
              <li>Tudo do plano mensal</li>
              <li>Desconto no compromisso anual</li>
              <li>Revisão anual da documentação</li>
              <li>Prioridade no atendimento</li>
            </ul>
            <a
              href={linkWhatsapp("Anual")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block text-center bg-[var(--pt-dourado)] hover:bg-[var(--pt-dourado-forte)] text-[var(--pt-petrol-950)] font-semibold rounded-md px-6 py-3 transition-colors"
            >
              Garantir o anual
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
