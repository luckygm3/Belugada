"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/Button";
import { DIAS_ALERTA_PADRAO } from "@/lib/vencimentos";

export interface TemplateVencimento {
  id: string;
  nome: string;
  variaveisDetectadas: string[];
  variavelVencimento: string | null;
  diasAlertaVencimento: number[];
}

interface Props {
  template: TemplateVencimento;
  onFechar: () => void;
  onSalvar: (id: string, atualizado: { variavelVencimento: string | null; diasAlertaVencimento: number[] }) => void;
}

export function ConfigurarVencimentoModal({ template, onFechar, onSalvar }: Props) {
  const reduzMovimento = useReducedMotion();
  const [variavel, setVariavel] = useState(template.variavelVencimento ?? "");
  const [marcos, setMarcos] = useState(
    template.diasAlertaVencimento.length > 0 ? template.diasAlertaVencimento.join(", ") : ""
  );
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar() {
    setErro("");
    setCarregando(true);

    const diasAlertaVencimento = marcos
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    const res = await fetch(`/api/admin/templates-padrao/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variavelVencimento: variavel || null, diasAlertaVencimento }),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json();
      setErro(data.error || "Erro ao salvar configuração de vencimento.");
      return;
    }

    onSalvar(template.id, { variavelVencimento: variavel || null, diasAlertaVencimento });
    onFechar();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onFechar}
      >
        <motion.div
          initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-pa-lg border border-border bg-surface p-6 shadow-pa-lg"
        >
          <h2 className="text-h3 text-ink">Vencimento — {template.nome}</h2>
          <p className="mt-1 text-body-sm text-ink-muted">
            Se este documento tem uma data-limite, escolha qual variável a representa. Os alertas avisam a
            empresa (e o admin) conforme o prazo se aproxima.
          </p>

          <div className="mt-4 flex flex-col gap-1">
            <label htmlFor="variavelVencimento" className="text-label text-ink-muted">
              Variável de vencimento
            </label>
            <select
              id="variavelVencimento"
              value={variavel}
              onChange={(e) => setVariavel(e.target.value)}
              className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
            >
              <option value="">Nenhuma — este documento não vence</option>
              {template.variaveisDetectadas.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {variavel && (
            <div className="mt-4 flex flex-col gap-1">
              <label htmlFor="marcos" className="text-label text-ink-muted">
                Avisar com antecedência de (dias, separados por vírgula)
              </label>
              <input
                id="marcos"
                value={marcos}
                onChange={(e) => setMarcos(e.target.value)}
                placeholder={DIAS_ALERTA_PADRAO.join(", ")}
                className="rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
              />
              <p className="text-caption text-ink-muted">
                Em branco usa o padrão do sistema: {DIAS_ALERTA_PADRAO.join(", ")} dias.
              </p>
            </div>
          )}

          {erro && <p className="mt-3 text-body-sm text-red-600">{erro}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" className="text-body-sm" onClick={onFechar} disabled={carregando}>
              Cancelar
            </Button>
            <Button variant="primary" className="text-body-sm" onClick={salvar} loading={carregando}>
              Salvar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
