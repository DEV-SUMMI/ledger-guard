import Link from "next/link";
import { ArrowRightIcon, ShieldIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative px-6 [padding-top:calc(4rem_+_env(safe-area-inset-top))]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none [opacity:0.03]">
        <div className="[position:absolute] [inset:0] [background-image:linear-gradient(rgba(34,211,167,0.3)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(34,211,167,0.3)_1px,_transparent_1px)] [background-size:80px_80px] [animation:grid-fade_3s_ease_forwards]" />
      </div>
      <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full pointer-events-none [background:radial-gradient(circle,_rgba(34,211,167,0.08)_0%,_transparent_60%)] [animation:float-slow_20s_ease-in-out_infinite]" />
      <div className="absolute top-[50%] right-[10%] w-[300px] h-[300px] rounded-full pointer-events-none [background:radial-gradient(circle,_rgba(14,165,233,0.06)_0%,_transparent_60%)] [animation:float-slow_25s_ease-in-out_infinite_3s]" />
      <div className="absolute bottom-[20%] left-[20%] w-[250px] h-[250px] pointer-events-none [background:radial-gradient(circle,_rgba(168,85,247,0.04)_0%,_transparent_60%)] [animation:float-reverse_22s_ease-in-out_infinite_1s]" />
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none [background:linear-gradient(135deg,_rgba(34,211,167,0.06),_rgba(14,165,233,0.04))] [animation:morph_15s_ease-in-out_infinite] [filter:blur(40px)]" />
      <div className="absolute pointer-events-none rounded-full [width:3px] [height:3px] [left:10%] [bottom:-5%] [background:rgba(34,211,167,0.5)] [animation:drift-up_12s_linear_infinite_0s]" />
      <div className="absolute pointer-events-none rounded-full [width:5px] [height:5px] [left:21%] [bottom:-5%] [background:rgba(14,165,233,0.4)] [animation:drift-up-2_15s_linear_infinite_2s]" />
      <div className="absolute pointer-events-none rounded-full [width:7px] [height:7px] [left:32%] [bottom:-5%] [background:rgba(34,211,167,0.5)] [animation:drift-up_18s_linear_infinite_4s]" />
      <div className="absolute pointer-events-none rounded-full [width:3px] [height:3px] [left:43%] [bottom:-5%] [background:rgba(14,165,233,0.4)] [animation:drift-up-2_21s_linear_infinite_6s]" />
      <div className="absolute pointer-events-none rounded-full [width:5px] [height:5px] [left:54%] [bottom:-5%] [background:rgba(34,211,167,0.5)] [animation:drift-up_24s_linear_infinite_8s]" />
      <div className="absolute pointer-events-none rounded-full [width:7px] [height:7px] [left:65%] [bottom:-5%] [background:rgba(14,165,233,0.4)] [animation:drift-up-2_27s_linear_infinite_10s]" />
      <div className="absolute pointer-events-none rounded-full [width:3px] [height:3px] [left:76%] [bottom:-5%] [background:rgba(34,211,167,0.5)] [animation:drift-up_30s_linear_infinite_12s]" />
      <div className="absolute pointer-events-none rounded-full [width:5px] [height:5px] [left:87%] [bottom:-5%] [background:rgba(14,165,233,0.4)] [animation:drift-up-2_33s_linear_infinite_14s]" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-[0.04] [animation:spin-slow_60s_linear_infinite]">
        <svg viewBox="0 0 600 600" fill="none" stroke="rgba(34,211,167,0.5)" strokeWidth="5">
          <polygon points="300,50 520,175 520,425 300,550 80,425 80,175" />
        </svg>
      </div>
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] pointer-events-none opacity-[0.03] [animation:spin-reverse_45s_linear_infinite]">
        <svg viewBox="0 0 450 450" fill="none" stroke="rgba(14,165,233,0.5)" strokeWidth="5">
          <polygon points="225,30 400,130 400,320 225,420 50,320 50,130" />
        </svg>
      </div>
      <div className="text-center max-w-[820px] relative z-10 stagger-children">
        <div className="inline-flex items-center gap-2 bg-vault-accentDim border border-vault-accent/20 rounded-full px-5 py-2 mb-8 text-[13px] font-semibold text-vault-accent [animation:pulse-glow_4s_ease-in-out_infinite]">
          <ShieldIcon size={24} />
          {" "}Private · Encrypted · Yours Alone
        </div>
        <h1 className="text-[clamp(38px,6.5vw,72px)] font-black text-white leading-[1.06] tracking-[-2px] mb-6">
          Store Your Secrets.
          <br />
          <span className="text-shimmer">
            Keep Them Yours.
          </span>
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] text-vault-textMuted leading-relaxed max-w-[580px] mx-auto mb-10">
          An encrypted vault for seed phrases, private keys and API keys. Everything is encrypted on your device, and every member gets their own private vault.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link className="group bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold text-base px-9 py-4 rounded-xl inline-flex items-center gap-2 hover:opacity-90 transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(34,211,167,0.2)]" href="/login">
            Get Started{" "}
            <span className="group-hover:translate-x-1 transition-transform">
              <ArrowRightIcon size={20} />
            </span>
          </Link>
          <a className="bg-white/5 border border-white/10 text-vault-text font-semibold text-base px-9 py-4 rounded-xl hover:bg-white/10 transition-all hover:scale-[1.03] hover:border-white/20" href="#how-it-works">
            How It Works
          </a>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[11px] text-vault-textFaint tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full [animation:drift-up_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
