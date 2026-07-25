"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";

interface ExcluirFuncionarioButtonProps {
  funcionarioId: string;
  nomeFuncionario: string;
  redirecionarApos?: string;
}

export default function ExcluirFuncionarioButton({
  funcionarioId,
  nomeFuncionario,
  redirecionarApos,
}: ExcluirFuncionarioButtonProps) {
  const router = useRouter();
  const reduzMovimento = useReducedMotion();
  const [modalAberto, setModalAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmarExclusao() {
    setExcluindo(true);
    setErro("");

    const res = await fetch(`/api/empresa/funcionarios/${funcionarioId}`, { method: "DELETE" });

    setExcluindo(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao excluir funcionário.");
      return;
    }

    setModalAberto(false);

    if (redirecionarApos) {
      router.push(redirecionarApos);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="text-body-sm font-medium text-red-600 hover:underline"
      >
        Excluir
      </button>

      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !excluindo && setModalAberto(false)}
          >
            <motion.div
              initial={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              animate={reduzMovimento ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduzMovimento ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm space-y-4 rounded-pa-lg border border-border bg-surface p-6 shadow-pa-lg"
            >
              <p className="text-body-sm text-ink">
                Tem certeza que deseja excluir <strong>{nomeFuncionario}</strong>? Essa ação não pode ser
                desfeita e apaga todos os documentos gerados desse funcionário.
              </p>
              {erro && <p className="text-body-sm text-red-600">{erro}</p>}
              <div className="flex justify-end gap-3">
                <Button variant="secondary" className="text-body-sm" onClick={() => setModalAberto(false)} disabled={excluindo}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="text-body-sm" loading={excluindo} onClick={confirmarExclusao}>
                  {excluindo ? "Excluindo..." : "Excluir permanentemente"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
