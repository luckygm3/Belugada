"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ROTULOS_TIPO_ATIVIDADE, formatarTempoRelativo } from "@/lib/notificacoes";
import { nivelUrgencia } from "@/lib/vencimentos";
import type { TipoAtividade } from "@prisma/client";

interface NotificacaoItem {
  id: string;
  tipo: TipoAtividade;
  descricao: string;
  lida: boolean;
  createdAt: string;
  empresa?: { id: string; razaoSocial: string } | null;
  diasAntecedencia?: number | null;
}

const INTERVALO_POLLING_MS = 30000;

function IconeSino() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M10 3a4.5 4.5 0 00-4.5 4.5v2.19c0 .45-.16.88-.46 1.22L4 12.25c-.6.68-.13 1.75.77 1.75h10.46c.9 0 1.37-1.07.77-1.75l-1.04-1.34a1.83 1.83 0 01-.46-1.22V7.5A4.5 4.5 0 0010 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.2 16a1.8 1.8 0 003.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BadgeUrgencia({ diasAntecedencia }: { diasAntecedencia: number | null | undefined }) {
  const nivel = nivelUrgencia(diasAntecedencia);
  if (!nivel || diasAntecedencia == null) return null;

  const classe =
    nivel === "urgente"
      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  const rotulo = diasAntecedencia <= 0 ? "vencido" : `${diasAntecedencia}d`;

  return (
    <span className={`shrink-0 rounded-pa-full px-2 py-0.5 text-caption font-medium ${classe}`}>{rotulo}</span>
  );
}

function ItemNotificacao({ n, onClick }: { n: NotificacaoItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-alt ${
        n.lida ? "" : "bg-navy-50/50 dark:bg-navy-900/40"
      }`}
    >
      <div className="flex w-full items-start gap-2">
        {!n.lida && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pa-full bg-navy-600" aria-hidden="true" />}
        <p className={`flex-1 text-body-sm ${n.lida ? "text-ink-muted" : "font-medium text-ink"}`}>{n.descricao}</p>
        <BadgeUrgencia diasAntecedencia={n.diasAntecedencia} />
      </div>
      <p className="pl-3.5 text-caption text-ink-muted">
        {n.empresa ? `${n.empresa.razaoSocial} · ` : ""}
        {ROTULOS_TIPO_ATIVIDADE[n.tipo]} · {formatarTempoRelativo(n.createdAt)}
      </p>
    </button>
  );
}

interface NotificationBellProps {
  /** admin vê tudo (atividade + prazos de todas as empresas); empresa vê só os próprios prazos. */
  escopo?: "admin" | "empresa";
}

export function NotificationBell({ escopo = "admin" }: NotificationBellProps) {
  const basePath = escopo === "admin" ? "/api/admin/notificacoes" : "/api/empresa/notificacoes";

  const [aberto, setAberto] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [prazos, setPrazos] = useState<NotificacaoItem[]>([]);
  const [atividade, setAtividade] = useState<NotificacaoItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduzMovimento = useReducedMotion();

  const buscarContagem = useCallback(async () => {
    try {
      const res = await fetch(`${basePath}?limit=1`);
      if (!res.ok) return;
      const dados = await res.json();
      setNaoLidas(dados.naoLidas ?? 0);
    } catch {
      // silencioso: contagem tenta de novo no próximo polling
    }
  }, [basePath]);

  const buscarLista = useCallback(async () => {
    setCarregando(true);
    try {
      if (escopo === "admin") {
        const [resPrazos, resAtividade] = await Promise.all([
          fetch(`${basePath}?tipo=VENCIMENTO_PROXIMO&limit=5`),
          fetch(`${basePath}?tipoExcluido=VENCIMENTO_PROXIMO&limit=6`),
        ]);
        const [dadosPrazos, dadosAtividade] = await Promise.all([resPrazos.json(), resAtividade.json()]);
        setPrazos(dadosPrazos.notificacoes ?? []);
        setAtividade(dadosAtividade.notificacoes ?? []);
        setNaoLidas(dadosAtividade.naoLidas ?? dadosPrazos.naoLidas ?? 0);
      } else {
        const res = await fetch(`${basePath}?limit=8`);
        const dados = await res.json();
        setPrazos(dados.notificacoes ?? []);
        setNaoLidas(dados.naoLidas ?? 0);
      }
    } catch {
      // silencioso
    } finally {
      setCarregando(false);
    }
  }, [basePath, escopo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza contagem com a API ao montar; setState real só ocorre depois do await no fetch
    buscarContagem();
    const intervalo = setInterval(buscarContagem, INTERVALO_POLLING_MS);
    return () => clearInterval(intervalo);
  }, [buscarContagem]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza lista com a API ao abrir o dropdown; setState real só ocorre depois do await no fetch
    if (aberto) buscarLista();
  }, [aberto, buscarLista]);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
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
  }, []);

  async function marcarComoLida(id: string) {
    setPrazos((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    setAtividade((atual) => atual.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    setNaoLidas((atual) => Math.max(0, atual - 1));
    try {
      await fetch(`${basePath}/${id}`, { method: "PATCH" });
    } catch {
      // otimista: se falhar, o próximo polling corrige a contagem
    }
  }

  async function marcarTodasComoLidas() {
    setPrazos((atual) => atual.map((n) => ({ ...n, lida: true })));
    setAtividade((atual) => atual.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    try {
      await fetch(`${basePath}/marcar-todas-lidas`, { method: "POST" });
    } catch {
      // otimista: se falhar, o próximo polling corrige a contagem
    }
  }

  const semNotificacoes = prazos.length === 0 && atividade.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
        aria-expanded={aberto}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-pa-md text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      >
        <IconeSino />
        {naoLidas > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-pa-full bg-red-600 px-1 text-caption font-medium leading-none text-white"
          >
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-80 rounded-pa-lg border border-border bg-surface shadow-pa-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-body-sm font-medium text-ink">Notificações</p>
              {naoLidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasComoLidas}
                  className="text-caption font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {carregando && semNotificacoes && (
                <p className="p-4 text-center text-body-sm text-ink-muted">Carregando...</p>
              )}

              {!carregando && semNotificacoes && (
                <p className="p-4 text-center text-body-sm text-ink-muted">
                  {escopo === "admin" ? "Nenhuma atividade ainda." : "Nenhum prazo próximo por enquanto."}
                </p>
              )}

              {prazos.length > 0 && (
                <div>
                  {escopo === "admin" && (
                    <p className="bg-surface-alt px-4 py-1.5 text-caption font-medium uppercase tracking-wide text-ink-muted">
                      Prazos próximos
                    </p>
                  )}
                  {prazos.map((n) => (
                    <ItemNotificacao key={n.id} n={n} onClick={() => !n.lida && marcarComoLida(n.id)} />
                  ))}
                </div>
              )}

              {escopo === "admin" && atividade.length > 0 && (
                <div>
                  <p className="bg-surface-alt px-4 py-1.5 text-caption font-medium uppercase tracking-wide text-ink-muted">
                    Atividade recente
                  </p>
                  {atividade.map((n) => (
                    <ItemNotificacao key={n.id} n={n} onClick={() => !n.lida && marcarComoLida(n.id)} />
                  ))}
                </div>
              )}
            </div>

            {escopo === "admin" && (
              <div className="border-t border-border px-4 py-2.5">
                <Link
                  href="/admin/notificacoes"
                  onClick={() => setAberto(false)}
                  className="text-body-sm font-medium text-navy-600 hover:text-navy-700 dark:text-navy-300 dark:hover:text-navy-200 hover:underline"
                >
                  Ver todas as atividades
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
