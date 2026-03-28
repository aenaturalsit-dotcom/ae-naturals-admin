// src/app/admin/login/page.tsx
'use client';

import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-6">AE Naturals Admin</h2>
        
        <button
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 py-3 text-sm font-medium hover:bg-zinc-50 transition"
        >
          {/* Use a Google Icon SVG here */}
          <Mail className="h-5 w-5 text-red-500" />
          Continue with Google
        </button>
        
        <p className="mt-4 text-xs text-zinc-400">
          Only registered administrator emails are permitted.
        </p>
      </div>
    </div>
  );
}