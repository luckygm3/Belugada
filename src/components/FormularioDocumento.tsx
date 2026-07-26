"use client";

import type { VariavelDisponivel } from "@/lib/variaveis-disponiveis";
import { Input } from "./ui/Input";

export type ValoresDocumento = Record<string, unknown>;

interface LinhaTrajeto {
  linha: string;
  valor_passagem: string;
  quantidade: string;
}
const LINHA_TRAJETO_VAZIA: LinhaTrajeto = { linha: "", valor_passagem: "", quantidade: "" };

interface PeriodoFerias {
  data_inicio: string;
  data_fim: string;
}
const PERIODO_FERIAS_VAZIO: PeriodoFerias = { data_inicio: "", data_fim: "" };

function diasCorridosPreview(inicio: string, fim: string): number | null {
  if (!inicio || !fim) return null;
  const d1 = new Date(`${inicio}T00:00:00Z`);
  const d2 = new Date(`${fim}T00:00:00Z`);
  const dias = Math.round((d2.getTime() - d1.getTime()) / 86_400_000) + 1;
  return dias > 0 ? dias : null;
}

function campoSelectClasses(erro?: string) {
  return [
    "w-full rounded-pa-md border bg-surface px-3 py-2 text-body-sm text-ink outline-none transition-colors duration-150",
    erro ? "border-red-500" : "border-border focus:border-navy-500",
  ].join(" ");
}

function CampoTextoLongo({
  variavel,
  valor,
  onChange,
  erro,
}: {
  variavel: VariavelDisponivel;
  valor: string;
  onChange: (v: string) => void;
  erro?: string;
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-label text-ink-muted">
        {variavel.label}
        {variavel.obrigatoria ? " *" : ""}
      </label>
      <textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={campoSelectClasses(erro)}
      />
      {erro && <p className="mt-1 text-caption text-red-600">{erro}</p>}
    </div>
  );
}

function CampoSelecao({
  variavel,
  valor,
  onChange,
  erro,
}: {
  variavel: VariavelDisponivel;
  valor: string;
  onChange: (v: string) => void;
  erro?: string;
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-label text-ink-muted">
        {variavel.label}
        {variavel.obrigatoria ? " *" : ""}
      </label>
      <select value={valor} onChange={(e) => onChange(e.target.value)} className={campoSelectClasses(erro)}>
        <option value="">Selecione...</option>
        {(variavel.opcoes ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {erro && <p className="mt-1 text-caption text-red-600">{erro}</p>}
    </div>
  );
}

function CampoBooleano({
  variavel,
  valor,
  onChange,
}: {
  variavel: VariavelDisponivel;
  valor: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-body-sm text-ink">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} className="accent-navy-600" />
      {variavel.label}
    </label>
  );
}

function ListaTrajetoLinhas({ valor, onChange }: { valor: LinhaTrajeto[]; onChange: (v: LinhaTrajeto[]) => void }) {
  const linhas = valor.length > 0 ? valor : [LINHA_TRAJETO_VAZIA];

  function atualizar(i: number, campo: keyof LinhaTrajeto, v: string) {
    onChange(linhas.map((l, idx) => (idx === i ? { ...l, [campo]: v } : l)));
  }
  function adicionar() {
    onChange([...linhas, { ...LINHA_TRAJETO_VAZIA }]);
  }
  function remover(i: number) {
    onChange(linhas.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <p className="text-label text-ink-muted">Linhas utilizadas</p>
      {linhas.map((l, i) => (
        <div key={i} className="flex items-end gap-2">
          <Input label="Linha" value={l.linha} onChange={(e) => atualizar(i, "linha", e.target.value)} />
          <Input
            label="Valor da passagem"
            type="number"
            step="0.01"
            value={l.valor_passagem}
            onChange={(e) => atualizar(i, "valor_passagem", e.target.value)}
          />
          <Input label="Qtd. por dia" type="number" value={l.quantidade} onChange={(e) => atualizar(i, "quantidade", e.target.value)} />
          {linhas.length > 1 && (
            <button type="button" onClick={() => remover(i)} className="mb-2 shrink-0 text-caption text-red-600 hover:underline">
              Remover
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={adicionar} className="text-body-sm font-medium text-navy-600 hover:underline dark:text-navy-300">
        + Adicionar linha
      </button>
    </div>
  );
}

function ListaFeriasPeriodos({ valor, onChange }: { valor: PeriodoFerias[]; onChange: (v: PeriodoFerias[]) => void }) {
  const periodos = valor.length > 0 ? valor : [PERIODO_FERIAS_VAZIO];

  function atualizar(i: number, campo: keyof PeriodoFerias, v: string) {
    onChange(periodos.map((p, idx) => (idx === i ? { ...p, [campo]: v } : p)));
  }
  function adicionar() {
    if (periodos.length < 3) onChange([...periodos, { ...PERIODO_FERIAS_VAZIO }]);
  }
  function remover(i: number) {
    onChange(periodos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <p className="text-label text-ink-muted">Períodos fracionados (máx. 3 — um com 14+ dias, os demais com 5+)</p>
      {periodos.map((p, i) => {
        const dias = diasCorridosPreview(p.data_inicio, p.data_fim);
        return (
          <div key={i} className="flex items-end gap-2">
            <Input label="Início" type="date" value={p.data_inicio} onChange={(e) => atualizar(i, "data_inicio", e.target.value)} />
            <Input label="Término" type="date" value={p.data_fim} onChange={(e) => atualizar(i, "data_fim", e.target.value)} />
            <span className="mb-2 shrink-0 text-caption text-ink-muted">{dias !== null ? `${dias} dia(s)` : ""}</span>
            {periodos.length > 1 && (
              <button type="button" onClick={() => remover(i)} className="mb-2 shrink-0 text-caption text-red-600 hover:underline">
                Remover
              </button>
            )}
          </div>
        );
      })}
      {periodos.length < 3 && (
        <button type="button" onClick={adicionar} className="text-body-sm font-medium text-navy-600 hover:underline dark:text-navy-300">
          + Adicionar período
        </button>
      )}
    </div>
  );
}

interface FormularioDocumentoProps {
  campos: VariavelDisponivel[];
  valores: ValoresDocumento;
  onChange: (valores: ValoresDocumento) => void;
  erros?: Record<string, string>;
}

/** Formulário dinâmico dos campos de escopo "documento" de um template, gerado a partir do catálogo. */
export function FormularioDocumento({ campos, valores, onChange, erros }: FormularioDocumentoProps) {
  function set(key: string, v: unknown) {
    onChange({ ...valores, [key]: v });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {campos.map((variavel) => {
        const erro = erros?.[variavel.key];

        if (variavel.key === "trajeto_linhas") {
          return (
            <div key={variavel.key} className="sm:col-span-2">
              <ListaTrajetoLinhas valor={(valores.trajeto_linhas as LinhaTrajeto[]) ?? []} onChange={(v) => set("trajeto_linhas", v)} />
            </div>
          );
        }
        if (variavel.key === "ferias_periodos") {
          return (
            <div key={variavel.key} className="sm:col-span-2">
              <ListaFeriasPeriodos valor={(valores.ferias_periodos as PeriodoFerias[]) ?? []} onChange={(v) => set("ferias_periodos", v)} />
            </div>
          );
        }
        if (variavel.tipo === "texto_longo") {
          return (
            <div key={variavel.key} className="sm:col-span-2">
              <CampoTextoLongo variavel={variavel} valor={(valores[variavel.key] as string) ?? ""} onChange={(v) => set(variavel.key, v)} erro={erro} />
            </div>
          );
        }
        if (variavel.tipo === "booleano") {
          return (
            <div key={variavel.key} className="sm:col-span-2">
              <CampoBooleano variavel={variavel} valor={(valores[variavel.key] as boolean) ?? false} onChange={(v) => set(variavel.key, v)} />
            </div>
          );
        }
        if (variavel.tipo === "selecao") {
          return (
            <CampoSelecao
              key={variavel.key}
              variavel={variavel}
              valor={(valores[variavel.key] as string) ?? ""}
              onChange={(v) => set(variavel.key, v)}
              erro={erro}
            />
          );
        }

        const tipoInput =
          variavel.tipo === "data"
            ? "date"
            : variavel.tipo === "hora"
              ? "time"
              : variavel.tipo === "numero" || variavel.tipo === "moeda" || variavel.tipo === "percentual"
                ? "number"
                : "text";

        return (
          <Input
            key={variavel.key}
            label={variavel.label + (variavel.obrigatoria ? " *" : "")}
            type={tipoInput}
            step={variavel.tipo === "moeda" || variavel.tipo === "percentual" ? "0.01" : undefined}
            value={(valores[variavel.key] as string) ?? ""}
            onChange={(e) => set(variavel.key, e.target.value)}
            error={erro}
          />
        );
      })}
    </div>
  );
}
