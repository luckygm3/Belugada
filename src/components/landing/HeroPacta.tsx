"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { PactaLogo } from "../PactaLogo";
import { NUMERO_WHATSAPP } from "../BotaoWhatsapp";

gsap.registerPlugin(useGSAP, DrawSVGPlugin);

const LINK_WHATSAPP = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
  "Olá! Quero proteger minha empresa com a PACTA."
)}`;

export function HeroPacta() {
  const escopo = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      // Só escondemos conteúdo para revelar depois que o primeiro frame de rAF
      // dispara: em renderers sem rAF (aba oculta, prerender, bot) a página
      // permanece estática e totalmente visível.
      requestAnimationFrame(
        contextSafe!(() => {
          const mm = gsap.matchMedia();

          mm.add("(prefers-reduced-motion: no-preference)", () => {
            const emblema = "#hero-logo-emblema path";

            // O emblema é composto de formas preenchidas: desenhamos o contorno
            // com stroke (DrawSVG) e depois revelamos o preenchimento.
            gsap.set(emblema, {
              fillOpacity: 0,
              stroke: "currentColor",
              strokeWidth: 90,
              strokeOpacity: 0.9,
            });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from(emblema, {
              drawSVG: "0%",
              duration: 2,
              stagger: 0.18,
              ease: "power2.inOut",
            })
              .to(
                emblema,
                { fillOpacity: 1, strokeOpacity: 0, duration: 0.9, ease: "power2.out" },
                "-=0.7"
              )
              .from(
                "#hero-logo-pacta path",
                { y: 700, autoAlpha: 0, stagger: 0.07, duration: 0.8 },
                "-=1.4"
              )
              .from(
                "#hero-logo-sunt path",
                { autoAlpha: 0, stagger: { each: 0.045, from: "center" }, duration: 0.5 },
                "-=0.5"
              )
              .from("#hero-logo-tagline", { autoAlpha: 0, duration: 0.6 }, "-=0.25")
              .from(
                "[data-hero-fade]",
                { y: 26, autoAlpha: 0, stagger: 0.12, duration: 0.7 },
                "-=0.3"
              );
          });
        })
      );
    },
    { scope: escopo }
  );

  return (
    <section
      ref={escopo}
      className="relative bg-[var(--pt-petrol-950)] text-[var(--pt-claro)] overflow-hidden"
    >
      {/* Textura discreta de linhas verticais, remetendo a colunas/documentos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 96px)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <PactaLogo
          variante="completo"
          idPrefix="hero"
          className="w-full max-w-[680px] h-auto text-[var(--pt-claro)]"
        />

        <div className="mt-12 sm:mt-16 max-w-2xl">
          <h1
            data-hero-fade
            className="fonte-display text-3xl sm:text-5xl leading-tight text-balance"
          >
            Uma ação trabalhista pode custar anos da sua empresa.
          </h1>
          <p data-hero-fade className="mt-5 text-lg text-[var(--pt-claro-suave)] max-w-[65ch]">
            A PACTA une consultoria especializada em direito trabalhista a uma plataforma que
            gera e organiza a documentação de cada funcionário — para a sua empresa nunca ser
            pega desprevenida.
          </p>
          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={LINK_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--pt-dourado)] hover:bg-[var(--pt-dourado-forte)] text-[var(--pt-petrol-950)] font-semibold rounded-md px-7 py-3.5 transition-colors"
            >
              Falar com a consultoria
            </a>
            <a
              href="#risco"
              className="text-[var(--pt-claro)] border border-[var(--pt-linha-escura)] hover:border-[var(--pt-claro-suave)] rounded-md px-7 py-3.5 transition-colors"
            >
              Entenda o risco
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
