/** Descrição curta do dispositivo a partir do user-agent — usado em Sessões ativas e Log de acesso. */
export function descreverDispositivo(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo desconhecido";
  if (/Mobi|Android/i.test(userAgent)) return "Dispositivo móvel";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Navegador desktop";
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
