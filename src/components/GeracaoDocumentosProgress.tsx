"use client";

import { useState } from "react";
import { ProgressBar, type ProgressBarVariant } from "./ui/ProgressBar";
import { Toast } from "./ui/Toast";

export type EstadoGeracaoDocumentos = "preparando" | "gerando" | "finalizando" | "concluido" | "erro";

export interface GeracaoDocumentosProgressProps {
  estado: EstadoGeracaoDocumentos;
  /** 0-100, usado apenas no estado "gerando". Omitido = barra indeterminada nessa etapa. */
  progresso?: number;
  /** Detalhe opcional ao lado do rótulo, ex.: "3 de 10 documentos". */
  detalhe?: string;
  nomeArquivo?: string;
  mensagemErro?: string;
  onBaixar?: () => void;
  onTentarNovamente?: () => void;
}

const ROTULO_POR_ESTADO: Record<EstadoGeracaoDocumentos, string> = {
  preparando: "Preparando documentos…",
  gerando: "Gerando documentos…",
  finalizando: "Finalizando…",
  concluido: "Documentos gerados com sucesso",
  erro: "Erro ao gerar documentos",
};

/**
 * Progresso do fluxo de geração de docx/PDF (preparando → gerando →
 * finalizando → concluído/erro). Isolado por enquanto — ainda não plugado
 * na rota real de geração (`/api/empresa/funcionarios/[id]/gerar-documentos`).
 * Quando integrar: `estado`/`progresso` vêm do acompanhamento real da
 * chamada; `onBaixar` deve chamar o mesmo fluxo de download já usado em
 * `GerarDocumentosForm`/`baixar-todos`.
 */
export function GeracaoDocumentosProgress({
  estado,
  progresso,
  detalhe,
  nomeArquivo,
  mensagemErro,
  onBaixar,
  onTentarNovamente,
}: GeracaoDocumentosProgressProps) {
  // Toast fica aberto sempre que o estado é terminal, exceto se o usuário já
  // fechou explicitamente *para esse mesmo estado* — sem useEffect: é só
  // um valor derivado de `estado` + qual foi o último estado dispensado.
  const [estadoDispensado, setEstadoDispensado] = useState<EstadoGeracaoDocumentos | null>(null);
  const ehTerminal = estado === "concluido" || estado === "erro";
  const toastAberto = ehTerminal && estado !== estadoDispensado;

  const valorBarra: number | undefined =
    estado === "concluido" ? 100 : estado === "finalizando" ? 92 : estado === "gerando" ? progresso : undefined;

  const indeterminado = estado !== "erro" && valorBarra === undefined;
  const variante: ProgressBarVariant = estado === "concluido" ? "success" : estado === "erro" ? "danger" : "primary";

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-body-sm font-medium text-ink">{ROTULO_POR_ESTADO[estado]}</p>
        {estado === "gerando" && detalhe && <p className="text-caption text-ink-muted">{detalhe}</p>}
      </div>

      <ProgressBar
        value={valorBarra ?? (estado === "erro" ? 100 : 0)}
        indeterminate={indeterminado}
        variant={variante}
        aria-label={ROTULO_POR_ESTADO[estado]}
      />

      {estado === "erro" && mensagemErro && <p className="mt-2 text-caption text-red-600">{mensagemErro}</p>}

      <Toast
        aberto={toastAberto}
        variant={estado === "erro" ? "error" : "success"}
        titulo={estado === "erro" ? "Não foi possível gerar os documentos" : "Documentos prontos"}
        descricao={
          estado === "erro"
            ? (mensagemErro ?? "Tente novamente em instantes.")
            : nomeArquivo
              ? `${nomeArquivo} está pronto para download.`
              : "Seus documentos foram gerados."
        }
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
