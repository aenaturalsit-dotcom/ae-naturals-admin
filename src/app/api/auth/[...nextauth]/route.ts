// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers"; // 1. Import cookies





// 1. Grab the days from the env variable (default to 7)
const MAX_AGE_DAYS = parseInt(process.env.REFRESH_TOKEN_MAX_AGE_DAYS || "7", 10);
// 2. Convert those days into seconds
const COOKIE_MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60;


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
        
        // 2. Extract and forward the Set-Cookie header to the browser
        const setCookieHeader = res.headers.get("set-cookie");
        
        if (setCookieHeader) {
          // Adjust the regex if your backend names the cookie differently
          const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
          
          if (refreshTokenMatch) {
            const cookieStore = await cookies();
            cookieStore.set({
              name: "refresh_token",
              value: refreshTokenMatch[1],
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              path: "/",
              maxAge: COOKIE_MAX_AGE_SECONDS, // Match this with your backend's refresh token lifespan
            });
          }
        }

        const data = await res.json();
        if (res.ok && data.user?.role === "STORE_MANAGER") {
          return { ...data.user, accessToken: data.access_token };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/check-admin?email=${user.email}`);
          
          // 🔥 Apply the identical Cookie forwarding logic here if your 
          // backend also issues a refresh_token during Google Auth!
          const setCookieHeader = res.headers.get("set-cookie");
          if (setCookieHeader) {
             const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
             if (refreshTokenMatch) {
               const cookieStore = await cookies();
               cookieStore.set({
                 name: "refresh_token",
                 value: refreshTokenMatch[1],
                 httpOnly: true,
                 secure: process.env.NODE_ENV === "production",
                 path: "/",
                 maxAge: COOKIE_MAX_AGE_SECONDS,
               });
             }
          }

          const data = await res.json();
          if (data.isStoreManager && data.accessToken) {
            user.accessToken = data.accessToken;
            user.role = "STORE_MANAGER";
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