import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      credentials: {
        username: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.picture = user.image;
        }

        return token;
      },

      async session({ session, token }) {
        if (session.user && token.id) {
          const dbUser = await prisma.user.findUnique({
            where: {
              id: token.id as string,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.name ?? dbUser.username ?? "";
            session.user.email = dbUser.email ?? "";
            session.user.image = dbUser.image ?? "";
          }
        }

        return session;
      },
    },
});