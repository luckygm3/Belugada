"use client";

import { forwardRef, useId, useState } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /**
   * Mensagem de erro do campo — passe direto o resultado de
   * `mensagensPorCampo(resultado.error)[nomeDoCampo]` (ver `@/lib/schemas/comuns`)
   * depois de um `schema.safeParse()`. Quando presente, mostra a borda
   * vermelha e a mensagem inline abaixo do campo.
   */
  error?: string;
}

/**
 * Input padrão do painel admin — label flutuante (sobe e encolhe quando o
 * campo tem foco ou valor). Padrão único do sistema: não misturar com label
 * fixo em outros componentes de formulário.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, value, onFocus, onBlur, id: idProp, ...props },
  ref
) {
  const idGerado = useId();
  const id = idProp ?? idGerado;
  const idErro = `${id}-erro`;

  const [focado, setFocado] = useState(false);
  const temValor = value !== undefined && value !== null && String(value).length > 0;
  const flutuando = focado || temValor;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          id={id}
          value={value}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? idErro : undefined}
          className={[
            "w-full rounded-pa-md border bg-surface px-3.5 pt-5 pb-1.5",
            "text-body text-ink outline-none transition-colors duration-150",
            error
              ? "border-red-500 focus:border-red-600"
              : "border-border focus:border-navy-500",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-3.5 transition-all duration-150 ease-out",
            flutuando ? "top-1.5 text-caption" : "top-1/2 -translate-y-1/2 text-body-lg",
            error ? "text-red-600" : focado ? "text-navy-600" : "text-ink-muted",
          ].join(" ")}
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={idErro} role="alert" className="mt-1 text-caption text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});
