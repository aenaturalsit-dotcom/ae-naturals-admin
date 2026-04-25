"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
const exitUrl =
    process.env.NEXT_PUBLIC_EXIT_URL || "http://localhost:3000";


    return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">
      
      {/* Glow Background */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-green-500 opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

        {/* Logo */}
        <Image
          src="/vercel.svg"
          alt="logo"
          width={80}
          height={80}
          className="opacity-80"
        />

        {/* Headline */}
        <h1 className="text-center text-4xl font-bold leading-tight tracking-tight">
          🚫 Restricted Zone
        </h1>

        <p className="text-center text-lg text-zinc-300">
          This is an <span className="text-green-400 font-semibold">Admin Panel</span>.  
          If you don’t belong here… you probably shouldn’t be here 👀
        </p>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          
          {/* Admin Login */}
          <button
            onClick={() => router.push("/admin/login")}
            className="flex-1 rounded-full bg-green-500 px-6 py-3 font-semibold text-black transition-all hover:scale-105 hover:bg-green-400"
          >
            🔐 I'm Admin → Login
          </button>

          {/* Exit */}
          <button
           onClick={() => (window.location.href = exitUrl)}
            className="flex-1 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
          >
            🚪 Get Me Out
          </button>
        </div>

        {/* Warning Footer */}
        <p className="text-xs text-zinc-500 text-center">
          Unauthorized access? Nah… not today.
        </p>
      </main>
    </div>
  );
}