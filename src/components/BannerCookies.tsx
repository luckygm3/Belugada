"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CATEGORIAS_COOKIE,
  CONSENTIMENTO_COOKIE,
  lerConsentimentoCookie,
  type EscolhasConsentimento,
} from "@/lib/consentimento";

/** Nome do evento disparado pelo link "Preferências de cookies" no rodapé, pra reabrir o banner. */
export const EVENTO_ABRIR_PREFERENCIAS_COOKIES = "pacta:abrir-preferencias-cookies";

function lerCookieAtual(): EscolhasConsentimento | null {
  const par = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENTIMENTO_COOKIE}=`));
  return lerConsentimentoCookie(par?.split("=")[1]);
}

export function BannerCookies() {
  const reduzMovimento = useReducedMotion();
  const [visivel, setVisivel] = useState(false);
  const [personalizando, setPersonalizando] = useState(false);
  const [escolhas, setEscolhas] = useState<EscolhasConsentimento>({ preferencias: true, analytics: true });

  useEffect(() => {
    const salvo = lerCookieAtual();
    if (!salvo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com cookie, só existe no client
      setVisivel(true);
    } else {
      setEscolhas(salvo);
    }

    function aoReabrir() {
      setEscolhas(lerCookieAtual() ?? { preferencias: true, analytics: true });
      setPersonalizando(true);
      setVisivel(true);
    }
    window.addEventListener(EVENTO_ABRIR_PREFERENCIAS_COOKIES, aoReabrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PREFERENCIAS_COOKIES, aoReabrir);
  }, []);

  async function salvar(escolha: EscolhasConsentimento) {
    const valor = encodeURIComponent(JSON.stringify(escolha));
    document.cookie = `${CONSENTIMENTO_COOKIE}=${valor}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setVisivel(false);
    setPersonalizando(false);

    try {
      await fetch("/api/consentimento-cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(escolha),
      });
    } catch {
      // a escolha já vale localmente (cookie gravado); o registro de auditoria
      // é importante mas sua falha não pode travar a navegação do visitante
    }
  }

  if (!visivel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="dialog"
        aria-label="Preferências de cookies"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--pt-linha-escura)] bg-[var(--pt-petrol-950)] text-[var(--pt-claro)]"
      >
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          {!personalizando ? (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--pt-claro-suave)]">
                Usamos cookies essenciais pro sistema funcionar e, com sua permissão, cookies de preferência e
                analytics. Veja detalhes na{" "}
                <Link href="/politica-de-cookies" className="underline hover:text-[var(--pt-claro)]">
                  política de cookies
                </Link>
                .
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  onClick={() => setPersonalizando(true)}
                  className="rounded-md border border-[var(--pt-linha-escura)] px-4 py-2 text-sm text-[var(--pt-claro)] transition-colors hover:border-[var(--pt-claro-suave)]"
                >
                  Personalizar
                </button>
                <button
                  onClick={() => salvar({ preferencias: false, analytics: false })}
                  className="rounded-md border border-[var(--pt-linha-escura)] px-4 py-2 text-sm text-[var(--pt-claro)] transition-colors hover:border-[var(--pt-claro-suave)]"
                >
                  Recusar não essenciais
                </button>
                <button
                  onClick={() => salvar({ preferencias: true, analytics: true })}
                  className="rounded-md bg-[var(--pt-dourado)] px-4 py-2 text-sm font-medium text-[var(--pt-petrol-950)] transition-colors hover:bg-[var(--pt-dourado-forte)]"
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-[var(--pt-claro)]">Preferências de cookies</p>
              <ul className="mt-3 space-y-3">
                {CATEGORIAS_COOKIE.map((cat) => (
                  <li key={cat.chave} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`cookie-${cat.chave}`}
                      checked={cat.chave === "essenciais" ? true : escolhas[cat.chave]}
                      disabled={cat.obrigatoria}
                      onChange={(e) =>
                        cat.chave !== "essenciais" &&
                        setEscolhas((atual) => ({ ...atual, [cat.chave]: e.target.checked }))
                      }
                      className="mt-1 accent-[var(--pt-dourado)] disabled:opacity-60"
                    />
                    <label htmlFor={`cookie-${cat.chave}`} className="text-sm">
                      <span className="font-medium text-[var(--pt-claro)]">
                        {cat.titulo}
                        {cat.obrigatoria && " (sempre ativo)"}
                      </span>
                      <p className="text-[var(--pt-claro-suave)]">{cat.descricao}</p>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setPersonalizando(false)}
                  className="rounded-md border border-[var(--pt-linha-escura)] px-4 py-2 text-sm text-[var(--pt-claro)] transition-colors hover:border-[var(--pt-claro-suave)]"
                >
                  Voltar
                </button>
                <button
                  onClick={() => salvar(escolhas)}
                  className="rounded-md bg-[var(--pt-dourado)] px-4 py-2 text-sm font-medium text-[var(--pt-petrol-950)] transition-colors hover:bg-[var(--pt-dourado-forte)]"
                >
                  Salvar preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
