"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { CategoryIcon } from "@/components/dashboard/icons";
import { GoogleIcon, KeyIcon, LockIcon, LogoIcon } from "@/components/icons";
import { CATEGORIES, CATEGORY_LABEL, VAULT_ITEMS } from "@/lib/vault-data";
import { cn } from "@/lib/utils";
import type { DemoScreen, DemoStep } from "@/types/content";
import type { CategoryId, VaultItem } from "@/types/vault";

import { BRAND } from "@/lib/brand";
const STEP_MS = 4500;
const TICK_MS = 25;

const STEPS: DemoStep[] = [
  { label: "Sign In", desc: "Encrypted on your device", color: "#22d3a7", screen: "signin" },
  { label: "Add an Item", desc: "Seed phrases, keys & notes", color: "#06b6d4", screen: "add" },
  { label: "Private by Default", desc: "Only you can see it", color: "#8b5cf6", screen: "privacy" },
  { label: "View Securely", desc: "Reveal only when needed", color: "#f59e0b", screen: "reveal" },
];

const ICON_BY_CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.icon]));

const ADD_CATEGORIES: { id: CategoryId; short: string; example: string }[] = [
  { id: "seed", short: "Seed", example: "Ledger — main seed backup" },
  { id: "privatekey", short: "Key", example: "Cold wallet private key" },
  { id: "apikey", short: "API", example: "Binance read-only API" },
];

const DEMO_ITEMS = VAULT_ITEMS.slice(0, 4);

/** Who can read the items in a member's vault: only that member. */
const VISIBILITY = [
  { who: "You", note: "Your login, your key", allowed: true },
  { who: "Teammates", note: "Each has their own vault", allowed: false },
  { who: "Admins", note: "See account status only", allowed: false },
];

const AUTO_LOCK = ["1m", "5m", "15m", "1h"];

const SETTINGS_ROWS = [
  { icon: "🔐", label: "Encryption", value: "AES-256" },
  { icon: "👤", label: "Vault", value: "Personal" },
  { icon: "🛡️", label: "Two-factor", value: "On" },
  { icon: "🎨", label: "Theme", value: "Dark" },
];

const NAV_TABS: { label: string; screen: DemoScreen; active: DemoScreen[] }[] = [
  { label: "Vault", screen: "items", active: ["signin", "items", "reveal"] },
  { label: "Add", screen: "add", active: ["add"] },
  { label: "Privacy", screen: "privacy", active: ["privacy"] },
  { label: "Settings", screen: "settings", active: ["settings"] },
];

const cardCls = "bg-white/[0.02] border border-white/[0.04] rounded-2xl";
const sectionLabelCls = "text-[10px] text-zinc-600 font-bold uppercase tracking-wider";
const chipCls = "flex-1 text-center py-2 rounded-xl text-[11px] font-bold";
const chipActiveCls = "bg-vault-accent/15 text-vault-accent border border-vault-accent/25";
const chipIdleCls = "bg-white/[0.02] text-zinc-600 border border-white/[0.04]";
const primaryBtnCls =
  "bg-gradient-to-r from-vault-accent to-vault-blue rounded-2xl py-3 text-[13px] font-bold text-black cursor-pointer hover:opacity-90 active:scale-[0.96] transition-all";

export function AppDemo() {
  const [{ screen, progress }, setPlayback] = useState<{ screen: DemoScreen; progress: number }>({
    screen: "signin",
    progress: 0,
  });
  const [autoplay, setAutoplay] = useState(true);
  const [category, setCategory] = useState<CategoryId>("seed");
  const [autoLock, setAutoLock] = useState("5m");
  const [item, setItem] = useState<VaultItem>(DEMO_ITEMS[0]);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeStep = STEPS.findIndex((s) => s.screen === screen);
  const draftTitle = ADD_CATEGORIES.find((c) => c.id === category)?.example ?? "";

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setPlayback((cur) => {
        const next = cur.progress + (TICK_MS / STEP_MS) * 100;
        if (next < 100) return { ...cur, progress: next };
        const i = STEPS.findIndex((s) => s.screen === cur.screen);
        return { screen: STEPS[(i + 1) % STEPS.length].screen, progress: 0 };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [autoplay]);

  const go = (next: DemoScreen) => {
    setAutoplay(false);
    setRevealed(false);
    setPlayback({ screen: next, progress: 0 });
  };

  const copy = () => {
    // Demo only: there is no real secret to copy.
    setAutoplay(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-[1050px] mx-auto">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">How It Works</h2>
          <p className="text-base text-vault-textMuted text-center max-w-[460px] mx-auto mb-14">
            Tap through the app — every button works
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Step list */}
            <div className="w-full lg:w-[270px] flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-hide">
              {STEPS.map((step, i) => {
                const active = i === activeStep;
                return (
                  <button
                    key={step.label}
                    onClick={() => go(step.screen)}
                    className="relative flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all shrink-0 lg:w-full overflow-hidden"
                    style={{
                      background: active ? "rgba(255,255,255,0.03)" : "transparent",
                      border: `1px solid ${active ? `${step.color}20` : "transparent"}`,
                    }}
                  >
                    {active && (
                      <div
                        className={cn("absolute bottom-0 left-0 h-[3px] rounded-full", !autoplay && "w-full")}
                        style={{
                          background: step.color,
                          ...(autoplay ? { width: `${progress}%`, transition: `width ${TICK_MS}ms linear` } : {}),
                        }}
                      />
                    )}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-all"
                      style={
                        active
                          ? { background: `${step.color}15`, border: `1.5px solid ${step.color}30`, transform: "scale(1.05)", color: step.color }
                          : { background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.04)", transform: "scale(1)", color: "#555" }
                      }
                    >
                      <span className="text-sm font-extrabold font-mono">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", active ? "text-white" : "text-zinc-500")}>{step.label}</span>
                        {active && (
                          <span
                            className="w-1.5 h-1.5 rounded-full [animation:dotP_1.5s_ease_infinite]"
                            style={{ background: step.color }}
                          />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-600 truncate max-w-[160px]">{step.desc}</div>
                    </div>
                  </button>
                );
              })}
              {!autoplay && (
                <button
                  onClick={() => {
                    setPlayback((cur) => ({ screen: activeStep === -1 ? "signin" : cur.screen, progress: 0 }));
                    setAutoplay(true);
                  }}
                  className="text-[11px] text-zinc-600 hover:text-vault-accent transition px-4 py-1"
                >
                  ▶ Auto-play
                </button>
              )}
            </div>

            {/* Phone */}
            <div className="flex-1 flex justify-center">
              <div className="relative [animation:floatP_6s_ease-in-out_infinite]">
                <div className="w-[280px] sm:w-[300px] h-[560px] sm:h-[580px] bg-[#08080f] border border-white/[0.07] rounded-[2.5rem] overflow-hidden flex flex-col [box-shadow:0_40px_100px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]">
                  {/* Status bar */}
                  <div className="relative flex items-center justify-between px-7 pt-3 pb-1.5">
                    <span className="text-[10px] text-zinc-700 font-mono">9:41</span>
                    <div className="absolute left-1/2 -translate-x-1/2 w-[80px] h-[24px] bg-black rounded-full" />
                    <div className="flex items-center gap-1">
                      <svg width="14" height="10" viewBox="0 0 14 10">
                        <rect x="0" y="4" width="2" height="6" rx=".5" fill="#555" />
                        <rect x="3" y="2" width="2" height="8" rx=".5" fill="#555" />
                        <rect x="6" y="0" width="2" height="10" rx=".5" fill="#555" />
                        <rect x="9" y="0" width="2" height="10" rx=".5" fill="#555" />
                      </svg>
                      <div className="w-5 h-2.5 rounded-xs border border-zinc-600">
                        <div className="w-3 h-1.5 bg-zinc-500 rounded-xs m-[1px]" />
                      </div>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="flex items-center justify-between px-5 py-2 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <span className="text-vault-accent">
                        <LogoIcon size={24} />
                      </span>
                      <span className="text-[13px] font-bold text-white">{BRAND.name}</span>
                    </div>
                    <div
                      onClick={() => go("settings")}
                      className="w-7 h-7 rounded-full bg-vault-accent/10 flex items-center justify-center cursor-pointer hover:bg-vault-accent/20 transition"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-vault-accent/40" />
                    </div>
                  </div>

                  {/* Screen */}
                  <div key={screen} className="flex-1 overflow-y-auto overflow-x-hidden [animation:phoneIn_.35s_cubic-bezier(.16,1,.3,1)]">
                    {screen === "signin" && (
                      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vault-accent/20 to-vault-blue/10 flex items-center justify-center">
                          <KeyIcon size={20} />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-white mb-1">{BRAND.name}</div>
                          <div className="text-[13px] text-zinc-500">Your own private vault</div>
                        </div>
                        {/* Visual-only mock button: no real authentication */}
                        <button
                          onClick={() => go("items")}
                          className="w-full max-w-[240px] bg-white/[0.05] border border-white/[0.08] rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:bg-white/[0.08] active:scale-[0.96] transition-all cursor-pointer"
                        >
                          <GoogleIcon size={20} />
                          <span className="text-[13px] font-bold text-white">Continue with Google</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <LockIcon size={24} />
                          <span className="text-[10px] text-zinc-700">Encrypted on your device</span>
                        </div>
                      </div>
                    )}

                    {screen === "items" && (
                      <div className="flex flex-col h-full px-5 py-4">
                        <div className={cn(sectionLabelCls, "mb-3")}>Your Vault</div>
                        <div className={cn(cardCls, "p-3 mb-4 flex justify-between text-[11px]")}>
                          <span className="text-zinc-500">{VAULT_ITEMS.length} items</span>
                          <span className="text-vault-accent font-bold">100% encrypted</span>
                        </div>
                        <div className={cn(sectionLabelCls, "mb-2")}>Recent</div>
                        {DEMO_ITEMS.map((it) => (
                          <div
                            key={it.id}
                            onClick={() => {
                              setItem(it);
                              go("reveal");
                            }}
                            className="flex items-center gap-3 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] rounded-lg px-1 cursor-pointer active:scale-[0.98] transition-all"
                          >
                            <div className="w-9 h-9 rounded-xl bg-vault-accent/10 flex items-center justify-center text-vault-accent shrink-0">
                              <CategoryIcon name={ICON_BY_CAT[it.category]} size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-white truncate">{it.title}</div>
                              <div className="text-[10px] text-zinc-600 truncate">{CATEGORY_LABEL[it.category]}</div>
                            </div>
                            <span className="text-[11px] text-zinc-700 tracking-[0.15em]">••••</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {screen === "add" && (
                      <div className="flex flex-col h-full px-5 py-4">
                        <div className={cn(sectionLabelCls, "mb-3")}>New Item</div>
                        <div className={cn(cardCls, "p-3.5 mb-3")}>
                          <div className="text-[9px] text-zinc-600 mb-2">Type</div>
                          <div className="flex gap-1.5">
                            {ADD_CATEGORIES.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setAutoplay(false);
                                  setCategory(c.id);
                                }}
                                className={cn(
                                  chipCls,
                                  "cursor-pointer active:scale-[0.93] transition-all",
                                  c.id === category
                                    ? cn(chipActiveCls, "shadow-[0_0_10px_rgba(34,211,167,0.08)]")
                                    : cn(chipIdleCls, "hover:border-white/[0.08]"),
                                )}
                              >
                                {c.short}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={cn(cardCls, "p-3.5 mb-3")}>
                          <div className="text-[9px] text-zinc-600 mb-1">Title</div>
                          <div className="text-[12px] text-white font-semibold truncate">{draftTitle}</div>
                        </div>
                        <div className={cn(cardCls, "p-3.5 mb-3")}>
                          <div className="text-[9px] text-zinc-600 mb-1">{CATEGORY_LABEL[category]}</div>
                          <div className="text-[13px] text-zinc-500 font-mono tracking-[0.2em]">••••••••••••</div>
                        </div>
                        <div className={cn(cardCls, "p-3 mb-3 flex items-center gap-2")}>
                          <span className="text-vault-accent">
                            <LockIcon size={18} />
                          </span>
                          <span className="text-[11px] text-zinc-500">Encrypted on this device before upload</span>
                        </div>
                        <div onClick={() => go("privacy")} className={cn("mt-auto text-center", primaryBtnCls)}>
                          Save to Vault
                        </div>
                      </div>
                    )}

                    {screen === "privacy" && (
                      <div className="flex flex-col h-full px-5 py-4">
                        <div className={cn(sectionLabelCls, "mb-3")}>Privacy</div>
                        <div className={cn(cardCls, "p-3.5 mb-4 flex items-center gap-3")}>
                          <span className="text-vault-accent">
                            <LockIcon size={22} />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[12px] text-white font-semibold truncate">{draftTitle}</div>
                            <div className="text-[10px] text-zinc-600">Saved to your personal vault</div>
                          </div>
                        </div>
                        <div className={cn(sectionLabelCls, "mb-2")}>Who can read it</div>
                        {VISIBILITY.map((v) => (
                          <div key={v.who} className="flex items-center gap-3 py-2.5 border-b border-white/[0.02] px-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] text-zinc-300">{v.who}</div>
                              <div className="text-[10px] text-zinc-600 truncate">{v.note}</div>
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-lg",
                                v.allowed ? "text-vault-accent bg-vault-accent/10" : "text-zinc-500 bg-white/[0.04]",
                              )}
                            >
                              {v.allowed ? "Yes" : "No"}
                            </span>
                          </div>
                        ))}
                        <div className={cn(cardCls, "p-3.5 mt-4")}>
                          <div className="text-[9px] text-zinc-600 mb-2">Auto-lock after</div>
                          <div className="flex gap-1.5">
                            {AUTO_LOCK.map((t) => (
                              <div
                                key={t}
                                onClick={() => {
                                  setAutoplay(false);
                                  setAutoLock(t);
                                }}
                                className={cn(
                                  chipCls,
                                  "cursor-pointer active:scale-[0.93] transition-all",
                                  t === autoLock ? chipActiveCls : cn(chipIdleCls, "hover:border-white/[0.08]"),
                                )}
                              >
                                {t}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div onClick={() => go("reveal")} className={cn("mt-auto text-center", primaryBtnCls)}>
                          Continue
                        </div>
                      </div>
                    )}

                    {screen === "reveal" && (
                      <div className="flex flex-col h-full px-5 py-4">
                        <div className={cn(sectionLabelCls, "mb-3")}>Item</div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-vault-accent/10 flex items-center justify-center text-vault-accent shrink-0">
                            <CategoryIcon name={ICON_BY_CAT[item.category]} size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-white truncate">{item.title}</div>
                            <div className="text-[10px] text-zinc-600 truncate">
                              {CATEGORY_LABEL[item.category]} · {item.hint}
                            </div>
                          </div>
                        </div>
                        <div className={cn(cardCls, "p-3.5 mb-3")}>
                          <div className="text-[9px] text-zinc-600 mb-1.5">Value</div>
                          <div
                            className={cn(
                              "text-[12px] font-mono mb-3 truncate",
                              revealed ? "text-zinc-300" : "text-zinc-500 tracking-[0.2em]",
                            )}
                          >
                            {revealed ? "demo value — not a real secret" : "••••••••••••••••"}
                          </div>
                          <div className="flex gap-2">
                            <div
                              onClick={() => {
                                setAutoplay(false);
                                setRevealed((r) => !r);
                              }}
                              className={cn(chipCls, "cursor-pointer active:scale-[0.93] transition-all", revealed ? chipActiveCls : chipIdleCls)}
                            >
                              {revealed ? "Hide" : "Reveal"}
                            </div>
                            <div
                              onClick={copy}
                              className={cn(chipCls, "cursor-pointer active:scale-[0.93] transition-all", copied ? chipActiveCls : chipIdleCls)}
                            >
                              {copied ? "Copied!" : "Copy"}
                            </div>
                          </div>
                        </div>
                        <div className={cn(cardCls, "p-3 mb-3 flex flex-col gap-2")}>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Visible to</span>
                            <span className="text-white font-bold">Only you</span>
                          </div>
                          <div className="h-px bg-white/[0.03]" />
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Auto-hide</span>
                            <span className="text-white font-mono font-bold">30s</span>
                          </div>
                          <div className="h-px bg-white/[0.03]" />
                          <div className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">Access logged</span>
                            <span className="text-vault-accent font-bold">Yes</span>
                          </div>
                        </div>
                        <div onClick={() => go("items")} className={cn("mt-auto text-center", primaryBtnCls)}>
                          Done
                        </div>
                      </div>
                    )}

                    {screen === "settings" && (
                      <div className="flex flex-col h-full px-5 py-4">
                        <div className={cn(sectionLabelCls, "mb-4")}>Settings</div>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vault-accent/20 to-vault-blue/10 flex items-center justify-center text-lg">
                            👤
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-white">you@example.com</div>
                            <div className="text-[10px] text-zinc-600">Personal vault</div>
                          </div>
                        </div>
                        {SETTINGS_ROWS.map((row) => (
                          <div key={row.label} className="flex items-center gap-3 py-3 border-b border-white/[0.02]">
                            <span className="text-base">{row.icon}</span>
                            <span className="flex-1 text-[12px] text-zinc-400">{row.label}</span>
                            <span className="text-[12px] text-white font-semibold">{row.value}</span>
                          </div>
                        ))}
                        <div
                          onClick={() => go("signin")}
                          className="mt-auto bg-red-500/10 border border-red-500/20 rounded-2xl py-3 text-center text-[12px] font-bold text-red-400 cursor-pointer hover:bg-red-500/15 active:scale-[0.96] transition-all"
                        >
                          Sign Out
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom tab bar */}
                  <div className="flex items-center justify-around py-3 border-t border-white/[0.03] bg-[#06060c]">
                    {NAV_TABS.map((tab) => {
                      const active = tab.active.includes(screen);
                      return (
                        <div
                          key={tab.label}
                          onClick={() => go(tab.screen)}
                          className="flex flex-col items-center gap-1 cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-white/[0.03] active:scale-[0.92] transition-all"
                        >
                          <div className={cn("transition-colors", active ? "text-vault-accent" : "text-zinc-700 group-hover:text-zinc-500")}>
                            <TabIcon label={tab.label} />
                          </div>
                          <span className={cn("text-[9px] font-bold tracking-wide", active ? "text-vault-accent" : "text-zinc-700")}>
                            {tab.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center py-2">
                    <div className="w-[100px] h-[4px] rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TabIcon({ label }: { label: string }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  switch (label) {
    case "Vault":
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "Add":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "Privacy":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
  }
}
