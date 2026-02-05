import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Extend the built-in types to include 'role'
declare module "next-auth" {
  interface User {
    role?: string;
    isBanned?: boolean;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;      // <--- Added
      isBanned?: boolean; // <--- Added
    }
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z.object({ username: z.string(), password: z.string() }).safeParse(credentials);
        if (parsed.success) {
          const user = await prisma.user.findUnique({ 
            where: { username: parsed.data.username.toLowerCase() } 
          });
          
          if (!user || !user.password) return null;
          
          // CHECK BAN STATUS
          if (user.isBanned) {
            throw new Error("This account has been banned.");
          }

          const match = await bcrypt.compare(parsed.data.password, user.password);
          if (match) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // 1. Add role to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    // 2. Pass role from Token to Session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // Fetch fresh data to get role updates instantly (e.g. if promoted while logged in)
        const freshUser = await prisma.user.findUnique({ where: { id: token.sub } });
        
        if (freshUser) {
           session.user.name = freshUser.username;
           session.user.image = freshUser.image;
           session.user.role = freshUser.role; // <--- Crucial
           session.user.isBanned = freshUser.isBanned;
        }
      }
      return session;
    },
  },
});

