import type { Formatador } from "./variaveis-disponiveis";

/**
 * Formatadores aplicados sempre na geração de documentos — o dado no banco
 * (ou digitado no formulário de emissão) fica cru: number, Date, string sem
 * máscara. Nada aqui depende de o valor já vir formatado.
 */

const UNIDADES = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const UNIDADES_F = ["zero", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
const ESCALAS = ["", "mil", "milhão", "bilhão"];
const ESCALAS_PLURAL = ["", "mil", "milhões", "bilhões"];

function dezenaPorExtenso(n: number, genero: "m" | "f"): string {
  if (n < 10) return (genero === "f" ? UNIDADES_F : UNIDADES)[n];
  if (n < 20) return DEZ_A_DEZENOVE[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DEZENAS[d];
  return `${DEZENAS[d]} e ${(genero === "f" ? UNIDADES_F : UNIDADES)[u]}`;
}

function grupoPorExtenso(n: number, genero: "m" | "f"): string {
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) partes.push(dezenaPorExtenso(resto, genero));
  return partes.join(" e ");
}

/** Converte um inteiro não-negativo em português por extenso. genero afeta "um/uma", "dois/duas" em todos os grupos. */
export function numeroPorExtenso(valor: number, genero: "m" | "f" = "m"): string {
  const n = Math.trunc(Math.abs(valor));
  if (n === 0) return "zero";
  if (n > 999_999_999_999) return String(n);

  const grupos: number[] = [];
  let resto = n;
  while (resto > 0) {
    grupos.unshift(resto % 1000);
    resto = Math.floor(resto / 1000);
  }

  const totalGrupos = grupos.length;
  const partes: { texto: string; valorGrupo: number }[] = [];

  grupos.forEach((valorGrupo, i) => {
    if (valorGrupo === 0) return;
    const escalaIndex = totalGrupos - 1 - i;
    let texto = grupoPorExtenso(valorGrupo, genero);
    if (escalaIndex > 0) {
      const escala = valorGrupo === 1 ? ESCALAS[escalaIndex] : ESCALAS_PLURAL[escalaIndex];
      texto = valorGrupo === 1 && escalaIndex === 1 ? "mil" : `${texto} ${escala}`;
    }
    partes.push({ texto, valorGrupo });
  });

  if (partes.length === 1) return partes[0].texto;

  const ultimo = partes[partes.length - 1];
  const usaE = ultimo.valorGrupo < 100 || ultimo.valorGrupo % 100 === 0;
  const inicio = partes
    .slice(0, -1)
    .map((p) => p.texto)
    .join(", ");
  return usaE ? `${inicio} e ${ultimo.texto}` : `${inicio}, ${ultimo.texto}`;
}

/** "02 (duas)" */
export function formatarNumeroExtenso(valor: number, genero: "m" | "f" = "m"): string {
  return `${String(Math.trunc(valor)).padStart(2, "0")} (${numeroPorExtenso(valor, genero)})`;
}

/** "6% (seis por cento)" */
export function formatarPercentualExtenso(valor: number): string {
  return `${valor}% (${numeroPorExtenso(valor)} por cento)`;
}

/** "R$ 1.500,00" */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

/** "de" é obrigatório entre milhão/bilhão e o substantivo quando nada menor os segue ("um milhão de reais", não "um milhão reais"). */
function precisaDeAntesDoSubstantivo(n: number): boolean {
  return n >= 1_000_000 && n % 1_000_000 === 0;
}

/** "R$ 1.500,00 (mil e quinhentos reais)" */
export function formatarMoedaExtenso(valor: number): string {
  const absoluto = Math.abs(valor);
  const reais = Math.floor(absoluto);
  const centavos = Math.round((absoluto - reais) * 100);

  const partesExtenso: string[] = [];
  if (reais > 0 || centavos === 0) {
    const conector = precisaDeAntesDoSubstantivo(reais) ? "de " : "";
    partesExtenso.push(`${numeroPorExtenso(reais)} ${conector}${reais === 1 ? "real" : "reais"}`);
  }
  if (centavos > 0) {
    partesExtenso.push(`${numeroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);
  }

  const sinal = valor < 0 ? "menos " : "";
  return `${formatarMoeda(valor)} (${sinal}${partesExtenso.join(" e ")})`;
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "25 de julho de 2026" — usa UTC, mesmo critério do resto do projeto pra datas sem hora. */
export function formatarDataExtenso(data: Date): string {
  return `${data.getUTCDate()} de ${MESES[data.getUTCMonth()]} de ${data.getUTCFullYear()}`;
}

/** "25/07/2026" */
export function formatarDataCurta(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(data);
}

/** "08:30" — aceita Date (hora local, sem noção de fuso) ou string "HH:mm" já pronta. */
export function formatarHora(valor: Date | string): string {
  if (typeof valor === "string") {
    const match = valor.match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : valor;
  }
  return `${String(valor.getHours()).padStart(2, "0")}:${String(valor.getMinutes()).padStart(2, "0")}`;
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** "000.000.000-00" */
export function formatarCpf(valor: string): string {
  const d = somenteDigitos(valor).padStart(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** "00.000.000/0000-00" */
export function formatarCnpj(valor: string): string {
  const d = somenteDigitos(valor).padStart(14, "0");
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** "00000-000" */
export function formatarCep(valor: string): string {
  const d = somenteDigitos(valor).padStart(8, "0");
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

/** "(00) 00000-0000" ou "(00) 0000-0000" conforme a quantidade de dígitos. */
export function formatarTelefone(valor: string): string {
  const d = somenteDigitos(valor);
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** "ABC-1234" (padrão antigo) ou "ABC1D23" (Mercosul, sem separador). */
export function formatarPlaca(valor: string): string {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (/^[A-Z]{3}\d{4}$/.test(limpo)) return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
  return limpo;
}

const PRESERVAR_MAIUSCULA = new Set(["LTDA", "LTDA.", "ME", "EPP", "EIRELI", "S.A.", "SA", "S/A", "MEI"]);
const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e"]);

/** "BELUGADA SERVICOS LTDA" -> "Beluga Serviços Ltda" — preserva siglas societárias e minúsculas em conectivos. */
export function formatarTitulo(valor: string): string {
  return valor
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palavra, i) => {
      const maiuscula = palavra.toUpperCase();
      if (PRESERVAR_MAIUSCULA.has(maiuscula)) return maiuscula;
      if (i > 0 && MINUSCULAS.has(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

/**
 * Aplica o formatador de um catálogo de variável a um valor cru. `genero`
 * vem do catálogo (só usado por numeroExtenso). Datas devem chegar como
 * `Date`; números como `number`; o resto como `string`.
 */
export function aplicarFormatador(formatador: Formatador, valor: unknown, genero: "m" | "f" = "m"): string {
  switch (formatador) {
    case "dataExtenso":
      return valor instanceof Date ? formatarDataExtenso(valor) : String(valor ?? "");
    case "dataCurta":
      return valor instanceof Date ? formatarDataCurta(valor) : String(valor ?? "");
    case "hora":
      return valor instanceof Date || typeof valor === "string" ? formatarHora(valor) : String(valor ?? "");
    case "moeda":
      return typeof valor === "number" ? formatarMoeda(valor) : String(valor ?? "");
    case "moedaExtenso":
      return typeof valor === "number" ? formatarMoedaExtenso(valor) : String(valor ?? "");
    case "numeroExtenso":
      return typeof valor === "number" ? formatarNumeroExtenso(valor, genero) : String(valor ?? "");
    case "percentualExtenso":
      return typeof valor === "number" ? formatarPercentualExtenso(valor) : String(valor ?? "");
    case "cpf":
      return typeof valor === "string" ? formatarCpf(valor) : String(valor ?? "");
    case "cnpj":
      return typeof valor === "string" ? formatarCnpj(valor) : String(valor ?? "");
    case "cep":
      return typeof valor === "string" ? formatarCep(valor) : String(valor ?? "");
    case "telefone":
      return typeof valor === "string" ? formatarTelefone(valor) : String(valor ?? "");
    case "placa":
      return typeof valor === "string" ? formatarPlaca(valor) : String(valor ?? "");
    case "titulo":
      return typeof valor === "string" ? formatarTitulo(valor) : String(valor ?? "");
    default:
      return String(valor ?? "");
  }
}
