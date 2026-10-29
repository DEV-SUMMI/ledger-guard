import Link from "next/link";
import { LogoIcon } from "@/components/icons";

import { BRAND } from "@/lib/brand";
export function Footer() {
  return (
    <footer className="border-t border-vault-border py-16 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-10">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-vault-accent">
              <LogoIcon size={24} />
            </span>
            <span className="text-lg font-extrabold text-white">
              {BRAND.name}
            </span>
          </div>
          <p className="text-[13px] text-zinc-600 leading-relaxed">
            Private, encrypted storage for seed phrases, private keys and API keys. Every member gets their own vault.
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-vault-textMuted uppercase tracking-wider mb-4">
            Platform
          </h4>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#features">
            Features
          </a>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#how-it-works">
            How It Works
          </a>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#security">
            Security
          </a>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-vault-textMuted uppercase tracking-wider mb-4">
            Legal
          </h4>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#">
            Terms of Service
          </a>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#">
            Privacy Policy
          </a>
          <a className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="#">
            Disclaimer
          </a>
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-vault-textMuted uppercase tracking-wider mb-4">
            Account
          </h4>
          <Link className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="/login">
            Sign In
          </Link>
          <Link className="block text-sm text-zinc-600 hover:text-white py-1 transition" href="/dashboard">
            My Vault
          </Link>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-10 pt-6 border-t border-vault-border flex justify-between flex-wrap gap-3">
        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.legalLine}
        </p>
        <p className="text-xs text-zinc-700">
          Encrypted on your device. We can&apos;t read your data.
        </p>
      </div>
    </footer>
  );
}
