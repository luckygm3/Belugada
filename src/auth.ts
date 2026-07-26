import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validarSegundoFator } from "@/lib/doisFatores";
import { registrarLogAcesso } from "@/lib/registrarLogAcesso";

// Throttle da revalidação de sessão contra o banco: JWT continua stateless na
// maior parte das requests, só bate no banco quando esse intervalo expira.
// Revogar uma sessão pode levar até esse tempo pra fazer efeito.
const REVALIDACAO_SESSAO_MS = 5 * 60 * 1000;

// Senha certa mas 2FA ainda não informado — primeiro passo esperado do fluxo
// de login em 2 etapas (ver src/app/login/page.tsx), não uma tentativa falha.
class PrecisaSegundoFatorError extends CredentialsSignin {
  code = "precisa_2fa";
}

// Código TOTP/backup errado — esse sim é registrado como tentativa falha.
class SegundoFatorInvalidoError extends CredentialsSignin {
  code = "codigo_2fa_invalido";
}

function capturarContexto(request: Request) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip"),
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        emailOuLogin: {},
        senha: {},
        codigoTotp: {},
      },
      async authorize(credentials, request) {
        if (!credentials?.emailOuLogin || !credentials?.senha) return null;

        const contexto = capturarContexto(request);

        const usuario = await prisma.usuario.findUnique({
          where: { emailOuLogin: credentials.emailOuLogin as string },
        });

        // E-mail que não existe: não loga (evita ruído de bots e qualquer
        // sinal de enumeração de contas).
        if (!usuario) return null;

        if (!usuario.ativo) {
          await registrarLogAcesso({
            usuarioId: usuario.id,
            sucesso: false,
            motivoFalha: "conta_revogada",
            ...contexto,
          });
          return null;
        }

        const senhaValida = await bcrypt.compare(credentials.senha as string, usuario.senhaHash);
        if (!senhaValida) {
          await registrarLogAcesso({
            usuarioId: usuario.id,
            sucesso: false,
            motivoFalha: "senha_incorreta",
            ...contexto,
          });
          return null;
        }

        if (usuario.totpAtivado) {
          const codigo = credentials.codigoTotp as string | undefined;
          if (!codigo) {
            throw new PrecisaSegundoFatorError();
          }

          const codigoValido = await validarSegundoFator(usuario, codigo);
          if (!codigoValido) {
            await registrarLogAcesso({
              usuarioId: usuario.id,
              sucesso: false,
              motivoFalha: "2fa_invalido",
              ...contexto,
            });
            throw new SegundoFatorInvalidoError();
          }
        }

        const sessao = await prisma.sessaoAtiva.create({
          data: { usuarioId: usuario.id, ...contexto },
        });
        await registrarLogAcesso({ usuarioId: usuario.id, sucesso: true, ...contexto });

        return {
          id: usuario.id,
          email: usuario.emailOuLogin,
          papel: usuario.papel,
          empresaId: usuario.empresaId,
          nome: usuario.nome,
          avatarUrl: usuario.avatarUrl,
          sessionId: sessao.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.papel = user.papel;
        token.empresaId = user.empresaId;
        token.nome = user.nome;
        token.avatarUrl = user.avatarUrl;
        token.sessionId = user.sessionId!;
        token.sessaoVerificadaEm = Date.now();
        return token;
      }

      // Disparado por useSession().update({ nome, avatarUrl }) no client — reflete
      // troca de nome/avatar sem forçar novo login (ver src/components/configuracoes).
      if (trigger === "update" && session) {
        if (typeof session.nome === "string") token.nome = session.nome;
        if (typeof session.avatarUrl === "string") token.avatarUrl = session.avatarUrl;
        return token;
      }

      // Revalidação throttled contra a denylist (SessaoAtiva.revogadaEm) — não
      // bate no banco em toda request, só quando o intervalo acima expira.
      const sessionId = token.sessionId as string | undefined;
      const sessaoVerificadaEm = typeof token.sessaoVerificadaEm === "number" ? token.sessaoVerificadaEm : 0;
      if (sessionId && Date.now() - sessaoVerificadaEm > REVALIDACAO_SESSAO_MS) {
        const sessao = await prisma.sessaoAtiva.findUnique({
          where: { id: sessionId },
          select: { revogadaEm: true },
        });

        if (!sessao || sessao.revogadaEm) {
          token.sessaoRevogada = true;
        } else {
          token.sessaoVerificadaEm = Date.now();
          prisma.sessaoAtiva
            .update({ where: { id: sessionId }, data: { ultimoUso: new Date() } })
            .catch(() => {});
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.papel = token.papel as string;
      session.user.empresaId = token.empresaId as string | null;
      session.user.nome = (token.nome as string | null) ?? null;
      session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
      session.sessionId = token.sessionId as string;
      if (token.sessaoRevogada) session.error = "SessaoRevogada";
      return session;
    },
  },
});
