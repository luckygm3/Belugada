"use client";

import { useTema } from "./PainelAdminShell";

function IconeSol() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M17 11.4A7 7 0 018.6 3a7 7 0 108.4 8.4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { tema, alternar } = useTema();

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={tema === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-pa-md text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
    >
      {tema === "dark" ? <IconeSol /> : <IconeLua />}
    </button>
  );
}
