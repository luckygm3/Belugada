"use client";

import { createContext, useContext, useState } from "react";
import { TEMA_COOKIE, type Tema } from "@/lib/tema";

interface TemaContextValue {
  tema: Tema;
  alternar: () => void;
}

const TemaContext = createContext<TemaContextValue | null>(null);

export function useTema(): TemaContextValue {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error("useTema precisa estar dentro de PainelAdminShell");
  return ctx;
}

function gravarCookieTema(tema: Tema) {
  document.cookie = `${TEMA_COOKIE}=${tema}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/**
 * Dona da classe ".dark" — aplicada só aqui, nunca em <html>/<body>. Esse
 * wrapper só existe dentro de admin/layout.tsx e empresa/layout.tsx, então
 * a classe nunca aparece na árvore da landing ou do login: isolamento por
 * construção, não por convenção.
 *
 * `temaInicial` já chega calculado pelo layout (preferência salva na conta
 * tem prioridade sobre o cookie local — ver admin/layout.tsx e
 * empresa/layout.tsx). Ao trocar o tema aqui, grava nos dois lugares: cookie
 * (efeito imediato, sem flash na próxima navegação) e conta via API
 * (acompanha o usuário pra outro dispositivo).
 */
export function PainelAdminShell({ temaInicial, children }: { temaInicial: Tema; children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  async function alternar() {
    const novoTema: Tema = tema === "dark" ? "light" : "dark";
    setTema(novoTema);
    gravarCookieTema(novoTema);

    try {
      await fetch("/api/usuario/preferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: novoTema }),
      });
    } catch {
      // preferência local já aplicada (cookie); a próxima troca tenta salvar de novo
    }
  }

  return (
    <TemaContext.Provider value={{ tema, alternar }}>
      <div className={`painel-admin flex min-h-screen ${tema === "dark" ? "dark" : ""}`}>{children}</div>
    </TemaContext.Provider>
  );
}
