// src/app/layout.tsx

import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/admin/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased bg-gray-100">
        <Toaster position="top-right" />
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}