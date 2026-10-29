import Image from "next/image";
import type { WalletBrand } from "@/types/vault";

/** Wallet logo, or a brand-colored monogram when no logo file is configured. */
export function WalletLogo({ wallet, size = 56 }: { wallet: WalletBrand; size?: number }) {
  if (wallet.logo) {
    // Designed logos come in mixed shapes and backgrounds; a uniform tile keeps the grid even.
    return (
      <div
        className="rounded-2xl overflow-hidden bg-white/[0.04] flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={wallet.logo}
          alt={`${wallet.name} logo`}
          width={size}
          height={size}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const initials = wallet.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-black shadow-lg shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${wallet.color}, ${wallet.color}99)`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
