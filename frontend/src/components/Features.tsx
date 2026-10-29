import { Reveal } from "@/components/Reveal";
import { ArrowRightIcon, KeyIcon, LockIcon } from "@/components/icons";

import { BRAND } from "@/lib/brand";
export function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-[1100px] mx-auto">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4 tracking-tight">
            Why {BRAND.name}?
          </h2>
          <p className="text-base text-vault-textMuted text-center max-w-[500px] mx-auto mb-16">
            Three pillars of privacy. Your data, your key, your eyes only.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Reveal>
            <a className="glow-card block bg-vault-card border border-vault-border rounded-2xl p-8 hover:-translate-y-2 transition-all duration-500 group h-full relative z-0" href="#security">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vault-accent to-emerald-400 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg [box-shadow:0_8px_30px_rgba(34,211,167,0.15)]">
                <KeyIcon size={20} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Encrypted on Your Device
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed mb-4">
                AES-256-GCM with PBKDF2 (600K iterations). Every item is encrypted before it leaves your device — we cannot see it.
              </p>
              <span className="text-sm text-vault-accent font-semibold inline-flex items-center gap-1 group-hover:gap-2.5 transition-all duration-300">
                Learn more{" "}
                <ArrowRightIcon size={20} />
              </span>
            </a>
          </Reveal>
          <Reveal delay={150}>
            <a className="glow-card block bg-vault-card border border-vault-border rounded-2xl p-8 hover:-translate-y-2 transition-all duration-500 group h-full relative z-0" href="#security">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vault-blue to-cyan-400 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg [box-shadow:0_8px_30px_rgba(34,211,167,0.15)]">
                <LockIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                A Private Vault Per Member
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed mb-4">
                Every member signs in with their own credentials and gets a separate dashboard. Nothing is shared between accounts.
              </p>
              <span className="text-sm text-vault-accent font-semibold inline-flex items-center gap-1 group-hover:gap-2.5 transition-all duration-300">
                Learn more{" "}
                <ArrowRightIcon size={20} />
              </span>
            </a>
          </Reveal>
          <Reveal delay={300}>
            <a className="glow-card block bg-vault-card border border-vault-border rounded-2xl p-8 hover:-translate-y-2 transition-all duration-500 group h-full relative z-0" href="#how-it-works">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg [box-shadow:0_8px_30px_rgba(34,211,167,0.15)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Built for Crypto Data
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed mb-4">
                Seed phrases, private keys and API keys — each in its own category.
              </p>
              <span className="text-sm text-vault-accent font-semibold inline-flex items-center gap-1 group-hover:gap-2.5 transition-all duration-300">
                Learn more{" "}
                <ArrowRightIcon size={20} />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
