// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.user?.role === "ADMIN") {
          return { ...data.user, accessToken: data.access_token };
        }
        return null;
      },
    }),
  ],
  callbacks: {
   // ... inside callbacks
async signIn({ user, account }: any) {
  if (account?.provider === "google") {
    try {
      // This is a server-side fetch. 
      // Ensure your Backend check-admin endpoint is publicly reachable 
      // OR secured with a private API KEY header.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/check-admin?email=${user.email}`);
      const data = await res.json();

      if (data.isAdmin && data.accessToken) {
        user.accessToken = data.accessToken;
        user.role = "ADMIN";
        return true;
      }
      return false; 
    } catch (error) {
      return false;
    }
  }
  return true;
},
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };