export const TEMA_COOKIE = "pacta-tema";
export type Tema = "light" | "dark";

export function temaValido(valor: string | undefined): Tema {
  return valor === "dark" ? "dark" : "light";
}
