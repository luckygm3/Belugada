import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    papel: string;
    empresaId: string | null;
    nome: string | null;
    avatarUrl: string | null;
    /** Id da SessaoAtiva criada em authorize() — só usado na passagem pro callback jwt, não persiste na Session. */
    sessionId?: string;
  }

  interface Session {
    user: {
      id: string;
      papel: string;
      empresaId: string | null;
      nome: string | null;
      avatarUrl: string | null;
    } & DefaultSession["user"];
    sessionId: string;
    /** Setado pelo callback session quando a sessão foi revogada remotamente (ver src/auth.ts). */
    error?: "SessaoRevogada";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    papel: string;
    empresaId: string | null;
    nome: string | null;
    avatarUrl: string | null;
    sessionId: string;
    /** Epoch ms da última vez que a revogação foi checada contra o banco — ver REVALIDACAO_SESSAO_MS em src/auth.ts. */
    sessaoVerificadaEm: number;
    sessaoRevogada?: boolean;
  }
}
