// src/app/layout.tsx

import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/admin/providers/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Metadata } from "next";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
export const metadata: Metadata = {
  title: "AE Naturals | Nature’s Finest Products",
description: "Premium natural products crafted for wellness, skincare, haircare, and everyday healthy living.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
};
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