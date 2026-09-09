import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials sign-in can't use database sessions (the adapter has no
  // way to persist a session for a provider it doesn't manage), so the
  // whole app runs on encrypted JWT cookies instead. Google sign-in still
  // gets its User/Account rows created by the adapter on first login —
  // only the *session* itself is JWT-based, not the account data.
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // No account, or an OAuth-only account with no password set.
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    // Runs on sign-in and on every request that reads the session. `user`
    // is only present right after sign-in, so that's the one moment we
    // copy id/role onto the token — after that the token carries them.
    async jwt({ token, user }) {
      if (user) {
        // Auth.js's base User type marks `id` optional (a raw OAuth
        // profile might not have one yet), but both our Credentials
        // authorize() and the Prisma adapter always hand back a real
        // user row here, so a non-null assertion is safe.
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    // Runs whenever app code calls auth() or useSession() — copies the
    // token's custom fields onto the session object that code actually reads.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
