import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        emailOuLogin: {},
        senha: {},
      },
      async authorize(credentials) {
        if (!credentials?.emailOuLogin || !credentials?.senha) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { emailOuLogin: credentials.emailOuLogin as string },
        });

        if (!usuario) return null;

        const senhaValida = await bcrypt.compare(
          credentials.senha as string,
          usuario.senhaHash
        );

        if (!senhaValida) return null;

        return {
          id: usuario.id,
          email: usuario.emailOuLogin,
          papel: usuario.papel,
          empresaId: usuario.empresaId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.papel = user.papel;
        token.empresaId = user.empresaId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.papel = token.papel as string;
      session.user.empresaId = token.empresaId as string | null;
      return session;
    },
  },
});