"use client";

import { AlertCircle, ArrowLeft, Eye, EyeOff, LoaderCircle, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { homeFor, signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The password is the root of the vault's encryption, so it needs real length.
const MIN_PASSWORD = 12;

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });

  const ids = {
    name: useId(),
    email: useId(),
    password: useId(),
    confirm: useId(),
  };

  const isSignup = mode === "signup";

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setNotice(null);
  }

  function update(field: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (isSignup && values.name.trim().length < 2) next.name = "Enter your name.";
    if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (isSignup && values.password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (!isSignup && values.password.length === 0) next.password = "Enter your password.";
    if (isSignup && values.confirm !== values.password) next.confirm = "Passwords don't match.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setNotice(null);
    try {
      const user = isSignup
        ? await signUp({ name: values.name, email: values.email, password: values.password })
        : await signIn({ email: values.email, password: values.password });
      setValues((v) => ({ ...v, password: "", confirm: "" }));
      router.replace(homeFor(user));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="lg:hidden flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <span className="text-vault-accent">
            <Lock size={22} />
          </span>
          <span className="text-lg font-extrabold text-white tracking-tight">Welcome</span>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">
        {isSignup ? "Create your vault" : "Welcome back"}
      </h1>
      <p className="text-sm text-vault-textMuted mb-7">
        {isSignup ? "Set up an account to start storing securely." : "Sign in to unlock your vault."}
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-black/20 rounded-xl p-1 mb-6" role="tablist">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
              mode === m ? "bg-vault-accent/15 text-vault-accent" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {isSignup && (
          <Field
            id={ids.name}
            label="Name"
            icon={<User size={16} />}
            error={errors.name}
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(v) => update("name", v)}
          />
        )}

        <Field
          id={ids.email}
          label="Email"
          icon={<Mail size={16} />}
          error={errors.email}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(v) => update("email", v)}
        />

        <div>
          <label htmlFor={ids.password} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
              <Lock size={16} />
            </span>
            <input
              id={ids.password}
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : "Your password"}
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              className={cn(
                "w-full bg-[#0e0e14] border rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-vault-textFaint outline-none transition-all focus:bg-[#101018]",
                errors.password ? "border-red-500/50 focus:border-red-500/60" : "border-vault-border focus:border-vault-accent/40",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 hover:text-vault-accent transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-[12px] text-red-400 mt-1.5">{errors.password}</p>}
          {isSignup && !errors.password && (
            <p className="text-[12px] text-zinc-600 mt-1.5">
              This password encrypts your vault. We never see it and can&apos;t reset it — keep it safe.
            </p>
          )}
        </div>

        {isSignup && (
          <Field
            id={ids.confirm}
            label="Confirm password"
            icon={<Lock size={16} />}
            error={errors.confirm}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirm}
            onChange={(v) => update("confirm", v)}
          />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-vault-accent to-vault-blue text-vault-bg font-bold py-3 rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60 shadow-[0_8px_24px_rgba(34,211,167,0.22)] mt-1"
        >
          {submitting && <LoaderCircle size={16} className="animate-spin" />}
          {submitting ? (isSignup ? "Securing your vault…" : "Unlocking…") : isSignup ? "Create account" : "Log in"}
        </button>

        {notice && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-300"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </form>

      <p className="text-center text-[13px] text-zinc-600 mt-6">
        {isSignup ? "Already have an account? " : "New here? "}
        <button
          type="button"
          onClick={() => switchMode(isSignup ? "login" : "signup")}
          className="font-semibold text-vault-accent hover:text-vault-accent/80 transition-colors"
        >
          {isSignup ? "Log in" : "Create one"}
        </button>
      </p>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ id, label, icon, error, type, autoComplete, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-zinc-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">{icon}</span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-[#0e0e14] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-vault-textFaint outline-none transition-all focus:bg-[#101018]",
            error ? "border-red-500/50 focus:border-red-500/60" : "border-vault-border focus:border-vault-accent/40",
          )}
        />
      </div>
      {error && <p className="text-[12px] text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}
