// src/app/layout.tsx
import { getServerSession } from "next-auth";

import { Sidebar } from "@/components/admin/Sidebar";
import LoginPage from "./admin/login/page";
import "./globals.css";
import AuthProvider from "@/components/admin/providers/AuthProvider";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Toaster } from 'react-hot-toast';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // Requirement: User must have the ADMIN role defined in your schema
  const isAuthenticated = session?.user && (session.user as any).role === "ADMIN";

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased bg-zinc-50">
        <Toaster position="top-right" reverseOrder={false} />
        <AuthProvider session={session}>
          {isAuthenticated ? (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          ) : (
            // If not an admin, only show the login page regardless of the path
            <LoginPage />
          )}
        </AuthProvider>
      </body>
    </html>
  );
}