import binance from "@/images/binance.png";
import bitget from "@/images/bitget.png";
import coinbase from "@/images/coinbase.png";
import exodus from "@/images/exodus.png";
import walletconnect from "@/images/walletconnect.png";
import metamask from "@/images/metamask.png";
import trezor from "@/images/trezor.png";
import trust from "@/images/trust.png";
import type { WalletBrand } from "@/types/vault";

/**
 * Wallets shown in the Seed phrases grid.
 * To add a logo, put the image in src/images/, import it above and set `logo`.
 * Wallets without one show a colored monogram.
 */
export const WALLETS: WalletBrand[] = [
  { id: "metamask", name: "MetaMask", words: 12, color: "#f6851b", logo: metamask },
  { id: "trust", name: "Trust Wallet", words: 12, color: "#3375bb", logo: trust },
  { id: "coinbase", name: "Coinbase Wallet", words: 12, color: "#0052ff", logo: coinbase },
  { id: "binance", name: "Binance Wallet", words: 12, color: "#f3ba2f", logo: binance },
  { id: "bitget", name: "Bitget Wallet", words: 12, color: "#00f0ff", logo: bitget },
  { id: "exodus", name: "Exodus", words: 12, color: "#8b5cf6", logo: exodus },
  { id: "trezor", name: "Trezor", words: 24, color: "#16a34a", logo: trezor },
  { id: "walletconnect", name: "WalletConnect", words: 12, color: "#3b99fc", logo: walletconnect },
];
