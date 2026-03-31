import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

declare module "next-auth" {
  interface User {
    role?: string;
    nickname?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      nickname: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    nickname: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) return null;
          if (!user.emailVerified) return null;

          const isValid = await compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            nickname: user.nickname,
          };
        } catch (error) {
          console.error("Auth error - database unavailable:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role || "USER";
        token.nickname = user.nickname || "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.nickname = token.nickname;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
