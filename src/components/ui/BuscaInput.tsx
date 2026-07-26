"use client";

function IconeLupa() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

export interface BuscaInputProps {
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

/** Campo de busca local — ícone de lupa fixo, botão de limpar quando há texto. Sem debounce: filtra em memória, não faz round-trip. */
export function BuscaInput({ value, onChange, placeholder, className, ...aria }: BuscaInputProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
        <IconeLupa />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar..."}
        {...aria}
        className="w-full rounded-pa-md border border-border bg-surface py-2 pl-9 pr-9 text-body-sm text-ink placeholder:text-ink-muted"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
        >
          <IconeX />
        </button>
      )}
    </div>
  );
}
