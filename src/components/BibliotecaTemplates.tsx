"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { Button } from "./ui/Button";
import { UploadTemplateDropzone } from "./UploadTemplateDropzone";

export interface TemplateBiblioteca {
  id: string;
  nome: string;
  tipo: "PADRAO" | "PERSONALIZADO";
  origem: "UPLOAD" | "EDITOR";
  arquivoOriginalUrl: string | null;
  variaveisDetectadas: string[];
  createdAt: string; // ISO — serializado do server component
  empresa: { razaoSocial: string } | null;
}

type Visualizacao = "grid" | "lista";
const CHAVE_SESSAO = "biblioteca-templates-visualizacao";

function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(iso));
}

function enviarViaXhr(url: string, formData: FormData, aoProgredir: (percentual: number) => void) {
  return new Promise<{ template: TemplateBiblioteca }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let corpo: Record<string, unknown> = {};
      try {
        corpo = JSON.parse(xhr.responseText);
      } catch {
        // resposta vazia/ inválida — cai no tratamento de erro abaixo
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(corpo as { template: TemplateBiblioteca });
      } else {
        reject(new Error((corpo.error as string) || "Erro ao enviar o arquivo."));
      }
    };
    xhr.onerror = () => reject(new Error("Erro de rede ao enviar o arquivo."));
    xhr.send(formData);
  });
}

function IconeDocx({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-6 w-6 text-navy-600"} aria-hidden="true">
      <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconeEditor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-6 w-6 text-teal-600"} aria-hidden="true">
      <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 17.5l1-3.2 5.3-5.3a1 1 0 0 1 1.4 0l.8.8a1 1 0 0 1 0 1.4L12.2 16.5l-3.2 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function IconeGrade({ ativo }: { ativo: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="3" width="6" height="6" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconeLista({ ativo }: { ativo: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="4" width="14" height="2.4" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <rect x="3" y="8.8" width="14" height="2.4" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
      <rect x="3" y="13.6" width="14" height="2.4" rx="1" fill={ativo ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconePontos() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <circle cx="10" cy="4" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="10" cy="16" r="1.4" />
    </svg>
  );
}

function Distintivo({ tipo }: { tipo: TemplateBiblioteca["tipo"] }) {
  return (
    <span
      className={[
        "shrink-0 rounded-pa-full px-2 py-0.5 text-caption font-medium",
        tipo === "PADRAO" ? "bg-navy-50 text-navy-700" : "bg-teal-50 text-teal-700",
      ].join(" ")}
    >
      {tipo === "PADRAO" ? "Padrão" : "Personalizado"}
    </span>
  );
}

interface AcaoMenu {
  rotulo: string;
  onClick: () => void;
  tom?: "padrao" | "perigo";
}

function MenuAcoes({ acoes }: { acoes: AcaoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Ações do template"
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="rounded-pa-md p-1.5 text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <IconePontos />
      </button>
      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-pa-md border border-border bg-surface shadow-pa-md"
        >
          {acoes.map((acao) => (
            <button
              key={acao.rotulo}
              role="menuitem"
              onClick={() => {
                setAberto(false);
                acao.onClick();
              }}
              className={[
                "block w-full px-3 py-2 text-left text-body-sm transition-colors hover:bg-slate-50",
                acao.tom === "perigo" ? "text-red-600" : "text-ink",
              ].join(" ")}
            >
              {acao.rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function acoesPara(t: TemplateBiblioteca, aoBaixar: () => void, aoRemover: () => void): AcaoMenu[] {
  const acoes: AcaoMenu[] = [];
  if (t.origem === "UPLOAD" && t.arquivoOriginalUrl) {
    acoes.push({ rotulo: "Baixar arquivo original", onClick: aoBaixar });
  }
  acoes.push({ rotulo: "Remover", onClick: aoRemover, tom: "perigo" });
  return acoes;
}

function CartaoTemplate({ t, aoBaixar, aoRemover }: { t: TemplateBiblioteca; aoBaixar: () => void; aoRemover: () => void }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        {t.origem === "UPLOAD" ? <IconeDocx /> : <IconeEditor />}
        <MenuAcoes acoes={acoesPara(t, aoBaixar, aoRemover)} />
      </div>
      <p className="mt-3 line-clamp-2 text-body font-medium text-ink">{t.nome}</p>
      <div className="mt-2 flex items-center gap-2">
        <Distintivo tipo={t.tipo} />
      </div>
      <div className="mt-auto flex flex-col gap-1 pt-4 text-body-sm text-ink-muted">
        <span>{formatarData(t.createdAt)}</span>
        <span className="truncate">{t.empresa?.razaoSocial ?? "—"}</span>
      </div>
    </Card>
  );
}

function LinhaTemplate({ t, aoBaixar, aoRemover }: { t: TemplateBiblioteca; aoBaixar: () => void; aoRemover: () => void }) {
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      {t.origem === "UPLOAD" ? <IconeDocx className="h-5 w-5 shrink-0 text-navy-600" /> : <IconeEditor className="h-5 w-5 shrink-0 text-teal-600" />}
      <p className="min-w-0 flex-1 truncate text-body font-medium text-ink">{t.nome}</p>
      <Distintivo tipo={t.tipo} />
      <span className="w-24 shrink-0 text-body-sm text-ink-muted">{formatarData(t.createdAt)}</span>
      <span className="w-40 shrink-0 truncate text-body-sm text-ink-muted">{t.empresa?.razaoSocial ?? "—"}</span>
      <MenuAcoes acoes={acoesPara(t, aoBaixar, aoRemover)} />
    </Card>
  );
}

export function BibliotecaTemplates({ templatesIniciais }: { templatesIniciais: TemplateBiblioteca[] }) {
  const router = useRouter();
  const reduzMovimento = useReducedMotion();
  const [templates, setTemplates] = useState(templatesIniciais);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("grid");

  useEffect(() => {
    const salva = sessionStorage.getItem(CHAVE_SESSAO);
    if (salva === "grid" || salva === "lista") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com sessionStorage, só existe no client
      setVisualizacao(salva);
    }
  }, []);

  function trocarVisualizacao(nova: Visualizacao) {
    setVisualizacao(nova);
    sessionStorage.setItem(CHAVE_SESSAO, nova);
  }

  async function enviarTemplatePadrao(arquivo: File, aoProgredir: (percentual: number) => void) {
    const nome = arquivo.name.replace(/\.docx$/i, "");
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("arquivo", arquivo);

    const { template } = await enviarViaXhr("/api/admin/templates-padrao", formData, aoProgredir);
    setTemplates((atual) => [template, ...atual]);
    router.refresh();
  }

  async function baixarArquivo(t: TemplateBiblioteca) {
    if (!t.arquivoOriginalUrl) return;
    const res = await fetch(`/api/admin/templates-padrao/download?caminho=${encodeURIComponent(t.arquivoOriginalUrl)}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  async function removerTemplate(t: TemplateBiblioteca) {
    if (!confirm(`Remover "${t.nome}" da biblioteca?`)) return;
    await fetch(`/api/admin/templates-padrao/${t.id}`, { method: "DELETE" });
    setTemplates((atual) => atual.filter((item) => item.id !== t.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-ink">Biblioteca de templates</h1>
        <p className="mt-1 text-body text-ink-muted">
          Documentos padrão (disponíveis a qualquer empresa) e personalizados (criados no editor do site).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo documento padrão</CardTitle>
          <CardDescription>Envie um arquivo .docx com campos [[variavel]].</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadTemplateDropzone aoEnviar={enviarTemplatePadrao} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-pa-md border border-border">
          <button
            onClick={() => trocarVisualizacao("grid")}
            aria-label="Ver em grade"
            aria-pressed={visualizacao === "grid"}
            className={`p-2 transition-colors ${visualizacao === "grid" ? "bg-navy-600 text-white" : "bg-surface text-ink-muted hover:bg-slate-50"}`}
          >
            <IconeGrade ativo={visualizacao === "grid"} />
          </button>
          <button
            onClick={() => trocarVisualizacao("lista")}
            aria-label="Ver em lista"
            aria-pressed={visualizacao === "lista"}
            className={`p-2 transition-colors ${visualizacao === "lista" ? "bg-navy-600 text-white" : "bg-surface text-ink-muted hover:bg-slate-50"}`}
          >
            <IconeLista ativo={visualizacao === "lista"} />
          </button>
        </div>

        <Button variant="secondary" className="text-body-sm" onClick={() => router.push("/admin/templates-personalizados/novo")}>
          + Criar no editor
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="rounded-pa-lg border border-dashed border-border bg-surface-alt p-8 text-center text-body-sm text-ink-muted">
          Nenhum template ainda. Envie um arquivo .docx acima ou crie um pelo editor.
        </p>
      ) : (
        <div className={visualizacao === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>
          {templates.map((t) => (
            <motion.div key={t.id} layout transition={{ duration: reduzMovimento ? 0 : 0.3, ease: "easeOut" }}>
              {visualizacao === "grid" ? (
                <CartaoTemplate t={t} aoBaixar={() => baixarArquivo(t)} aoRemover={() => removerTemplate(t)} />
              ) : (
                <LinhaTemplate t={t} aoBaixar={() => baixarArquivo(t)} aoRemover={() => removerTemplate(t)} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
