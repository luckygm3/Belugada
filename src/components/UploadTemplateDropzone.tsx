"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProgressBar } from "./ui/ProgressBar";
import { Button } from "./ui/Button";

type Fase = "ocioso" | "selecionado" | "enviando" | "sucesso" | "erro";
type TipoVencimento = "nenhum" | "data" | "prazo";

const EXTENSAO_VALIDA = ".docx";

export interface VencimentoIndividual {
  tipo: TipoVencimento;
  /** ISO yyyy-mm-dd, só quando tipo === "data" */
  data: string;
  /** dias a partir da geração do documento, só quando tipo === "prazo" */
  dias: string;
}

const VENCIMENTO_VAZIO: VencimentoIndividual = { tipo: "nenhum", data: "", dias: "" };

function validarArquivo(arquivo: File): string | null {
  if (!arquivo.name.toLowerCase().endsWith(EXTENSAO_VALIDA)) {
    return "Envie um arquivo .docx — outros formatos não são aceitos.";
  }
  return null;
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconeNuvemUpload() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-ink-muted" aria-hidden="true">
      <path
        d="M12 28h-1.5A6.5 6.5 0 0 1 4 21.5c0-3.31 2.44-6.05 5.63-6.45A8 8 0 0 1 25 13.06 6.5 6.5 0 0 1 28.5 26H27"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 32V19m0 0l-4.5 4.5M20 19l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeSoltarAqui() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 text-navy-600 dark:text-navy-400" aria-hidden="true">
      <rect x="7" y="21" width="26" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 6v16m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeDocumento({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-8 w-8 text-navy-600 dark:text-navy-400"} aria-hidden="true">
      <path
        d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconeCheckCirculo() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15" />
      <path d="M6 10.5l2.5 2.5L14 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeX() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export interface UploadTemplateDropzoneProps {
  /**
   * Executa o upload de verdade. Chame `aoProgredir(percentual)` conforme o
   * envio avança (0-100) — a barra de progresso reflete isso ao vivo.
   * Resolva a promise quando terminar; rejeite com um Error para mostrar a
   * mensagem de erro. Ainda não fornecida pela biblioteca de templates —
   * a integração real fica pro caller passar essa função depois.
   */
  aoEnviar?: (
    arquivo: File,
    vencimento: VencimentoIndividual,
    aoProgredir: (percentual: number) => void
  ) => Promise<void>;
  className?: string;
}

/**
 * Dropzone de upload de templates (.docx) — arrastar/soltar ou clicar,
 * validação de extensão, preview do arquivo antes de enviar, e progresso
 * via `ProgressBar` (Prompt 3) durante o envio. Isolado por enquanto: não
 * está plugado na página real da biblioteca de templates.
 */
export function UploadTemplateDropzone({ aoEnviar, className }: UploadTemplateDropzoneProps) {
  const idInput = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fase, setFase] = useState<Fase>("ocioso");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erroValidacao, setErroValidacao] = useState("");
  const [erroUpload, setErroUpload] = useState("");
  const [vencimento, setVencimento] = useState<VencimentoIndividual>(VENCIMENTO_VAZIO);

  function processarArquivo(novoArquivo: File) {
    const erro = validarArquivo(novoArquivo);
    if (erro) {
      setErroValidacao(erro);
      return;
    }
    setErroValidacao("");
    setArquivo(novoArquivo);
    setFase("selecionado");
  }

  function aoSoltar(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setArrastando(false);
    const novoArquivo = e.dataTransfer.files?.[0];
    if (novoArquivo) processarArquivo(novoArquivo);
  }

  function aoSelecionarViaInput(e: React.ChangeEvent<HTMLInputElement>) {
    const novoArquivo = e.target.files?.[0];
    if (novoArquivo) processarArquivo(novoArquivo);
    e.target.value = "";
  }

  function remover() {
    setArquivo(null);
    setFase("ocioso");
    setProgresso(0);
    setErroUpload("");
    setVencimento(VENCIMENTO_VAZIO);
  }

  async function iniciarEnvio() {
    if (!arquivo) return;
    setFase("enviando");
    setProgresso(0);
    setErroUpload("");

    if (!aoEnviar) {
      setErroUpload("Upload ainda não conectado a nenhuma rota — passe a prop `aoEnviar`.");
      setFase("erro");
      return;
    }

    try {
      await aoEnviar(arquivo, vencimento, setProgresso);
      setFase("sucesso");
    } catch (e) {
      setErroUpload(e instanceof Error ? e.message : "Erro ao enviar o arquivo.");
      setFase("erro");
    }
  }

  return (
    <div className={className}>
      {fase === "ocioso" && (
        <label
          htmlFor={idInput}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setArrastando(false);
          }}
          onDrop={aoSoltar}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-pa-lg border-2 border-dashed p-10 text-center transition-colors duration-150",
            arrastando
              ? "border-navy-500 bg-navy-50 dark:bg-navy-900"
              : "border-border bg-surface-alt hover:border-slate-300 dark:hover:border-slate-600",
          ].join(" ")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={arrastando ? "soltar" : "upload"}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {arrastando ? <IconeSoltarAqui /> : <IconeNuvemUpload />}
            </motion.div>
          </AnimatePresence>
          <div>
            <p className="text-body font-medium text-ink">
              {arrastando ? "Solte o arquivo aqui" : "Arraste o arquivo ou clique aqui"}
            </p>
            <p className="mt-1 text-body-sm text-ink-muted">Apenas arquivos .docx</p>
          </div>
          <input
            ref={inputRef}
            id={idInput}
            type="file"
            accept=".docx"
            onChange={aoSelecionarViaInput}
            className="sr-only"
          />
        </label>
      )}

      {erroValidacao && (
        <p role="alert" className="mt-2 text-caption text-red-600">
          {erroValidacao}
        </p>
      )}

      {arquivo && fase !== "ocioso" && (
        <div className="rounded-pa-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <IconeDocumento />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-ink">{arquivo.name}</p>
              <p className="text-body-sm text-ink-muted">{formatarTamanho(arquivo.size)}</p>
            </div>
            {fase === "selecionado" && (
              <button
                onClick={remover}
                aria-label="Remover arquivo"
                className="shrink-0 text-ink-muted transition-colors hover:text-ink"
              >
                <IconeX />
              </button>
            )}
            {fase === "sucesso" && <IconeCheckCirculo />}
          </div>

          {fase === "enviando" && (
            <div className="mt-3">
              <ProgressBar value={progresso} variant="primary" aria-label="Enviando arquivo" />
              <p className="mt-1 text-caption text-ink-muted">{Math.round(progresso)}%</p>
            </div>
          )}

          {fase === "erro" && erroUpload && (
            <p role="alert" className="mt-2 text-caption text-red-600">
              {erroUpload}
            </p>
          )}

          {fase === "selecionado" && (
            <div className="mt-4 border-t border-border pt-3">
              <label htmlFor={`${idInput}-vencimento`} className="text-label text-ink-muted">
                Vencimento deste documento (opcional)
              </label>
              <p className="mt-0.5 text-caption text-ink-muted">
                Deixe em branco se o documento não tiver validade. Se definido aqui, vale pra este documento
                mesmo que o tipo tenha uma configuração de prazo padrão.
              </p>
              <select
                id={`${idInput}-vencimento`}
                value={vencimento.tipo}
                onChange={(e) => setVencimento((v) => ({ ...v, tipo: e.target.value as TipoVencimento }))}
                className="mt-2 rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
              >
                <option value="nenhum">Sem vencimento</option>
                <option value="data">Data específica</option>
                <option value="prazo">Prazo em dias após a geração</option>
              </select>

              {vencimento.tipo === "data" && (
                <input
                  type="date"
                  value={vencimento.data}
                  onChange={(e) => setVencimento((v) => ({ ...v, data: e.target.value }))}
                  className="mt-2 block rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
                />
              )}

              {vencimento.tipo === "prazo" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={vencimento.dias}
                    onChange={(e) => setVencimento((v) => ({ ...v, dias: e.target.value }))}
                    placeholder="Ex: 365"
                    className="w-28 rounded-pa-md border border-border bg-surface px-3 py-2 text-body-sm text-ink"
                  />
                  <span className="text-body-sm text-ink-muted">dias</span>
                </div>
              )}
            </div>
          )}

          {fase === "selecionado" && (
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={iniciarEnvio} className="text-body-sm">
                Enviar arquivo
              </Button>
              <Button variant="secondary" onClick={remover} className="text-body-sm">
                Cancelar
              </Button>
            </div>
          )}

          {fase === "erro" && (
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={iniciarEnvio} className="text-body-sm">
                Tentar novamente
              </Button>
              <Button variant="secondary" onClick={remover} className="text-body-sm">
                Cancelar
              </Button>
            </div>
          )}

          {fase === "sucesso" && (
            <div className="mt-3">
              <Button variant="secondary" onClick={remover} className="text-body-sm">
                Enviar outro arquivo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
