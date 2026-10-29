import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";

export function Stats() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-accent/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vault-accent/20 to-transparent" />
      </div>
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 sm:gap-4">
            <Reveal>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-vault-accent transition-colors duration-500">
                  <CountUp to={256} suffix="-bit" />
                </div>
                <div className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  Encryption
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-vault-accent transition-colors duration-500">
                  <CountUp to={600} suffix="K" />
                </div>
                <div className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  PBKDF2 Rounds
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-vault-accent transition-colors duration-500">
                  <CountUp to={0} suffix="%" />
                </div>
                <div className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  Data We Can Read
                </div>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-vault-accent transition-colors duration-500">
                  <CountUp to={3} />
                </div>
                <div className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  Item Categories
                </div>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:text-vault-accent transition-colors duration-500">
                  <CountUp to={1} />
                </div>
                <div className="text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  Vault Per Member
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
