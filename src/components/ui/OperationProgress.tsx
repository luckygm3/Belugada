"use client";

import { useState } from "react";
import { ProgressBar, type ProgressBarVariant } from "./ProgressBar";
import { Toast } from "./Toast";

export interface OperationProgressProps {
  /** Rótulos das etapas, em ordem (ex.: ["Preenchendo dados...", "Compilando documento...", "Quase lá..."]). */
  etapas: string[];
  /** Índice (0-based) da etapa atual em `etapas`. Ignorado quando `estado` é "concluido"/"erro". */
  etapaAtual: number;
  estado: "andamento" | "concluido" | "erro";
  /** Detalhe opcional ao lado do rótulo da etapa, ex.: "3 de 10 documentos". */
  detalhe?: string;
  tituloConcluido?: string;
  descricaoConcluido?: string;
  tituloErro?: string;
  mensagemErro?: string;
  onBaixar?: () => void;
  onTentarNovamente?: () => void;
}

/**
 * Barra de progresso com etapas nomeadas, genérica pra qualquer operação
 * longa (>3s) — geração de documentos, montagem de .zip, etc. Quem chama só
 * declara o próprio array de `etapas`; nada aqui é específico de nenhum
 * fluxo. A barra fica indeterminada dentro de cada etapa (não sabemos a
 * duração exata de cada uma) e some pro toast quando termina.
 */
export function OperationProgress({
  etapas,
  etapaAtual,
  estado,
  detalhe,
  tituloConcluido = "Concluído",
  descricaoConcluido = "Operação concluída com sucesso.",
  tituloErro = "Algo deu errado",
  mensagemErro,
  onBaixar,
  onTentarNovamente,
}: OperationProgressProps) {
  // Toast fica aberto sempre que o estado é terminal, exceto se o usuário já
  // fechou explicitamente *para esse mesmo estado* — sem useEffect: é só um
  // valor derivado de `estado` + qual foi o último estado dispensado.
  const [estadoDispensado, setEstadoDispensado] = useState<OperationProgressProps["estado"] | null>(null);
  const ehTerminal = estado === "concluido" || estado === "erro";
  const toastAberto = ehTerminal && estado !== estadoDispensado;

  const rotulo =
    estado === "concluido" ? tituloConcluido : estado === "erro" ? tituloErro : (etapas[etapaAtual] ?? etapas[0]);

  const variante: ProgressBarVariant = estado === "concluido" ? "success" : estado === "erro" ? "danger" : "primary";
  const valorBarra = estado === "concluido" ? 100 : estado === "erro" ? 100 : undefined;

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-body-sm font-medium text-ink">{rotulo}</p>
        {estado === "andamento" && detalhe && <p className="text-caption text-ink-muted">{detalhe}</p>}
      </div>

      <ProgressBar
        value={valorBarra ?? 0}
        indeterminate={estado === "andamento"}
        variant={variante}
        aria-label={rotulo}
      />

      {estado === "erro" && mensagemErro && <p className="mt-2 text-caption text-red-600">{mensagemErro}</p>}

      <Toast
        aberto={toastAberto}
        variant={estado === "erro" ? "error" : "success"}
        titulo={estado === "erro" ? tituloErro : tituloConcluido}
        descricao={estado === "erro" ? (mensagemErro ?? "Tente novamente em instantes.") : descricaoConcluido}
        acao={
          estado === "concluido" && onBaixar
            ? { rotulo: "Baixar", onClick: onBaixar }
            : estado === "erro" && onTentarNovamente
              ? { rotulo: "Tentar novamente", onClick: onTentarNovamente }
              : undefined
        }
        onFechar={() => setEstadoDispensado(estado)}
      />
    </div>
  );
}
