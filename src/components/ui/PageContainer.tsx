import type { HTMLAttributes } from "react";

/** Wrapper de largura/respiro padrão para o conteúdo de uma página do painel admin. */
export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-5xl px-6 py-8 ${className ?? ""}`} {...props} />;
}
