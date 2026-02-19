import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { adminUsers } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in if the user is in the admin_users table
      if (!user.email) return false;
      const adminUser = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.email, user.email),
      });
      return adminUser !== undefined;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const adminUser = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, user.email),
        });
        if (adminUser) {
          token.role = adminUser.role;
          token.adminId = adminUser.id;
          // Update last login
          await db
            .update(adminUsers)
            .set({ lastLoginAt: new Date() })
            .where(eq(adminUsers.id, adminUser.id));
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.adminId) {
        session.user.adminId = token.adminId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
});

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      adminId?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
