import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ArrowRightIcon } from "@/components/icons";

export function Cta() {
  return (
    <section className="py-28 px-6 relative">
      <Reveal>
        <div className="max-w-[700px] mx-auto text-center relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-vault-accent/[0.08] to-vault-blue/[0.06] border border-vault-accent/[0.12] rounded-3xl" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none [background:radial-gradient(circle,_rgba(34,211,167,0.08)_0%,_transparent_60%)] [animation:float-slow_15s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] pointer-events-none [background:radial-gradient(circle,_rgba(14,165,233,0.06)_0%,_transparent_60%)] [animation:float-reverse_18s_ease-in-out_infinite_2s]" />
          <div className="relative z-10 py-20 px-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Secure Your Secrets?
            </h2>
            <p className="text-base text-vault-textMuted mb-8">
              Set up your private vault in under 3 minutes.
            </p>
            <Link className="group bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-base px-10 py-4 rounded-xl inline-flex items-center gap-2 hover:opacity-90 transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(34,211,167,0.25)]" href="/login">
              Launch App{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                <ArrowRightIcon size={20} />
              </span>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
