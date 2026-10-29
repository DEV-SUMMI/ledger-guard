import Link from "next/link";
import { LogoIcon } from "@/components/icons";

import { BRAND } from "@/lib/brand";
export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-vault-bg/80 backdrop-blur-2xl border-b border-vault-border [padding-top:env(safe-area-inset-top)]">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-16 px-6">
        <a className="flex items-center gap-2.5" href="#">
          <span className="text-vault-accent">
            <LogoIcon size={24} />
          </span>
          <span className="text-xl font-extrabold text-white tracking-tight">
            {BRAND.name}
          </span>
        </a>
        <div className="flex items-center gap-1">
          <div className="hidden md:flex gap-0.5">
            <a className="animated-underline text-sm text-zinc-500 hover:text-white px-3.5 py-2 rounded-lg transition-colors" href="#features">
              Features
            </a>
            <a className="animated-underline text-sm text-zinc-500 hover:text-white px-3.5 py-2 rounded-lg transition-colors" href="#how-it-works">
              How It Works
            </a>
            <a className="animated-underline text-sm text-zinc-500 hover:text-white px-3.5 py-2 rounded-lg transition-colors" href="#security">
              Security
            </a>
            <a className="animated-underline text-sm text-zinc-500 hover:text-white px-3.5 py-2 rounded-lg transition-colors" href="#">
              Legal
            </a>
          </div>
          <Link className="ml-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-all hover:scale-[1.03]" href="/login">
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
