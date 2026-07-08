import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    papel: string;
    empresaId: string | null;
  }

  interface Session {
    user: {
      papel: string;
      empresaId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    papel: string;
    empresaId: string | null;
  }
}