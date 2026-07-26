import type { Session } from "next-auth";

/**
 * A sessão pode agir em nome de `empresaId`? Dona da empresa (EMPRESA) só na
 * própria; qualquer ADMIN pode, em qualquer empresa — é assim que o admin
 * cadastra funcionário/gera documento em nome de uma empresa-cliente sem
 * precisar de uma segunda conta (ver docs de handoff "Admin operando como
 * empresa"). Mesmo critério já usado em api/documentos/[id]/download, só
 * extraído aqui pra não repetir em cada rota.
 */
export function podeAgirPelaEmpresa(session: Session, empresaId: string): boolean {
  return session.user.papel === "ADMIN" || (session.user.papel === "EMPRESA" && session.user.empresaId === empresaId);
}
