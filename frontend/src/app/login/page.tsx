import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { LogoIcon } from "@/components/icons";
import { BRAND } from "@/lib/brand";
import { getCurrentUser } from "@/lib/server-session";

export const metadata: Metadata = {
  title: `Sign in · ${BRAND.name}`,
  description: BRAND.tagline,
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <main className="min-h-screen bg-vault-bg text-vault-text flex">
      {/* Brand panel */}
      <section className="hidden lg:flex lg:w-[46%] relative overflow-hidden border-r border-vault-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[360px] h-[360px] rounded-full [background:radial-gradient(circle,_rgba(34,211,167,0.1)_0%,_transparent_60%)] [animation:float-slow_22s_ease-in-out_infinite]" />
          <div className="absolute bottom-[12%] right-[8%] w-[300px] h-[300px] rounded-full [background:radial-gradient(circle,_rgba(14,165,233,0.08)_0%,_transparent_60%)] [animation:float-reverse_26s_ease-in-out_infinite_2s]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-vault-accent">
              <LogoIcon size={26} />
            </span>
            <span className="text-xl font-extrabold text-white tracking-tight">{BRAND.name}</span>
          </Link>
          <div>
            <h2 className="text-[34px] font-black text-white leading-[1.1] tracking-tight max-w-[420px] mb-5">
              {BRAND.tagline}
            </h2>
            <p className="text-base text-vault-textMuted leading-relaxed max-w-[420px] mb-8">{BRAND.blurb}</p>
            <ul className="flex flex-col gap-3">
              {BRAND.highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="w-5 h-5 rounded-full bg-vault-accent/15 flex items-center justify-center text-vault-accent shrink-0">
                    <Check size={13} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[12px] text-zinc-600">© {new Date().getFullYear()} {BRAND.name}. Self-custodial vault software.</p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <AuthForm />
      </section>
    </main>
  );
}
