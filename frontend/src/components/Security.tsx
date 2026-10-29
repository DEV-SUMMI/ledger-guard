import { Reveal } from "@/components/Reveal";
import { ArrowRightIcon } from "@/components/icons";

export function Security() {
  return (
    <section id="security" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.02] [animation:spin-slow_90s_linear_infinite]">
        <svg viewBox="0 0 800 800" fill="none" stroke="rgba(34,211,167,0.5)" strokeWidth="5">
          <polygon points="400,50 700,225 700,575 400,750 100,575 100,225" />
          <polygon points="400,120 630,265 630,535 400,680 170,535 170,265" />
          <polygon points="400,190 560,305 560,495 400,610 240,495 240,305" />
        </svg>
      </div>
      <div className="max-w-[800px] mx-auto relative z-10">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">
            Security You Can Verify
          </h2>
          <p className="text-base text-vault-textMuted text-center max-w-[500px] mx-auto mb-14">
            Four layers of protection. Zero trust required.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
          <div className="bg-vault-card/50 border border-vault-border rounded-xl p-5 flex gap-4 items-start hover:border-vault-borderAccent hover:bg-vault-card transition-all duration-300">
            <span className="text-2xl mt-0.5">
              🔐
            </span>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                AES-256-GCM Encryption
              </h3>
              <p className="text-[13px] text-vault-textMuted leading-relaxed">
                Every item encrypted at rest with your password via Web Crypto API
              </p>
            </div>
          </div>
          <div className="bg-vault-card/50 border border-vault-border rounded-xl p-5 flex gap-4 items-start hover:border-vault-borderAccent hover:bg-vault-card transition-all duration-300">
            <span className="text-2xl mt-0.5">
              👤
            </span>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Per-User Isolation
              </h3>
              <p className="text-[13px] text-vault-textMuted leading-relaxed">
                Every member has their own credentials and isolated storage — no shared access between accounts
              </p>
            </div>
          </div>
          <div className="bg-vault-card/50 border border-vault-border rounded-xl p-5 flex gap-4 items-start hover:border-vault-borderAccent hover:bg-vault-card transition-all duration-300">
            <span className="text-2xl mt-0.5">
              ⏱️
            </span>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                Masked Values &amp; Auto-Lock
              </h3>
              <p className="text-[13px] text-vault-textMuted leading-relaxed">
                Secrets stay hidden until you reveal them, and your vault locks itself when idle.
              </p>
            </div>
          </div>
          <div className="bg-vault-card/50 border border-vault-border rounded-xl p-5 flex gap-4 items-start hover:border-vault-borderAccent hover:bg-vault-card transition-all duration-300">
            <span className="text-2xl mt-0.5">
              🛡️
            </span>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                HTTPS + CSP + HSTS
              </h3>
              <p className="text-[13px] text-vault-textMuted leading-relaxed">
                Full web security headers. Rate limiting. Input validation. XSS/CSRF protection.
              </p>
            </div>
          </div>
        </div>
        <Reveal delay={300}>
          <div className="text-center mt-10">
            <a className="text-vault-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all text-sm group" href="#">
              Full security architecture{" "}
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
