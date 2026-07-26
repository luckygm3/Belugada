import crypto from "crypto";

const ALGORITMO = "aes-256-gcm";

// Deriva 32 bytes de qualquer string via SHA-256 — aceita AUTH_2FA_SECRET de
// qualquer tamanho como "senha mestra" sem exigir que já venha em hex/base64.
function obterChave(): Buffer {
  const chave = process.env.AUTH_2FA_SECRET;
  if (!chave) throw new Error("AUTH_2FA_SECRET não configurada.");
  return crypto.createHash("sha256").update(chave).digest();
}

/** Criptografa um texto (AES-256-GCM). Formato armazenado: "iv:tag:ciphertext" em hex. */
export function criptografar(texto: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITMO, obterChave(), iv);
  const criptografado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${criptografado.toString("hex")}`;
}

/** Descriptografa um valor gerado por criptografar(). Lança se a chave estiver errada ou o valor corrompido. */
export function descriptografar(valor: string): string {
  const [ivHex, tagHex, dadosHex] = valor.split(":");
  const decipher = crypto.createDecipheriv(ALGORITMO, obterChave(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const texto = Buffer.concat([decipher.update(Buffer.from(dadosHex, "hex")), decipher.final()]);
  return texto.toString("utf8");
}
