"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/Button";

function IconeBalao() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 5.5A2.5 2.5 0 015.5 3h9A2.5 2.5 0 0117 5.5v6A2.5 2.5 0 0114.5 14H9l-4 3v-3H5.5A2.5 2.5 0 013 11.5v-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Botão flutuante fixo, visível em toda a área interna (admin e empresa —
 * montado uma vez em PainelAdminShell). Discreto de propósito: cores neutras
 * em repouso, só o ícone+texto some em telas estreitas. `bottom-24` (não
 * `bottom-6`) pra não competir de posição com o Toast, que usa o mesmo canto.
 */
export function NotaFeedbackWidget() {
  const pathname = usePathname();
  const reduzMovimento = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoPressionarEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarEsc);
    };
  }, [aberto]);

  async function enviar() {
    if (!texto.trim()) {
      setErro("Escreva algo antes de enviar.");
      return;
    }
    setErro("");
    setEnviando(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, paginaOrigem: pathname }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Erro ao enviar. Tente novamente.");
        setEnviando(false);
        return;
      }

      setEnviando(false);
      setEnviado(true);
      setTexto("");
      setTimeout(() => {
        setAberto(false);
        setEnviado(false);
      }, 1500);
    } catch {
      setErro("Erro de rede ao enviar.");
      setEnviando(false);
    }
  }

  return (
    <div ref={containerRef} className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full right-0 mb-3 w-80 rounded-pa-lg border border-border bg-surface p-4 shadow-pa-lg"
          >
            {enviado ? (
              <p className="text-body-sm text-green-600">Nota enviada — obrigado!</p>
            ) : (
              <>
                <p className="mb-2 text-body-sm font-medium text-ink">Notei falta de algo</p>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={4}
                  placeholder="O que você notou?"
                  className="input resize-none"
                  autoFocus
                />
                {erro && <p className="mt-1.5 text-caption text-red-600">{erro}</p>}
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="secondary" className="text-body-sm" onClick={() => setAberto(false)} disabled={enviando}>
                    Cancelar
                  </Button>
                  <Button variant="primary" className="text-body-sm" loading={enviando} onClick={enviar}>
                    Enviar
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label="Notei falta de algo — enviar observação"
        className="flex items-center gap-2 rounded-pa-full border border-border bg-surface px-4 py-2.5 text-body-sm font-medium text-ink-muted shadow-pa-sm transition-colors hover:bg-surface-alt hover:text-ink"
      >
        <IconeBalao />
        <span className="hidden sm:inline">Notei falta de algo</span>
      </button>
    </div>
  );
}
