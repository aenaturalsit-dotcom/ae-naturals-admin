// src/app/admin/login/page.tsx
'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/admin" });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 px-4 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] bg-green-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] bg-blue-300/30 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-zinc-200 dark:border-zinc-800"
      >

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-700 dark:text-zinc-200" />
            <p className="text-sm mt-3 text-zinc-600 dark:text-zinc-300">
              Redirecting to Google...
            </p>
          </div>
        )}

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            AE
          </div>

          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white tracking-tight">
            AE Naturals
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Admin Dashboard Access
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="group flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {/* Google SVG */}
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.04 1.53 7.42 2.82l5.48-5.48C33.36 3.53 29.06 2 24 2 14.82 2 6.88 7.98 3.24 16.44l6.38 4.96C11.38 14.24 17.17 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.7H24v9h12.7c-.55 2.96-2.2 5.47-4.7 7.16l7.2 5.6C43.9 37.6 46.5 31.6 46.5 24.5z"/>
            <path fill="#FBBC05" d="M9.62 28.4a14.5 14.5 0 010-8.8l-6.38-4.96A22.97 22.97 0 002 24c0 3.63.87 7.06 2.42 10.04l6.38-4.96z"/>
            <path fill="#34A853" d="M24 46c6.48 0 11.92-2.14 15.9-5.82l-7.2-5.6c-2 1.34-4.55 2.12-8.7 2.12-6.83 0-12.62-4.74-14.38-11.1l-6.38 4.96C6.88 40.02 14.82 46 24 46z"/>
          </svg>

          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400">Secure Access</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Info */}
        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Only authorized administrator emails are allowed.
          <br />
          Unauthorized access is strictly prohibited.
        </p>

        {/* Footer */}
        <p className="mt-6 text-[10px] text-center text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} AE Naturals. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}