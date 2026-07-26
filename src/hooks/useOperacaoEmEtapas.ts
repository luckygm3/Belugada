import { useRef, useState } from "react";

export type EstadoOperacaoEmEtapas = "ocioso" | "andamento" | "concluido" | "erro";

/**
 * Avança por um array de etapas nomeadas enquanto uma operação assíncrona
 * roda, sem depender de progresso real do servidor (a API não expõe isso).
 * A cada `duracaoPorEtapaMs`, mostra a próxima etapa — só ilustrativo, pra
 * comunicar que o sistema está trabalhando; o estado final (concluído/erro)
 * vem do resultado de verdade da promise.
 */
export function useOperacaoEmEtapas(etapas: string[], duracaoPorEtapaMs = 1200) {
  const [estado, setEstado] = useState<EstadoOperacaoEmEtapas>("ocioso");
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [mensagemErro, setMensagemErro] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function pararTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function executar(fn: () => Promise<void>) {
    pararTimer();
    setEstado("andamento");
    setEtapaAtual(0);
    setMensagemErro("");

    timerRef.current = setInterval(() => {
      setEtapaAtual((i) => Math.min(i + 1, etapas.length - 1));
    }, duracaoPorEtapaMs);

    try {
      await fn();
      pararTimer();
      setEstado("concluido");
    } catch (e) {
      pararTimer();
      setMensagemErro(e instanceof Error ? e.message : "Erro inesperado.");
      setEstado("erro");
    }
  }

  function resetar() {
    pararTimer();
    setEstado("ocioso");
  }

  return { estado, etapaAtual, mensagemErro, executar, resetar };
}
