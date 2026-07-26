const INICIO_MARCAS_DIACRITICAS = 0x0300;
const FIM_MARCAS_DIACRITICAS = 0x036f;

/** Minúsculo e sem acento — pra busca não depender de o usuário digitar "é" onde tem "e". */
export function normalizarTexto(valor: string): string {
  return Array.from(valor.normalize("NFD"))
    .filter((caractere) => {
      const codigo = caractere.codePointAt(0) ?? 0;
      return codigo < INICIO_MARCAS_DIACRITICAS || codigo > FIM_MARCAS_DIACRITICAS;
    })
    .join("")
    .toLowerCase()
    .trim();
}

export function contemBusca(alvo: string, busca: string): boolean {
  if (!busca.trim()) return true;
  return normalizarTexto(alvo).includes(normalizarTexto(busca));
}
