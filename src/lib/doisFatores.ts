import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { Usuario } from "@prisma/client";

const EMISSOR = "PACTA";
const QUANTIDADE_CODIGOS_BACKUP = 8;

export function gerarSegredo(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

/** Monta a URI otpauth:// que vira o QR code no app autenticador. */
export function gerarUri(segredoBase32: string, conta: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: EMISSOR,
    label: conta,
    secret: OTPAuth.Secret.fromBase32(segredoBase32),
  });
  return totp.toString();
}

/** Janela de ±30s (window: 1) pra tolerar pequena diferença de relógio entre servidor e celular. */
export function validarCodigoTotp(segredoBase32: string, codigo: string): boolean {
  const totp = new OTPAuth.TOTP({ issuer: EMISSOR, secret: OTPAuth.Secret.fromBase32(segredoBase32) });
  return totp.validate({ token: codigo.trim(), window: 1 }) !== null;
}

/** Códigos de backup em texto puro (mostrados uma única vez) — quem chama decide como hashear/persistir. */
export function gerarCodigosBackup(): string[] {
  return Array.from({ length: QUANTIDADE_CODIGOS_BACKUP }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase()
  );
}

/**
 * Valida o segundo fator no login: tenta TOTP primeiro, depois cada código de
 * backup restante. Se um backup for usado, consome (remove) esse hash do
 * array e persiste — cada código de backup só funciona uma vez.
 */
export async function validarSegundoFator(usuario: Usuario, codigo: string): Promise<boolean> {
  if (!usuario.totpSecretCriptografado) return false;

  const { descriptografar } = await import("@/lib/criptografia");
  const segredo = descriptografar(usuario.totpSecretCriptografado);

  if (validarCodigoTotp(segredo, codigo)) return true;

  const codigoNormalizado = codigo.trim().toUpperCase();
  for (const hash of usuario.totpCodigosBackup) {
    if (await bcrypt.compare(codigoNormalizado, hash)) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { totpCodigosBackup: usuario.totpCodigosBackup.filter((h) => h !== hash) },
      });
      return true;
    }
  }

  return false;
}
