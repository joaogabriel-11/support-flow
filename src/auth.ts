import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "@/features/auth/authenticate-user";
import { prismaAuthDependencies } from "@/features/auth/prisma-auth-dependencies";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        return authenticateUser(
          {
            email: typeof credentials.email === "string" ? credentials.email : "",
            password:
              typeof credentials.password === "string" ? credentials.password : "",
          },
          prismaAuthDependencies,
        );
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as typeof session.user.role;
      session.user.isActive = token.isActive as boolean;
      return session;
    },
  },
});
