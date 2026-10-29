import { Reveal } from "@/components/Reveal";
import { ArrowRightIcon } from "@/components/icons";

export function HowItWorks() {
  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">
            How It Works
          </h2>
          <p className="text-base text-vault-textMuted text-center max-w-[500px] mx-auto mb-16">
            From sign-in to your first encrypted entry in under 3 minutes.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          <div className="hidden sm:block absolute top-[60px] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-vault-accent/30 via-vault-blue/30 to-violet-500/30" />
          <Reveal>
            <div className="text-center group">
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-vault-accent to-emerald-400 flex items-center justify-center mx-auto mb-6 text-white text-xl font-black font-mono shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Sign In{" "}
                &amp;
                {" "}Encrypt
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed">
                Sign in with Google or email. Everything is AES-256 encrypted on your device before it leaves.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="text-center group">
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-vault-blue to-cyan-400 flex items-center justify-center mx-auto mb-6 text-white text-xl font-black font-mono shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Store What Matters
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed">
                Seed phrases, private keys and API keys, organized by category.
              </p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="text-center group">
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center mx-auto mb-6 text-white text-xl font-black font-mono shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Private to Each Member
              </h3>
              <p className="text-sm text-vault-textMuted leading-relaxed">
                Every teammate gets their own login and dashboard. What you store is never visible to anyone else.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal delay={400}>
          <div className="text-center mt-14">
            <a className="text-vault-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all text-sm group" href="#how-it-works">
              See full step-by-step guide{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                <ArrowRightIcon size={20} />
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
