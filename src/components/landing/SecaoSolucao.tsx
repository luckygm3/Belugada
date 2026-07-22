"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Sequência real do produto — a ordem carrega informação, por isso numerada
const ETAPAS = [
  {
    titulo: "Consultoria define o que sua empresa precisa",
    texto:
      "Uma advogada especialista em direito trabalhista analisa sua operação e define exatamente quais documentos cada tipo de contratação exige.",
  },
  {
    titulo: "Você cadastra o funcionário uma única vez",
    texto:
      "Dados pessoais, cargo, jornada e salário entram na plataforma em minutos, com validação automática de CPF, CEP e datas.",
  },
  {
    titulo: "A plataforma gera todos os documentos sozinha",
    texto:
      "Contratos, termos e declarações personalizados para aquele funcionário, prontos para assinar — sem retrabalho e sem esquecer nenhum.",
  },
  {
    titulo: "Sua empresa fica permanentemente protegida",
    texto:
      "Tudo organizado, versionado e disponível para baixar quando precisar — inclusive num único arquivo, na hora de uma fiscalização.",
  },
];

export function SecaoSolucao() {
  const escopo = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      // Ver HeroPacta: reveals só depois do primeiro frame de rAF
      requestAnimationFrame(
        contextSafe!(() => {
          const mm = gsap.matchMedia();
          mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.utils.toArray<HTMLElement>("[data-etapa]").forEach((el, i) => {
              gsap.from(el, {
                y: 40,
                autoAlpha: 0,
                duration: 0.8,
                delay: (i % 2) * 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              });
            });
            gsap.from("[data-solucao-titulo]", {
              y: 30,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: "[data-solucao-titulo]", start: "top 85%", once: true },
            });
          });
        })
      );
    },
    { scope: escopo }
  );

  return (
    <section
      id="solucao"
      ref={escopo}
      className="bg-[var(--pt-petrol-950)] text-[var(--pt-claro)] py-20 sm:py-28 scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-solucao-titulo className="max-w-2xl">
          <h2 className="fonte-display text-3xl sm:text-4xl text-balance">
            Prevenção que funciona sozinha
          </h2>
          <p className="mt-4 text-[var(--pt-claro-suave)] max-w-[65ch]">
            A PACTA transforma a orientação jurídica em rotina automática: o que a consultoria
            define, a plataforma executa para cada funcionário, sempre.
          </p>
        </div>

        <ol className="mt-14 grid sm:grid-cols-2 gap-x-12 gap-y-12">
          {ETAPAS.map((etapa, i) => (
            <li key={etapa.titulo} data-etapa className="flex gap-5">
              <span
                aria-hidden="true"
                className="fonte-display shrink-0 text-4xl text-[var(--pt-dourado)] leading-none mt-0.5"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-lg">{etapa.titulo}</h3>
                <p className="mt-2 text-[var(--pt-claro-suave)] max-w-[52ch]">{etapa.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
