"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// TODO: validar TODOS os números abaixo com fonte oficial (TST/CNJ) antes de publicar.
// Valores são placeholders de ordem de grandeza, não estatísticas verificadas.
const INDICADORES = [
  {
    valor: 3,
    prefixo: "≈ ",
    sufixo: " milhões",
    rotulo: "de novas ações trabalhistas por ano no Brasil",
    nota: "TODO: validar com relatório oficial do TST",
  },
  {
    valor: 40,
    prefixo: "R$ ",
    sufixo: " mil",
    rotulo: "é a ordem de grandeza do custo de uma condenação típica",
    nota: "TODO: validar com fonte oficial antes de publicar",
  },
  {
    valor: 4,
    prefixo: "≈ ",
    sufixo: " anos",
    rotulo: "de duração média de um processo até a decisão final",
    nota: "TODO: validar com Justiça em Números (CNJ)",
  },
];

// Proporções ILUSTRATIVAS para leitura visual do ranking, não percentuais reais.
// TODO: substituir pelas estatísticas oficiais de assuntos mais recorrentes (TST).
const CAUSAS = [
  { rotulo: "Verbas rescisórias não pagas ou incorretas", largura: 92 },
  { rotulo: "Horas extras sem registro adequado", largura: 76 },
  { rotulo: "Documentação ausente, incompleta ou irregular", largura: 64, destaque: true },
  { rotulo: "Adicionais (insalubridade, periculosidade) não documentados", largura: 48 },
];

export function SecaoRisco() {
  const escopo = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      // Ver HeroPacta: reveals só depois do primeiro frame de rAF
      requestAnimationFrame(
        contextSafe!(() => {
          const mm = gsap.matchMedia();

          mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Contadores: o markup já contém o valor final (sem JS, número certo aparece)
        gsap.utils.toArray<HTMLElement>("[data-contador]").forEach((el) => {
          const alvo = parseFloat(el.dataset.alvo!);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: alvo,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(obj.v));
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-barra]").forEach((el, i) => {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.1,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-risco-fade]").forEach((el) => {
          gsap.from(el, {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
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
    <section id="risco" ref={escopo} className="bg-[var(--pt-paper)] py-20 sm:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-risco-fade className="max-w-2xl">
          <h2 className="fonte-display text-3xl sm:text-4xl text-[var(--pt-ink)] text-balance">
            O passivo trabalhista não avisa antes de chegar
          </h2>
          <p className="mt-4 text-[var(--pt-ink-suave)] max-w-[65ch]">
            O Brasil é um dos países com maior volume de ações trabalhistas do mundo — e a
            defesa de uma empresa começa muito antes do processo: começa na documentação.
          </p>
        </div>

        <dl className="mt-14 grid sm:grid-cols-3 gap-x-10 gap-y-12">
          {INDICADORES.map((ind) => (
            <div key={ind.rotulo} data-risco-fade className="border-t-2 border-[var(--pt-petrol-800)] pt-5">
              <dt className="sr-only">{ind.rotulo}</dt>
              <dd>
                <span className="fonte-display text-5xl sm:text-6xl text-[var(--pt-petrol-800)]">
                  {ind.prefixo}
                  <span data-contador data-alvo={ind.valor}>
                    {ind.valor}
                  </span>
                  {ind.sufixo}
                </span>
                <p className="mt-3 text-[var(--pt-ink-suave)]">{ind.rotulo}</p>
              </dd>
            </div>
          ))}
        </dl>

        <div data-risco-fade className="mt-16 sm:mt-20 max-w-3xl">
          <h3 className="font-semibold text-lg text-[var(--pt-ink)]">
            Entre as causas mais comuns de condenação
          </h3>
          <div className="mt-6 space-y-5">
            {CAUSAS.map((c) => (
              <div key={c.rotulo}>
                <p
                  className={`text-sm mb-1.5 ${
                    c.destaque ? "font-semibold text-[var(--pt-ink)]" : "text-[var(--pt-ink-suave)]"
                  }`}
                >
                  {c.rotulo}
                </p>
                <div className="h-2.5 rounded-full bg-[var(--pt-linha-clara)] overflow-hidden">
                  <div
                    data-barra
                    className={`h-full rounded-full ${
                      c.destaque ? "bg-[var(--pt-dourado)]" : "bg-[var(--pt-petrol-800)]"
                    }`}
                    style={{ width: `${c.largura}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--pt-ink-suave)]">
            Proporções ilustrativas do ranking de recorrência — não representam percentuais
            exatos.
          </p>
        </div>

        <div
          data-risco-fade
          className="mt-16 sm:mt-20 border border-[var(--pt-linha-clara)] rounded-lg bg-white px-6 sm:px-10 py-8 sm:py-10"
        >
          <p className="fonte-display text-xl sm:text-2xl text-[var(--pt-ink)] max-w-[40ch] text-balance">
            Na Justiça do Trabalho, quem não documenta não consegue provar — e quem não
            consegue provar, paga.
          </p>
          <p className="mt-3 text-[var(--pt-ink-suave)] max-w-[65ch]">
            Contratos, aditivos, controles de jornada, recibos e termos assinados são a
            diferença entre encerrar uma reclamação no primeiro dia ou arrastá-la por anos.
          </p>
        </div>
      </div>
    </section>
  );
}
